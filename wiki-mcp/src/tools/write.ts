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

    default:
      return fail(`Unknown write tool: ${name}`);
  }
}
