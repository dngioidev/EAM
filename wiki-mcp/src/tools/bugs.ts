import { getDb } from "../db.js";

export async function handleBugTool(
  name: string,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  throw new Error(`Bug tool '${name}' not yet implemented — pending T009`);
}
