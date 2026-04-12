import { getDb } from "../db.js";

export async function handleWriteTool(
  name: string,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  throw new Error(`Write tool '${name}' not yet implemented — pending T005`);
}
