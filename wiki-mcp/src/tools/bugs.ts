import { getDb } from "../db.js";

type ToolResult = { content: Array<{ type: "text"; text: string }>; isError?: boolean };

function ok(data: unknown): ToolResult {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function fail(msg: string): ToolResult {
  return { content: [{ type: "text", text: msg }], isError: true };
}

const VALID_SEVERITY = ["critical", "high", "medium", "low"] as const;
const VALID_STATUS   = ["open", "in_progress", "resolved", "wont_fix"] as const;

type Severity = typeof VALID_SEVERITY[number];
type BugStatus = typeof VALID_STATUS[number];

function validSeverity(v: unknown): v is Severity {
  return VALID_SEVERITY.includes(v as Severity);
}

function validStatus(v: unknown): v is BugStatus {
  return VALID_STATUS.includes(v as BugStatus);
}

function nextBugId(db: ReturnType<typeof getDb>): string {
  const row = db
    .prepare("SELECT MAX(CAST(REPLACE(id, 'BUG-', '') AS INTEGER)) AS n FROM bugs")
    .get() as { n: number | null };
  const n = (row.n ?? 0) + 1;
  return "BUG-" + String(n).padStart(4, "0");
}

function auditLog(
  db: ReturnType<typeof getDb>,
  row_id: string,
  action: string,
  patch: unknown
): void {
  db.prepare(
    "INSERT INTO audit_log (table_name, row_id, action, patch, ts) VALUES (?, ?, ?, ?, datetime('now'))"
  ).run("bugs", row_id, action, JSON.stringify(patch));
}

export async function handleBugTool(
  name: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  const db = getDb();

  switch (name) {
    case "wiki_bug_create": {
      const { title, description, severity, feature, sprint, reporter } = args;
      if (!title || typeof title !== "string") return fail("title is required");
      if (!validSeverity(severity)) return fail(`severity must be one of: ${VALID_SEVERITY.join(", ")}`);

      const id = nextBugId(db);
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

      db.transaction(() => {
        db.prepare(
          `INSERT INTO bugs (id, title, severity, status, feature, sprint, data, created_at)
           VALUES (?, ?, ?, 'open', ?, ?, ?, datetime('now'))`
        ).run(
          id,
          String(title),
          String(severity),
          (feature as string | undefined) ?? null,
          (sprint  as string | undefined) ?? null,
          JSON.stringify(bugData)
        );

        // Update FTS
        db.prepare(
          "INSERT OR REPLACE INTO bugs_fts (id, title, description) VALUES (?, ?, ?)"
        ).run(id, String(title), (description as string | undefined) ?? "");

        auditLog(db, id, "create", bugData);
      })();

      return ok({ ok: true, id, created_at: today });
    }

    case "wiki_bug_update": {
      const { id, patch } = args;
      if (!id) return fail("id is required");
      if (!patch || typeof patch !== "object" || Array.isArray(patch))
        return fail("patch must be an object");

      const existing = db
        .prepare("SELECT data FROM bugs WHERE id = ?")
        .get(String(id)) as { data: string } | null;
      if (!existing) return fail(`Bug '${id}' not found`);

      const p = patch as Record<string, unknown>;

      // Validate enum fields before applying
      if (p.severity !== undefined && !validSeverity(p.severity))
        return fail(`severity must be one of: ${VALID_SEVERITY.join(", ")}`);
      if (p.status !== undefined && !validStatus(p.status))
        return fail(`status must be one of: ${VALID_STATUS.join(", ")}`);

      const current = JSON.parse(existing.data) as Record<string, unknown>;
      const today = new Date().toISOString().split("T")[0];

      // Deep merge
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

      db.transaction(() => {
        db.prepare(
          `UPDATE bugs SET
            data = ?,
            title    = COALESCE(?, title),
            severity = COALESCE(?, severity),
            status   = COALESCE(?, status),
            updated_at = datetime('now')
          WHERE id = ?`
        ).run(
          JSON.stringify(merged),
          (p.title    as string | undefined) ?? (meta?.title    as string | undefined) ?? null,
          (p.severity as string | undefined) ?? null,
          (p.status   as string | undefined) ?? null,
          String(id)
        );

        // Update FTS
        db.prepare(
          "INSERT OR REPLACE INTO bugs_fts (id, title, description) VALUES (?, ?, ?)"
        ).run(
          String(id),
          (meta?.title as string | undefined) ?? String(id),
          ((merged.content as Record<string, unknown> | undefined)?.description as string | undefined) ?? ""
        );

        auditLog(db, String(id), "update", patch);
      })();

      return ok({ ok: true, id, updated_at: today });
    }

    default:
      return fail(`Unknown bug tool: ${name}`);
  }
}
