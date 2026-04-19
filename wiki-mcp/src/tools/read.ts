import { getPool } from "../db.js";

type ToolResult = { content: Array<{ type: "text"; text: string }>; isError?: boolean };

function ok(data: unknown): ToolResult {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function fail(msg: string): ToolResult {
  return { content: [{ type: "text", text: msg }], isError: true };
}

export async function handleReadTool(
  name: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  const pool = getPool();

  switch (name) {
    case "wiki_dashboard": {
      const { rows } = await pool.query("SELECT data FROM wiki.dashboard WHERE id = 1");
      if (!rows[0]) return fail("Dashboard not found — run migration first");
      return ok(rows[0].data);
    }

    case "wiki_feature_get": {
      const { id } = args;
      if (!id) return fail("id is required");
      const { rows } = await pool.query("SELECT data FROM wiki.features WHERE id = $1", [String(id)]);
      if (!rows[0]) return fail(`Feature '${id}' not found`);
      return ok(rows[0].data);
    }

    case "wiki_feature_list": {
      const { status, sprint, domain } = args;
      const conditions: string[] = [];
      const params: unknown[] = [];
      let i = 1;
      if (status) { conditions.push(`status = $${i++}`); params.push(status); }
      if (sprint) { conditions.push(`sprint = $${i++}`); params.push(sprint); }
      if (domain) { conditions.push(`domain = $${i++}`); params.push(domain); }
      const where = conditions.length ? " WHERE " + conditions.join(" AND ") : "";
      const sql = `SELECT id, title, status, sprint, domain, priority, size, owner FROM wiki.features${where} ORDER BY priority ASC, id ASC`;
      const { rows } = await pool.query(sql, params);
      return ok(rows);
    }

    case "wiki_sprint_get": {
      const { id } = args;
      if (!id) return fail("id is required");
      const { rows } = await pool.query("SELECT data FROM wiki.sprints WHERE id = $1", [String(id)]);
      if (!rows[0]) return fail(`Sprint '${id}' not found`);
      return ok(rows[0].data);
    }

    case "wiki_bug_list": {
      const { status, severity, feature } = args;
      const conditions: string[] = [];
      const params: unknown[] = [];
      let i = 1;
      if (status)   { conditions.push(`status = $${i++}`);   params.push(status); }
      if (severity) { conditions.push(`severity = $${i++}`); params.push(severity); }
      if (feature)  { conditions.push(`feature = $${i++}`);  params.push(feature); }
      const where = conditions.length ? " WHERE " + conditions.join(" AND ") : "";
      const sql = `SELECT id, title, severity, status, feature, sprint, created_at FROM wiki.bugs${where} ORDER BY created_at DESC`;
      const { rows } = await pool.query(sql, params);
      return ok(rows);
    }

    case "wiki_contract_get": {
      const { module } = args;
      if (!module) return fail("module is required");
      const { rows } = await pool.query("SELECT data FROM wiki.api_contracts WHERE module = $1", [String(module)]);
      if (!rows[0]) return fail(`Contract for module '${module}' not found`);
      return ok(rows[0].data);
    }

    case "wiki_pages_get": {
      const { section, slug } = args;
      if (!section) return fail("section is required");
      if (!slug) return fail("slug is required");
      const { rows } = await pool.query(
        "SELECT data FROM wiki.pages WHERE section = $1 AND slug = $2",
        [String(section), String(slug)]
      );
      if (!rows[0]) return fail(`Page '${section}/${slug}' not found`);
      return ok(rows[0].data);
    }

    case "wiki_pages_list": {
      const { section } = args;
      if (!section) return fail("section is required");
      const { rows } = await pool.query(
        "SELECT section, slug, title, updated_at FROM wiki.pages WHERE section = $1 ORDER BY slug",
        [String(section)]
      );
      return ok(rows);
    }

    case "wiki_bug_get": {
      const { id } = args;
      if (!id) return fail("id is required");
      const { rows } = await pool.query("SELECT data FROM wiki.bugs WHERE id = $1", [String(id)]);
      if (!rows[0]) return fail(`Bug '${id}' not found`);
      return ok(rows[0].data);
    }

    case "wiki_sprint_list": {
      const { rows } = await pool.query(
        "SELECT id, title, status, start_date, end_date, goal, velocity FROM wiki.sprints ORDER BY id"
      );
      return ok(rows);
    }

    case "wiki_contract_list": {
      const { rows } = await pool.query(
        "SELECT module, version, status, updated_at FROM wiki.api_contracts ORDER BY module"
      );
      return ok(rows);
    }

    case "wiki_history_get": {
      const { date } = args;
      if (!date) return fail("date is required (YYYY-MM-DD)");
      const { rows } = await pool.query("SELECT data FROM wiki.history WHERE date = $1", [String(date)]);
      if (!rows[0]) return fail(`History entry for '${date}' not found`);
      return ok(rows[0].data);
    }

    case "wiki_history_list": {
      const { rows } = await pool.query(
        "SELECT date, title, updated_at FROM wiki.history ORDER BY date DESC"
      );
      return ok(rows);
    }

    case "wiki_decisions_list": {
      const { rows } = await pool.query(
        "SELECT id, title, status, feature, created_at FROM wiki.decisions ORDER BY created_at DESC"
      );
      return ok(rows);
    }

    case "wiki_changelog_list": {
      const { rows } = await pool.query(
        "SELECT version, date, sprint, summary FROM wiki.changelog ORDER BY date DESC"
      );
      return ok(rows);
    }

    default:
      return fail(`Unknown read tool: ${name}`);
  }
}
