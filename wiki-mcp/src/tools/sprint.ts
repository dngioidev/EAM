import { getDb } from "../db.js";

type ToolResult = { content: Array<{ type: "text"; text: string }>; isError?: boolean };

function ok(data: unknown): ToolResult {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function fail(msg: string): ToolResult {
  return { content: [{ type: "text", text: msg }], isError: true };
}

export async function handleSprintTool(
  name: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  const db = getDb();

  switch (name) {
    case "wiki_sprint_close": {
      const { id, velocity_actual } = args;
      if (!id) return fail("id is required");

      const sprintRow = db
        .prepare("SELECT data FROM sprints WHERE id = ?")
        .get(String(id)) as { data: string } | null;
      if (!sprintRow) return fail(`Sprint '${id}' not found`);

      const sprint = JSON.parse(sprintRow.data) as Record<string, unknown>;
      const today = new Date().toISOString().split("T")[0];

      // Build updated sprint data
      if (sprint.quick_facts && typeof sprint.quick_facts === "object") {
        const qf = sprint.quick_facts as Record<string, unknown>;
        qf.status = "closed";
        if (velocity_actual !== undefined) qf.velocity_actual = velocity_actual;
        qf.end_date = today;
      }
      if (sprint.meta && typeof sprint.meta === "object") {
        (sprint.meta as Record<string, unknown>).last_updated = today;
      }

      // Build changelog entry
      const qf = sprint.quick_facts as Record<string, unknown> | undefined;
      const changelogEntry = {
        version: today,
        date: today,
        sprint: String(id),
        tags: ["sprint", "closed"],
        summary: `Sprint ${id} closed.${velocity_actual !== undefined ? ` Velocity: ${velocity_actual} pts.` : ""}`,
        changes: [`Sprint ${id} status set to closed.`],
      };

      db.transaction(() => {
        // Update sprint row
        db.prepare(
          "UPDATE sprints SET data = ?, status = 'closed', updated_at = datetime('now') WHERE id = ?"
        ).run(JSON.stringify(sprint), String(id));

        // Update dashboard — set active_sprint to null if it was this sprint
        const dashRow = db
          .prepare("SELECT data FROM dashboard WHERE id = 1")
          .get() as { data: string } | null;
        if (dashRow) {
          const dash = JSON.parse(dashRow.data) as Record<string, unknown>;
          const dashQf = dash.quick_facts as Record<string, unknown> | undefined;
          if (dashQf && dashQf.sprint === String(id)) {
            dashQf.sprint = "";
            dashQf.sprint_goal = "";
          }
          if (dash.content && typeof dash.content === "object") {
            const dc = dash.content as Record<string, unknown>;
            dc.sprint_notes = `Sprint ${id} closed on ${today}.`;
          }
          if (dash.meta && typeof dash.meta === "object") {
            (dash.meta as Record<string, unknown>).last_updated = today;
          }
          db.prepare(
            "UPDATE dashboard SET data = ?, updated_at = datetime('now') WHERE id = 1"
          ).run(JSON.stringify(dash));
        }

        // Prepend changelog entry
        const changelogVersion = `sprint-${String(id)}-closed-${today}`;
        db.prepare(
          "INSERT OR REPLACE INTO changelog (version, date, sprint, summary, data, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))"
        ).run(
          changelogVersion,
          today,
          String(id),
          changelogEntry.summary,
          JSON.stringify(changelogEntry)
        );

        // Audit log
        db.prepare(
          "INSERT INTO audit_log (table_name, row_id, action, patch, ts) VALUES (?, ?, ?, ?, datetime('now'))"
        ).run("sprints", String(id), "close", JSON.stringify({ velocity_actual }));
      })();

      return ok({ ok: true, id, closed_at: today });
    }

    case "wiki_sprint_open": {
      const { id } = args;
      if (!id) return fail("id is required");

      const sprintRow = db
        .prepare("SELECT data FROM sprints WHERE id = ?")
        .get(String(id)) as { data: string } | null;
      if (!sprintRow) return fail(`Sprint '${id}' not found`);

      const sprint = JSON.parse(sprintRow.data) as Record<string, unknown>;
      const today = new Date().toISOString().split("T")[0];

      if (sprint.quick_facts && typeof sprint.quick_facts === "object") {
        const qf = sprint.quick_facts as Record<string, unknown>;
        qf.status = "active";
        qf.start_date = qf.start_date ?? today;
      }
      if (sprint.meta && typeof sprint.meta === "object") {
        (sprint.meta as Record<string, unknown>).last_updated = today;
      }

      const qf = sprint.quick_facts as Record<string, unknown> | undefined;

      db.transaction(() => {
        // Update sprint row
        db.prepare(
          "UPDATE sprints SET data = ?, status = 'active', updated_at = datetime('now') WHERE id = ?"
        ).run(JSON.stringify(sprint), String(id));

        // Update dashboard active sprint
        const dashRow = db
          .prepare("SELECT data FROM dashboard WHERE id = 1")
          .get() as { data: string } | null;
        if (dashRow) {
          const dash = JSON.parse(dashRow.data) as Record<string, unknown>;
          const dashQf = dash.quick_facts as Record<string, unknown> | undefined;
          if (dashQf) {
            dashQf.sprint = String(id);
            dashQf.sprint_goal = (qf?.sprint_goal as string | undefined) ?? dashQf.sprint_goal;
            dashQf.sprint_start = (qf?.start_date as string | undefined) ?? today;
            dashQf.sprint_end   = (qf?.end_date   as string | undefined) ?? dashQf.sprint_end;
          }
          if (dash.meta && typeof dash.meta === "object") {
            (dash.meta as Record<string, unknown>).last_updated = today;
          }
          db.prepare(
            "UPDATE dashboard SET data = ?, updated_at = datetime('now') WHERE id = 1"
          ).run(JSON.stringify(dash));
        }

        // Audit log
        db.prepare(
          "INSERT INTO audit_log (table_name, row_id, action, patch, ts) VALUES (?, ?, ?, ?, datetime('now'))"
        ).run("sprints", String(id), "open", JSON.stringify({ id }));
      })();

      return ok({ ok: true, id, opened_at: today });
    }

    default:
      return fail(`Unknown sprint tool: ${name}`);
  }
}
