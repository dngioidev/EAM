import { getDb } from "../db.js";

export async function handleSprintTool(
  name: string,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  throw new Error(`Sprint tool '${name}' not yet implemented — pending T007`);
}
