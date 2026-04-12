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

    default:
      return fail(`Unknown read tool: ${name}`);
  }
}
