import { getDb } from "../db.js";

export async function handleContractTool(
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  throw new Error("wiki_contract_update not yet implemented — pending T010");
}
