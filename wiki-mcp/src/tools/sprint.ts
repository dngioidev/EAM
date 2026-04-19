import { getPool } from "../db.js";

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
  const pool = getPool();

  switch (name) {
    case "wiki_sprint_close": {
      const { id, velocity_actual } = args;
      if (!id) return fail("id is required");

      const { rows } = await pool.query(
        "SELECT data FROM wiki.sprints WHERE id = $1", [String(id)]
      );
      if (!rows[0]) return fail(`Sprint '${id}' not found`);

      const sprint = rows[0].data as Record<string, unknown>;
      const today = new Date().toISOString().split("T")[0];

      if (sprint.quick_facts && typeof sprint.quick_facts === "object") {
        const qf = sprint.quick_facts as Record<string, unknown>;
        qf.status = "closed";
        if (velocity_actual !== undefined) qf.velocity_actual = velocity_actual;
        qf.end_date = today;
      }
      if (sprint.meta && typeof sprint.meta === "object") {
        (sprint.meta as Record<string, unknown>).last_updated = today;
      }

      const changelogEntry = {
        version: today,
        date: today,
        sprint: String(id),
        tags: ["sprint", "closed"],
        summary: `Sprint ${id} closed.${velocity_actual !== undefined ? ` Velocity: ${velocity_actual} pts.` : ""}`,
        changes: [`Sprint ${id} status set to closed.`],
      };

      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        // Update sprint
        await client.query(
          "UPDATE wiki.sprints SET data = $1::jsonb, status = 'closed', updated_at = now() WHERE id = $2",
          [JSON.stringify(sprint), String(id)]
        );

        // Update dashboard
        const dashResult = await client.query("SELECT data FROM wiki.dashboard WHERE id = 1");
        if (dashResult.rows[0]) {
          const dash = dashResult.rows[0].data as Record<string, unknown>;
          const dashQf = dash.quick_facts as Record<string, unknown> | undefined;
          if (dashQf && dashQf.sprint === String(id)) {
            dashQf.sprint = "";
            dashQf.sprint_goal = "";
          }
          if (dash.content && typeof dash.content === "object") {
            (dash.content as Record<string, unknown>).sprint_notes = `Sprint ${id} closed on ${today}.`;
          }
          if (dash.meta && typeof dash.meta === "object") {
            (dash.meta as Record<string, unknown>).last_updated = today;
          }
          await client.query(
            "UPDATE wiki.dashboard SET data = $1::jsonb, updated_at = now() WHERE id = 1",
            [JSON.stringify(dash)]
          );
        }

        // Changelog entry
        const changelogVersion = `sprint-${String(id)}-closed-${today}`;
        await client.query(
          `INSERT INTO wiki.changelog (version, date, sprint, summary, data, created_at)
           VALUES ($1, $2::date, $3, $4, $5::jsonb, now())
           ON CONFLICT (version) DO UPDATE SET
             data = $5::jsonb, summary = $4, created_at = now()`,
          [changelogVersion, today, String(id), changelogEntry.summary, JSON.stringify(changelogEntry)]
        );

        // Audit log
        await client.query(
          `INSERT INTO wiki.audit_log (tool, author, target_type, target_id, changed)
           VALUES ('wiki_sprint_close', 'vibe-agent', 'sprint', $1, $2::jsonb)`,
          [String(id), JSON.stringify({ velocity_actual })]
        );

        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }

      return ok({ ok: true, id, closed_at: today });
    }

    case "wiki_sprint_open": {
      const { id } = args;
      if (!id) return fail("id is required");

      const { rows } = await pool.query(
        "SELECT data FROM wiki.sprints WHERE id = $1", [String(id)]
      );
      if (!rows[0]) return fail(`Sprint '${id}' not found`);

      const sprint = rows[0].data as Record<string, unknown>;
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

      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        // Update sprint
        await client.query(
          "UPDATE wiki.sprints SET data = $1::jsonb, status = 'active', updated_at = now() WHERE id = $2",
          [JSON.stringify(sprint), String(id)]
        );

        // Update dashboard
        const dashResult = await client.query("SELECT data FROM wiki.dashboard WHERE id = 1");
        if (dashResult.rows[0]) {
          const dash = dashResult.rows[0].data as Record<string, unknown>;
          const dashQf = dash.quick_facts as Record<string, unknown> | undefined;
          if (dashQf) {
            dashQf.sprint = String(id);
            dashQf.sprint_goal = (qf?.sprint_goal as string | undefined) ?? dashQf.sprint_goal;
            dashQf.sprint_start = (qf?.start_date as string | undefined) ?? today;
            dashQf.sprint_end = (qf?.end_date as string | undefined) ?? dashQf.sprint_end;
          }
          if (dash.meta && typeof dash.meta === "object") {
            (dash.meta as Record<string, unknown>).last_updated = today;
          }
          await client.query(
            "UPDATE wiki.dashboard SET data = $1::jsonb, updated_at = now() WHERE id = 1",
            [JSON.stringify(dash)]
          );
        }

        // Audit log
        await client.query(
          `INSERT INTO wiki.audit_log (tool, author, target_type, target_id, changed)
           VALUES ('wiki_sprint_open', 'vibe-agent', 'sprint', $1, $2::jsonb)`,
          [String(id), JSON.stringify({ id })]
        );

        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }

      return ok({ ok: true, id, opened_at: today });
    }

    default:
      return fail(`Unknown sprint tool: ${name}`);
  }
}
