import { getPool } from "../db.js";

type ToolResult = { content: Array<{ type: "text"; text: string }>; isError?: boolean };

function ok(data: unknown): ToolResult {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function fail(msg: string): ToolResult {
  return { content: [{ type: "text", text: msg }], isError: true };
}

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      target[key] !== null &&
      typeof target[key] === "object" &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(
        target[key] as Record<string, unknown>,
        value as Record<string, unknown>
      );
    } else {
      result[key] = value;
    }
  }
  return result;
}

async function auditLog(
  pool: ReturnType<typeof getPool>,
  targetType: string,
  targetId: string,
  tool: string,
  patch: unknown
): Promise<void> {
  await pool.query(
    `INSERT INTO wiki.audit_log (tool, author, target_type, target_id, changed)
     VALUES ($1, 'vibe-agent', $2, $3, $4::jsonb)`,
    [tool, targetType, targetId, JSON.stringify(patch)]
  );
}

export async function handleWriteTool(
  name: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  const pool = getPool();

  switch (name) {
    case "wiki_feature_update": {
      const { id, patch } = args;
      if (!id) return fail("id is required");
      if (!patch || typeof patch !== "object" || Array.isArray(patch))
        return fail("patch must be an object");

      const { rows } = await pool.query(
        "SELECT data FROM wiki.features WHERE id = $1", [String(id)]
      );
      if (!rows[0]) return fail(`Feature '${id}' not found`);

      const current = rows[0].data as Record<string, unknown>;
      const today = new Date().toISOString().split("T")[0];
      const merged = deepMerge(current, patch as Record<string, unknown>);
      if (merged.meta && typeof merged.meta === "object") {
        (merged.meta as Record<string, unknown>).last_updated = today;
      }

      const meta = merged.meta as Record<string, unknown> | undefined;
      const qf = merged.quick_facts as Record<string, unknown> | undefined;

      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(
          `UPDATE wiki.features SET
            data = $1::jsonb,
            title = $2,
            status = $3,
            sprint = $4,
            domain = $5,
            updated_at = now()
          WHERE id = $6`,
          [
            JSON.stringify(merged),
            (meta?.title as string | undefined) ?? String(id),
            (meta?.status as string | undefined) ?? null,
            (qf?.sprint as string | null | undefined) ?? null,
            (meta?.domain as string | undefined) ?? null,
            String(id),
          ]
        );
        await auditLog(pool, "feature", String(id), "wiki_feature_update", patch);
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }

      return ok({ ok: true, id, updated: today });
    }

    case "wiki_task_update": {
      const { feature_id, task_id, patch } = args;
      if (!feature_id) return fail("feature_id is required");
      if (!task_id)    return fail("task_id is required");
      if (!patch || typeof patch !== "object" || Array.isArray(patch))
        return fail("patch must be an object");

      const { rows } = await pool.query(
        "SELECT id FROM wiki.tasks WHERE id = $1 AND feature_id = $2",
        [String(task_id), String(feature_id)]
      );
      if (!rows[0]) return fail(`Task '${task_id}' not found in feature '${feature_id}'`);

      const p = patch as Record<string, unknown>;

      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(
          `UPDATE wiki.tasks SET
            status = COALESCE($1, status),
            title  = COALESCE($2, title),
            priority = COALESCE($3, priority),
            size   = COALESCE($4, size),
            notes  = COALESCE($5, notes),
            updated_at = now()
          WHERE id = $6 AND feature_id = $7`,
          [
            (p.status as string | undefined) ?? null,
            (p.title as string | undefined) ?? null,
            (p.priority as string | undefined) ?? null,
            (p.size as string | undefined) ?? null,
            (p.notes as string | undefined) ?? null,
            String(task_id),
            String(feature_id),
          ]
        );
        await auditLog(pool, "task", String(task_id), "wiki_task_update", patch);
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }

      return ok({ ok: true, task_id, feature_id });
    }

    case "wiki_session_log": {
      const { date, session } = args;
      if (!date)    return fail("date is required (YYYY-MM-DD)");
      if (!session) return fail("session object is required");
      if (typeof session !== "object" || Array.isArray(session))
        return fail("session must be an object");

      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(
          `INSERT INTO wiki.history (date, title, data, updated_at)
           VALUES ($1::date, $2, $3::jsonb, now())
           ON CONFLICT (date) DO UPDATE SET
             data = $3::jsonb,
             title = COALESCE($2, wiki.history.title),
             updated_at = now()`,
          [
            String(date),
            (session as Record<string, unknown>).title ?? null,
            JSON.stringify(session),
          ]
        );
        await auditLog(pool, "history", String(date), "wiki_session_log", session);
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }

      return ok({ ok: true, date });
    }

    case "wiki_pages_update": {
      const { section, slug, patch } = args;
      if (!section) return fail("section is required");
      if (!slug)    return fail("slug is required");
      if (!patch || typeof patch !== "object" || Array.isArray(patch))
        return fail("patch must be an object");

      const { rows } = await pool.query(
        "SELECT data FROM wiki.pages WHERE section = $1 AND slug = $2",
        [String(section), String(slug)]
      );
      if (!rows[0]) return fail(`Page '${section}/${slug}' not found`);

      const current = rows[0].data as Record<string, unknown>;
      const merged = deepMerge(current, patch as Record<string, unknown>);
      const p = patch as Record<string, unknown>;

      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(
          `UPDATE wiki.pages SET
            title = COALESCE($1, title),
            data = $2::jsonb,
            updated_at = now()
          WHERE section = $3 AND slug = $4`,
          [
            (p.title as string | undefined) ?? null,
            JSON.stringify(merged),
            String(section),
            String(slug),
          ]
        );
        await auditLog(pool, "page", `${section}/${slug}`, "wiki_pages_update", patch);
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }

      return ok({ ok: true, section, slug });
    }

    case "wiki_decision_create": {
      const { id, title, feature, decision } = args;
      if (!id)    return fail("id is required (e.g. 'DEC-0001')");
      if (!title) return fail("title is required");
      if (!decision || typeof decision !== "object" || Array.isArray(decision))
        return fail("decision object is required");

      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(
          `INSERT INTO wiki.decisions (id, title, status, feature, data, created_at, updated_at)
           VALUES ($1, $2, 'accepted', $3, $4::jsonb, now(), now())
           ON CONFLICT (id) DO NOTHING`,
          [String(id), String(title), feature ? String(feature) : null, JSON.stringify(decision)]
        );
        await auditLog(pool, "decision", String(id), "wiki_decision_create", decision);
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }

      return ok({ ok: true, id });
    }

    case "wiki_decision_update": {
      const { id, patch } = args;
      if (!id) return fail("id is required");
      if (!patch || typeof patch !== "object" || Array.isArray(patch))
        return fail("patch must be an object");

      const { rows } = await pool.query(
        "SELECT data FROM wiki.decisions WHERE id = $1", [String(id)]
      );
      if (!rows[0]) return fail(`Decision '${id}' not found`);

      const current = rows[0].data as Record<string, unknown>;
      const merged = deepMerge(current, patch as Record<string, unknown>);
      const p = patch as Record<string, unknown>;

      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(
          `UPDATE wiki.decisions SET
            title = COALESCE($1, title),
            status = COALESCE($2, status),
            data = $3::jsonb,
            updated_at = now()
          WHERE id = $4`,
          [
            (p.title as string | undefined) ?? null,
            (p.status as string | undefined) ?? null,
            JSON.stringify(merged),
            String(id),
          ]
        );
        await auditLog(pool, "decision", String(id), "wiki_decision_update", patch);
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }

      return ok({ ok: true, id });
    }

    case "wiki_changelog_create": {
      const { version, date, sprint, summary, changelog } = args;
      if (!version) return fail("version is required (semver)");
      if (!date)    return fail("date is required (YYYY-MM-DD)");
      if (!summary) return fail("summary is required");
      if (!changelog || typeof changelog !== "object" || Array.isArray(changelog))
        return fail("changelog object is required");

      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(
          `INSERT INTO wiki.changelog (version, date, sprint, summary, data, created_at)
           VALUES ($1, $2::date, $3, $4, $5::jsonb, now())
           ON CONFLICT (version) DO NOTHING`,
          [String(version), String(date), sprint ? String(sprint) : null, String(summary), JSON.stringify(changelog)]
        );
        await auditLog(pool, "changelog", String(version), "wiki_changelog_create", changelog);
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }

      return ok({ ok: true, version });
    }

    case "wiki_changelog_update": {
      const { version, patch } = args;
      if (!version) return fail("version is required");
      if (!patch || typeof patch !== "object" || Array.isArray(patch))
        return fail("patch must be an object");

      const { rows } = await pool.query(
        "SELECT data FROM wiki.changelog WHERE version = $1", [String(version)]
      );
      if (!rows[0]) return fail(`Changelog for version '${version}' not found`);

      const current = rows[0].data as Record<string, unknown>;
      const merged = deepMerge(current, patch as Record<string, unknown>);
      const p = patch as Record<string, unknown>;

      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(
          `UPDATE wiki.changelog SET
            summary = COALESCE($1, summary),
            data = $2::jsonb,
            created_at = now()
          WHERE version = $3`,
          [
            (p.summary as string | undefined) ?? null,
            JSON.stringify(merged),
            String(version),
          ]
        );
        await auditLog(pool, "changelog", String(version), "wiki_changelog_update", patch);
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }

      return ok({ ok: true, version });
    }

    default:
      return fail(`Unknown write tool: ${name}`);
  }
}
