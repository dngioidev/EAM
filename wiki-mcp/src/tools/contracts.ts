import { getDb } from "../db.js";

type ToolResult = { content: Array<{ type: "text"; text: string }>; isError?: boolean };

function ok(data: unknown): ToolResult {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function fail(msg: string): ToolResult {
  return { content: [{ type: "text", text: msg }], isError: true };
}

const VALID_HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

interface EndpointPatch {
  path: string;
  method: string;
  description: string;
  [key: string]: unknown;
}

function validateEndpoint(ep: unknown): ep is EndpointPatch {
  if (!ep || typeof ep !== "object" || Array.isArray(ep)) return false;
  const e = ep as Record<string, unknown>;
  if (typeof e.path !== "string" || !e.path.startsWith("/")) return false;
  if (typeof e.method !== "string") return false;
  if (!VALID_HTTP_METHODS.includes(e.method.toUpperCase() as typeof VALID_HTTP_METHODS[number])) return false;
  if (typeof e.description !== "string" || !e.description.trim()) return false;
  return true;
}

function bumpPatchVersion(version: string): string {
  const parts = version.split(".");
  if (parts.length !== 3) return version;
  const patch = parseInt(parts[2] ?? "0", 10);
  return `${parts[0]}.${parts[1]}.${isNaN(patch) ? 1 : patch + 1}`;
}

function deepMerge(t: Record<string, unknown>, s: Record<string, unknown>): Record<string, unknown> {
  const r = { ...t };
  for (const [k, v] of Object.entries(s)) {
    if (v !== null && typeof v === "object" && !Array.isArray(v) &&
        t[k] !== null && typeof t[k] === "object" && !Array.isArray(t[k])) {
      r[k] = deepMerge(t[k] as Record<string, unknown>, v as Record<string, unknown>);
    } else {
      r[k] = v;
    }
  }
  return r;
}

export async function handleContractTool(
  args: Record<string, unknown>
): Promise<ToolResult> {
  const { module, patch } = args;
  if (!module || typeof module !== "string") return fail("module is required");
  if (!patch || typeof patch !== "object" || Array.isArray(patch))
    return fail("patch must be an object");

  const p = patch as Record<string, unknown>;

  // Validate any provided endpoints
  if (p.endpoints !== undefined) {
    if (!Array.isArray(p.endpoints)) return fail("endpoints must be an array");
    for (const ep of p.endpoints) {
      if (!validateEndpoint(ep)) {
        return fail(
          `Each endpoint must have: path (string starting with /), method (${VALID_HTTP_METHODS.join("|")}), description (non-empty string)`
        );
      }
    }
  }

  const db = getDb();

  const existing = db
    .prepare("SELECT data FROM api_contracts WHERE module = ?")
    .get(module) as { data: string } | null;
  if (!existing) return fail(`Contract for module '${module}' not found`);

  const current = JSON.parse(existing.data) as Record<string, unknown>;
  const today = new Date().toISOString().split("T")[0];

  const merged = deepMerge(current, p);

  // Auto-bump patch version
  if (merged.meta && typeof merged.meta === "object") {
    const meta = merged.meta as Record<string, unknown>;
    if (typeof meta.version === "string") {
      meta.version = bumpPatchVersion(meta.version);
    }
    meta.last_updated = today;
  }

  db.transaction(() => {
    db.prepare(
      "UPDATE api_contracts SET data = ?, updated_at = datetime('now') WHERE module = ?"
    ).run(JSON.stringify(merged), module);

    // Update FTS
    const body = JSON.stringify(merged);
    db.prepare(
      "INSERT OR REPLACE INTO contracts_fts (module, body) VALUES (?, ?)"
    ).run(module, body);

    db.prepare(
      "INSERT INTO audit_log (table_name, row_id, action, patch, ts) VALUES (?, ?, ?, ?, datetime('now'))"
    ).run("api_contracts", module, "update", JSON.stringify(patch));
  })();

  const newVersion = ((merged.meta as Record<string, unknown> | undefined)?.version as string | undefined) ?? "unknown";
  return ok({ ok: true, module, version: newVersion, updated_at: today });
}
