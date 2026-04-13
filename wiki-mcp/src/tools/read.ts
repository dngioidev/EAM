import { getDb } from "../db.js";

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
  const db = getDb();

  switch (name) {
    case "wiki_dashboard": {
      const row = db
        .prepare("SELECT data FROM dashboard WHERE id = 1")
        .get() as { data: string } | null;
      if (!row) return fail("Dashboard not found — run migration first");
      return ok(JSON.parse(row.data));
    }

    case "wiki_feature_get": {
      const { id } = args;
      if (!id) return fail("id is required");
      const row = db
        .prepare("SELECT data FROM features WHERE id = ?")
        .get(String(id)) as { data: string } | null;
      if (!row) return fail(`Feature '${id}' not found`);
      return ok(JSON.parse(row.data));
    }

    case "wiki_feature_list": {
      const { status, sprint, domain } = args;
      const conditions: string[] = [];
      const params: unknown[] = [];
      if (status) { conditions.push("status = ?"); params.push(status); }
      if (sprint)  { conditions.push("sprint = ?");  params.push(sprint);  }
      if (domain)  { conditions.push("domain = ?");  params.push(domain);  }
      const where = conditions.length ? " WHERE " + conditions.join(" AND ") : "";
      const sql = `SELECT id, title, status, sprint, domain, priority, size, owner FROM features${where} ORDER BY priority ASC, id ASC`;
      const rows = db.prepare(sql).all(...params);
      return ok(rows);
    }

    case "wiki_sprint_get": {
      const { id } = args;
      if (!id) return fail("id is required");
      const row = db
        .prepare("SELECT data FROM sprints WHERE id = ?")
        .get(String(id)) as { data: string } | null;
      if (!row) return fail(`Sprint '${id}' not found`);
      return ok(JSON.parse(row.data));
    }

    case "wiki_bug_list": {
      const { status, severity, feature } = args;
      const conditions: string[] = [];
      const params: unknown[] = [];
      if (status)   { conditions.push("status = ?");   params.push(status);   }
      if (severity) { conditions.push("severity = ?"); params.push(severity); }
      if (feature)  { conditions.push("feature = ?");  params.push(feature);  }
      const where = conditions.length ? " WHERE " + conditions.join(" AND ") : "";
      const sql = `SELECT id, title, severity, status, feature, sprint, created_at FROM bugs${where} ORDER BY created_at DESC`;
      const rows = db.prepare(sql).all(...params);
      return ok(rows);
    }

    case "wiki_contract_get": {
      const { module } = args;
      if (!module) return fail("module is required");
      const row = db
        .prepare("SELECT data FROM api_contracts WHERE module = ?")
        .get(String(module)) as { data: string } | null;
      if (!row) return fail(`Contract for module '${module}' not found`);
      return ok(JSON.parse(row.data));
    }

    case "wiki_pages_get": {
      const { section, slug } = args;
      if (!section) return fail("section is required");
      if (!slug) return fail("slug is required");
      const row = db
        .prepare("SELECT data FROM pages WHERE section = ? AND slug = ?")
        .get(String(section), String(slug)) as { data: string } | null;
      if (!row) return fail(`Page '${section}/${slug}' not found`);
      return ok(JSON.parse(row.data));
    }

    case "wiki_pages_list": {
      const { section } = args;
      if (!section) return fail("section is required");
      const rows = db
        .prepare("SELECT section, slug, title, updated_at FROM pages WHERE section = ? ORDER BY slug")
        .all(String(section)) as Array<{ section: string; slug: string; title: string | null; updated_at: string }>;
      return ok(rows);
    }

    case "wiki_bug_get": {
      const { id } = args;
      if (!id) return fail("id is required");
      const row = db
        .prepare("SELECT data FROM bugs WHERE id = ?")
        .get(String(id)) as { data: string } | null;
      if (!row) return fail(`Bug '${id}' not found`);
      return ok(JSON.parse(row.data));
    }

    case "wiki_sprint_list": {
      const rows = db
        .prepare("SELECT id, title, status, start_date, end_date, goal, velocity FROM sprints ORDER BY id")
        .all() as Array<{ id: string; title: string; status: string; start_date: string | null; end_date: string | null; goal: string | null; velocity: number }>;
      return ok(rows);
    }

    case "wiki_contract_list": {
      const rows = db
        .prepare("SELECT module, version, status, updated_at FROM api_contracts ORDER BY module")
        .all() as Array<{ module: string; version: string; status: string; updated_at: string }>;
      return ok(rows);
    }

    case "wiki_history_get": {
      const { date } = args;
      if (!date) return fail("date is required (YYYY-MM-DD)");
      const row = db
        .prepare("SELECT data FROM history WHERE date = ?")
        .get(String(date)) as { data: string } | null;
      if (!row) return fail(`History entry for '${date}' not found`);
      return ok(JSON.parse(row.data));
    }

    case "wiki_history_list": {
      const rows = db
        .prepare("SELECT date, title, updated_at FROM history ORDER BY date DESC")
        .all() as Array<{ date: string; title: string | null; updated_at: string }>;
      return ok(rows);
    }

    case "wiki_decisions_list": {
      const rows = db
        .prepare("SELECT id, title, status, feature, created_at FROM decisions ORDER BY created_at DESC")
        .all() as Array<{ id: string; title: string; status: string; feature: string | null; created_at: string }>;
      return ok(rows);
    }

    case "wiki_changelog_list": {
      const rows = db
        .prepare("SELECT version, date, sprint, summary FROM changelog ORDER BY date DESC")
        .all() as Array<{ version: string; date: string; sprint: string | null; summary: string }>;
      return ok(rows);
    }

    default:
      return fail(`Unknown read tool: ${name}`);
  }
}
