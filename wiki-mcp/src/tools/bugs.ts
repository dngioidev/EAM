import { getPool } from "../db.js";

type ToolResult = { content: Array<{ type: "text"; text: string }>; isError?: boolean };

function ok(data: unknown): ToolResult {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function fail(msg: string): ToolResult {
  return { content: [{ type: "text", text: msg }], isError: true };
}

const VALID_SEVERITY = ["critical", "high", "medium", "low"] as const;
const VALID_STATUS   = ["open", "in_progress", "fixed", "wontfix", "deferred"] as const;

type Severity = typeof VALID_SEVERITY[number];
type BugStatus = typeof VALID_STATUS[number];

function validSeverity(v: unknown): v is Severity {
  return VALID_SEVERITY.includes(v as Severity);
}

function validStatus(v: unknown): v is BugStatus {
  return VALID_STATUS.includes(v as BugStatus);
}

async function nextBugId(pool: ReturnType<typeof getPool>): Promise<string> {
  const { rows } = await pool.query(
    "SELECT MAX(CAST(REPLACE(id, 'BUG-', '') AS INTEGER)) AS n FROM wiki.bugs"
  );
  const n = (rows[0]?.n ?? 0) + 1;
  return "BUG-" + String(n).padStart(4, "0");
}

async function auditLog(
  pool: ReturnType<typeof getPool>,
  targetId: string,
  tool: string,
  patch: unknown
): Promise<void> {
  await pool.query(
    `INSERT INTO wiki.audit_log (tool, author, target_type, target_id, changed)
     VALUES ($1, 'vibe-agent', 'bug', $2, $3::jsonb)`,
    [tool, targetId, JSON.stringify(patch)]
  );
}

export async function handleBugTool(
  name: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  const pool = getPool();

  switch (name) {
    case "wiki_bug_create": {
      const { title, description, severity, feature, sprint, reporter } = args;
      if (!title || typeof title !== "string") return fail("title is required");
      if (!validSeverity(severity)) return fail(`severity must be one of: ${VALID_SEVERITY.join(", ")}`);

      const id = await nextBugId(pool);
      const today = new Date().toISOString().split("T")[0];

      const bugData = {
        meta: {
          id,
          title: String(title),
          status: "open" as BugStatus,
          severity,
          reporter: reporter ?? "unknown",
          created_at: today,
          updated_at: today,
        },
        content: {
          description: description ?? "",
          feature: feature ?? null,
          sprint: sprint ?? null,
          steps_to_reproduce: [],
          expected: "",
          actual: "",
          fix_notes: "",
        },
      };

      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(
          `INSERT INTO wiki.bugs (id, title, severity, status, feature, sprint, description, data, created_at)
           VALUES ($1, $2, $3, 'open', $4, $5, $6, $7::jsonb, now())`,
          [
            id,
            String(title),
            String(severity),
            (feature as string | undefined) ?? null,
            (sprint as string | undefined) ?? null,
            (description as string | undefined) ?? null,
            JSON.stringify(bugData),
          ]
        );
        await auditLog(pool, id, "wiki_bug_create", bugData);
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }

      return ok({ ok: true, id, created_at: today });
    }

    case "wiki_bug_update": {
      const { id, patch } = args;
      if (!id) return fail("id is required");
      if (!patch || typeof patch !== "object" || Array.isArray(patch))
        return fail("patch must be an object");

      const { rows } = await pool.query(
        "SELECT data FROM wiki.bugs WHERE id = $1", [String(id)]
      );
      if (!rows[0]) return fail(`Bug '${id}' not found`);

      const p = patch as Record<string, unknown>;

      if (p.severity !== undefined && !validSeverity(p.severity))
        return fail(`severity must be one of: ${VALID_SEVERITY.join(", ")}`);
      if (p.status !== undefined && !validStatus(p.status))
        return fail(`status must be one of: ${VALID_STATUS.join(", ")}`);

      const current = rows[0].data as Record<string, unknown>;
      const today = new Date().toISOString().split("T")[0];

      function deepMerge(t: Record<string, unknown>, s: Record<string, unknown>): Record<string, unknown> {
        const r = { ...t };
        for (const [k, v] of Object.entries(s)) {
          if (v !== null && typeof v === "object" && !Array.isArray(v) &&
              t[k] !== null && typeof t[k] === "object" && !Array.isArray(t[k])) {
            r[k] = deepMerge(t[k] as Record<string, unknown>, v as Record<string, unknown>);
          } else {
            r[k] = v;
          }
        }
        return r;
      }

      const merged = deepMerge(current, p) as Record<string, unknown>;
      if (merged.meta && typeof merged.meta === "object") {
        (merged.meta as Record<string, unknown>).updated_at = today;
      }

      const meta = merged.meta as Record<string, unknown> | undefined;

      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(
          `UPDATE wiki.bugs SET
            data = $1::jsonb,
            title    = COALESCE($2, title),
            severity = COALESCE($3, severity),
            status   = COALESCE($4, status),
            description = COALESCE($5, description),
            updated_at = now()
          WHERE id = $6`,
          [
            JSON.stringify(merged),
            (p.title as string | undefined) ?? (meta?.title as string | undefined) ?? null,
            (p.severity as string | undefined) ?? null,
            (p.status as string | undefined) ?? null,
            ((merged.content as Record<string, unknown> | undefined)?.description as string | undefined) ?? null,
            String(id),
          ]
        );
        await auditLog(pool, String(id), "wiki_bug_update", patch);
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }

      return ok({ ok: true, id, updated_at: today });
    }

    default:
      return fail(`Unknown bug tool: ${name}`);
  }
}
