import { getDb } from "../db.js";

export async function handleReadTool(
  name: string,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  throw new Error(`Read tool '${name}' not yet implemented — pending T004`);
}
