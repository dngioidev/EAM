import { getDb } from "../db.js";

export async function handleSearchTool(
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  throw new Error("wiki_search not yet implemented — pending T008");
}
