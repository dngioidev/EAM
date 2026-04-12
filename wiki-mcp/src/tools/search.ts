import { getDb } from "../db.js";

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

  const db = getDb();
  const ftsQuery = query.trim().replace(/"/g, '""');
  const results: SearchResult[] = [];

  const searchTargets = [
    { ftsTable: "features_fts",   section: "features",      idCol: "id",     titleCol: "title",  snippetCol: "body" },
    { ftsTable: "bugs_fts",       section: "bugs",          idCol: "id",     titleCol: "title",  snippetCol: "description" },
    { ftsTable: "decisions_fts",  section: "decisions",     idCol: "id",     titleCol: "title",  snippetCol: "body" },
    { ftsTable: "contracts_fts",  section: "api-contracts", idCol: "module", titleCol: "module", snippetCol: "body" },
  ] as const;

  for (const t of searchTargets) {
    if (section && section !== t.section) continue;
    try {
      const rows = db
        .prepare(
          `SELECT
            ${t.idCol} AS id,
            ${t.titleCol} AS title,
            snippet(${t.ftsTable}, -1, '…', '…', '…', 20) AS snippet
          FROM ${t.ftsTable}
          WHERE ${t.ftsTable} MATCH ?
          ORDER BY rank
          LIMIT 20`
        )
        .all(`"${ftsQuery}"`) as Array<{ id: string; title: string; snippet: string }>;
      for (const row of rows) {
        results.push({ section: t.section, id: row.id, title: row.title, snippet: row.snippet });
      }
    } catch {
      // Invalid FTS syntax or empty table — skip section silently
    }
  }

  return ok(results);
}
