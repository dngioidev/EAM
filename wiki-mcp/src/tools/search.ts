import { getPool } from "../db.js";

type ToolResult = { content: Array<{ type: "text"; text: string }>; isError?: boolean };

function ok(data: unknown): ToolResult {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function fail(msg: string): ToolResult {
  return { content: [{ type: "text", text: msg }], isError: true };
}

interface SearchResult {
  section: string;
  id: string;
  title: string;
  snippet: string;
}

export async function handleSearchTool(
  args: Record<string, unknown>
): Promise<ToolResult> {
  const { query, section } = args;
  if (!query || typeof query !== "string" || !query.trim())
    return fail("query is required and must be a non-empty string");

  const pool = getPool();
  // Convert natural language query to tsquery: split words, join with &
  const words = query.trim().split(/\s+/).filter(Boolean);
  const tsQuery = words.map(w => w.replace(/[^a-zA-Z0-9]/g, "")).filter(Boolean).join(" & ");
  if (!tsQuery) return fail("query produced no searchable terms");

  const results: SearchResult[] = [];

  const searchTargets = [
    {
      section: "features",
      table: "wiki.features",
      idCol: "id",
      titleCol: "title",
      snippetCol: "title || ' ' || COALESCE(domain, '')",
    },
    {
      section: "bugs",
      table: "wiki.bugs",
      idCol: "id",
      titleCol: "title",
      snippetCol: "title || ' ' || COALESCE(description, '')",
    },
    {
      section: "decisions",
      table: "wiki.decisions",
      idCol: "id",
      titleCol: "title",
      snippetCol: "title",
    },
    {
      section: "api-contracts",
      table: "wiki.api_contracts",
      idCol: "module",
      titleCol: "module",
      snippetCol: "module || ' ' || COALESCE(data::text, '')",
    },
  ] as const;

  for (const t of searchTargets) {
    if (section && section !== t.section) continue;
    try {
      const sql = `
        SELECT
          ${t.idCol} AS id,
          ${t.titleCol} AS title,
          ts_headline('english', ${t.snippetCol}, to_tsquery('english', $1),
            'StartSel=…, StopSel=…, MaxFragments=2, MaxWords=30') AS snippet
        FROM ${t.table}
        WHERE tsv @@ to_tsquery('english', $1)
        ORDER BY ts_rank(tsv, to_tsquery('english', $1)) DESC
        LIMIT 20`;
      const { rows } = await pool.query(sql, [tsQuery]);
      for (const row of rows) {
        results.push({
          section: t.section,
          id: row.id,
          title: row.title,
          snippet: row.snippet,
        });
      }
    } catch {
      // Invalid query or empty table — skip section silently
    }
  }

  return ok(results);
}
