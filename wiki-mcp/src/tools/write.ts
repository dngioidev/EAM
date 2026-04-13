import { getDb } from "../db.js";

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

function auditLog(
  db: ReturnType<typeof getDb>,
  table: string,
  row_id: string,
  action: string,
  patch: unknown
): void {
  db.prepare(
    "INSERT INTO audit_log (table_name, row_id, action, patch, ts) VALUES (?, ?, ?, ?, datetime('now'))"
  ).run(table, row_id, action, JSON.stringify(patch));
}

export async function handleWriteTool(
  name: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  const db = getDb();

  switch (name) {
    case "wiki_feature_update": {
      const { id, patch } = args;
      if (!id) return fail("id is required");
      if (!patch || typeof patch !== "object" || Array.isArray(patch))
        return fail("patch must be an object");

      const existing = db
        .prepare("SELECT data FROM features WHERE id = ?")
        .get(String(id)) as { data: string } | null;
      if (!existing) return fail(`Feature '${id}' not found`);

      const current = JSON.parse(existing.data) as Record<string, unknown>;
      const today = new Date().toISOString().split("T")[0];
      const merged = deepMerge(current, patch as Record<string, unknown>);
      if (merged.meta && typeof merged.meta === "object") {
        (merged.meta as Record<string, unknown>).last_updated = today;
      }

      const meta = merged.meta as Record<string, unknown> | undefined;
      const qf = merged.quick_facts as Record<string, unknown> | undefined;

      db.transaction(() => {
        db.prepare(
          `UPDATE features SET
            data = ?,
            title = ?,
            status = ?,
            sprint = ?,
            domain = ?,
            updated_at = datetime('now')
          WHERE id = ?`
        ).run(
          JSON.stringify(merged),
          (meta?.title as string | undefined) ?? String(id),
          (meta?.status as string | undefined) ?? null,
          (qf?.sprint as string | null | undefined) ?? null,
          (meta?.domain as string | undefined) ?? null,
          String(id)
        );
        auditLog(db, "features", String(id), "update", patch);
      })();

      return ok({ ok: true, id, updated: today });
    }

    case "wiki_task_update": {
      const { feature_id, task_id, patch } = args;
      if (!feature_id) return fail("feature_id is required");
      if (!task_id)    return fail("task_id is required");
      if (!patch || typeof patch !== "object" || Array.isArray(patch))
        return fail("patch must be an object");

      const existing = db
        .prepare("SELECT id, data FROM tasks WHERE id = ? AND feature_id = ?")
        .get(String(task_id), String(feature_id)) as { id: string; data: string } | null;
      if (!existing) return fail(`Task '${task_id}' not found in feature '${feature_id}'`);

      const current = JSON.parse(existing.data) as Record<string, unknown>;
      const merged = deepMerge(current, patch as Record<string, unknown>);
      const p = patch as Record<string, unknown>;

      db.transaction(() => {
        db.prepare(
          `UPDATE tasks SET
            data = ?,
            status = COALESCE(?, status),
            title  = COALESCE(?, title),
            updated_at = datetime('now')
          WHERE id = ? AND feature_id = ?`
        ).run(
          JSON.stringify(merged),
          (p.status as string | undefined) ?? null,
          (p.title  as string | undefined) ?? null,
          String(task_id),
          String(feature_id)
        );
        auditLog(db, "tasks", String(task_id), "update", patch);
      })();

      return ok({ ok: true, task_id, feature_id });
    }

    case "wiki_session_log": {
      const { date, session } = args;
      if (!date)    return fail("date is required (YYYY-MM-DD)");
      if (!session) return fail("session object is required");
      if (typeof session !== "object" || Array.isArray(session))
        return fail("session must be an object");

      db.transaction(() => {
        db.prepare(
          "INSERT OR REPLACE INTO history (id, data, created_at) VALUES (?, ?, datetime('now'))"
        ).run(String(date), JSON.stringify(session));
        auditLog(db, "history", String(date), "session_log", session);
      })();

      return ok({ ok: true, date });
    }

    case "wiki_pages_update": {
      const { section, slug, patch } = args;
      if (!section) return fail("section is required");
      if (!slug)    return fail("slug is required");
      if (!patch || typeof patch !== "object" || Array.isArray(patch))
        return fail("patch must be an object");

      const existing = db
        .prepare("SELECT data FROM pages WHERE section = ? AND slug = ?")
        .get(String(section), String(slug)) as { data: string } | null;
      if (!existing) return fail(`Page '${section}/${slug}' not found`);

      const current = JSON.parse(existing.data) as Record<string, unknown>;
      const merged = deepMerge(current, patch as Record<string, unknown>);
      const p = patch as Record<string, unknown>;

      db.transaction(() => {
        db.prepare(
          `UPDATE pages SET
            title = COALESCE(?, title),
            data = ?,
            updated_at = datetime('now')
          WHERE section = ? AND slug = ?`
        ).run(
          (p.title as string | undefined) ?? null,
          JSON.stringify(merged),
          String(section),
          String(slug)
        );
        auditLog(db, "pages", `${section}/${slug}`, "update", patch);
      })();

      return ok({ ok: true, section, slug });
    }

    case "wiki_decision_create": {
      const { id, title, feature, decision } = args;
      if (!id)    return fail("id is required (e.g. 'DEC-0001')");
      if (!title) return fail("title is required");
      if (!decision || typeof decision !== "object" || Array.isArray(decision))
        return fail("decision object is required");

      db.transaction(() => {
        db.prepare(
          `INSERT OR IGNORE INTO decisions (id, title, status, feature, data, created_at, updated_at)
           VALUES (?, ?, 'accepted', ?, ?, datetime('now'), datetime('now'))`
        ).run(String(id), String(title), feature ? String(feature) : null, JSON.stringify(decision));
        auditLog(db, "decisions", String(id), "create", decision);
      })();

      return ok({ ok: true, id });
    }

    case "wiki_decision_update": {
      const { id, patch } = args;
      if (!id) return fail("id is required");
      if (!patch || typeof patch !== "object" || Array.isArray(patch))
        return fail("patch must be an object");

      const existing = db
        .prepare("SELECT data FROM decisions WHERE id = ?")
        .get(String(id)) as { data: string } | null;
      if (!existing) return fail(`Decision '${id}' not found`);

      const current = JSON.parse(existing.data) as Record<string, unknown>;
      const merged = deepMerge(current, patch as Record<string, unknown>);
      const p = patch as Record<string, unknown>;

      db.transaction(() => {
        db.prepare(
          `UPDATE decisions SET
            title = COALESCE(?, title),
            status = COALESCE(?, status),
            data = ?,
            updated_at = datetime('now')
          WHERE id = ?`
        ).run(
          (p.title as string | undefined) ?? null,
          (p.status as string | undefined) ?? null,
          JSON.stringify(merged),
          String(id)
        );
        auditLog(db, "decisions", String(id), "update", patch);
      })();

      return ok({ ok: true, id });
    }

    case "wiki_changelog_create": {
      const { version, date, sprint, summary, changelog } = args;
      if (!version) return fail("version is required (semver)");
      if (!date)    return fail("date is required (YYYY-MM-DD)");
      if (!summary) return fail("summary is required");
      if (!changelog || typeof changelog !== "object" || Array.isArray(changelog))
        return fail("changelog object is required");

      db.transaction(() => {
        db.prepare(
          `INSERT OR IGNORE INTO changelog (version, date, sprint, summary, data, created_at)
           VALUES (?, ?, ?, ?, ?, datetime('now'))`
        ).run(String(version), String(date), sprint ? String(sprint) : null, String(summary), JSON.stringify(changelog));
        auditLog(db, "changelog", String(version), "create", changelog);
      })();

      return ok({ ok: true, version });
    }

    case "wiki_changelog_update": {
      const { version, patch } = args;
      if (!version) return fail("version is required");
      if (!patch || typeof patch !== "object" || Array.isArray(patch))
        return fail("patch must be an object");

      const existing = db
        .prepare("SELECT data FROM changelog WHERE version = ?")
        .get(String(version)) as { data: string } | null;
      if (!existing) return fail(`Changelog for version '${version}' not found`);

      const current = JSON.parse(existing.data) as Record<string, unknown>;
      const merged = deepMerge(current, patch as Record<string, unknown>);
      const p = patch as Record<string, unknown>;

      db.transaction(() => {
        db.prepare(
          `UPDATE changelog SET
            summary = COALESCE(?, summary),
            data = ?,
            created_at = datetime('now')
          WHERE version = ?`
        ).run(
          (p.summary as string | undefined) ?? null,
          JSON.stringify(merged),
          String(version)
        );
        auditLog(db, "changelog", String(version), "update", patch);
      })();

      return ok({ ok: true, version });
    }

    default:
      return fail(`Unknown write tool: ${name}`);
  }
}
