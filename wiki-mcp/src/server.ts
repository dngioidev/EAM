import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getDb } from "./db.js";

const server = new Server(
  { name: "eam-wiki", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// ─── Tool registry ────────────────────────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    // Read tools (T004)
    {
      name: "wiki_dashboard",
      description: "Returns quick_facts, active sprint, blocked features, and build status snapshot from the wiki DB.",
      inputSchema: { type: "object" as const, properties: {}, required: [] },
    },
    {
      name: "wiki_feature_get",
      description: "Get full feature record by ID (e.g. 'auth', 'wiki-infra').",
      inputSchema: {
        type: "object" as const,
        properties: { id: { type: "string", description: "Feature ID slug" } },
        required: ["id"],
      },
    },
    {
      name: "wiki_feature_list",
      description: "List features with optional filters: status, sprint, domain.",
      inputSchema: {
        type: "object" as const,
        properties: {
          status: { type: "string" },
          sprint: { type: "string" },
          domain: { type: "string" },
        },
        required: [],
      },
    },
    {
      name: "wiki_sprint_get",
      description: "Get sprint record by ID (e.g. 'sprint-4-5').",
      inputSchema: {
        type: "object" as const,
        properties: { id: { type: "string", description: "Sprint ID slug" } },
        required: ["id"],
      },
    },
    {
      name: "wiki_bug_list",
      description: "List bugs with optional filters: status, severity, feature.",
      inputSchema: {
        type: "object" as const,
        properties: {
          status: { type: "string" },
          severity: { type: "string" },
          feature: { type: "string" },
        },
        required: [],
      },
    },
    {
      name: "wiki_contract_get",
      description: "Get API contract for a module (e.g. 'auth', 'order').",
      inputSchema: {
        type: "object" as const,
        properties: { module: { type: "string", description: "Module name slug" } },
        required: ["module"],
      },
    },
    // Write tools (T005)
    {
      name: "wiki_feature_update",
      description: "Patch a feature record by ID. Logs to audit_log.",
      inputSchema: {
        type: "object" as const,
        properties: {
          id: { type: "string" },
          patch: { type: "object", description: "Fields to update" },
        },
        required: ["id", "patch"],
      },
    },
    {
      name: "wiki_task_update",
      description: "Update a task status/notes within a feature. Logs to audit_log.",
      inputSchema: {
        type: "object" as const,
        properties: {
          feature_id: { type: "string" },
          task_id: { type: "string" },
          patch: { type: "object" },
        },
        required: ["feature_id", "task_id", "patch"],
      },
    },
    {
      name: "wiki_session_log",
      description: "Append a session history entry. Logs to audit_log.",
      inputSchema: {
        type: "object" as const,
        properties: {
          date: { type: "string", description: "ISO date (YYYY-MM-DD)" },
          session: { type: "object", description: "Session entry object" },
        },
        required: ["date", "session"],
      },
    },
    // Search (T008)
    {
      name: "wiki_search",
      description: "Full-text search across features, bugs, decisions, and contracts using SQLite FTS5.",
      inputSchema: {
        type: "object" as const,
        properties: {
          query: { type: "string" },
          section: {
            type: "string",
            enum: ["features", "bugs", "decisions", "contracts"],
            description: "Limit search to one section (optional)",
          },
        },
        required: ["query"],
      },
    },
    // Bug tools (T009)
    {
      name: "wiki_bug_create",
      description: "Create a new bug with auto-assigned BUG-XXXX ID. Validates severity/status enums.",
      inputSchema: {
        type: "object" as const,
        properties: {
          title:       { type: "string" },
          description: { type: "string" },
          severity:    { type: "string", enum: ["critical", "high", "medium", "low"] },
          feature:     { type: "string", description: "Feature ID this bug belongs to (optional)" },
          sprint:      { type: "string", description: "Sprint ID (optional)" },
          reporter:    { type: "string", description: "Reporter name (optional)" },
        },
        required: ["title", "severity"],
      },
    },
    {
      name: "wiki_bug_update",
      description: "Update fields on an existing bug. Validates enums. Logs to audit_log.",
      inputSchema: {
        type: "object" as const,
        properties: {
          id: { type: "string", description: "Bug ID (e.g. BUG-0006)" },
          patch: { type: "object" },
        },
        required: ["id", "patch"],
      },
    },
    // Atomic composite tools (T007)
    {
      name: "wiki_sprint_close",
      description: "Atomically closes a sprint: updates sprint status, dashboard quick_facts, changelog, and all in-scope feature statuses in a single SQL transaction.",
      inputSchema: {
        type: "object" as const,
        properties: {
          id: { type: "string", description: "Sprint ID to close" },
          velocity_actual: { type: "number", description: "Actual story points completed (optional)" },
        },
        required: ["id"],
      },
    },
    {
      name: "wiki_sprint_open",
      description: "Atomically opens a new sprint and updates dashboard active sprint in a single SQL transaction.",
      inputSchema: {
        type: "object" as const,
        properties: { id: { type: "string", description: "Sprint ID to open" } },
        required: ["id"],
      },
    },
    // Contract tools (T010)
    {
      name: "wiki_contract_update",
      description: "Update an API contract module with Zod-validated endpoint shapes. Auto-bumps version.",
      inputSchema: {
        type: "object" as const,
        properties: {
          module: { type: "string" },
          patch: { type: "object" },
        },
        required: ["module", "patch"],
      },
    },
  ],
}));

// ─── Tool dispatch ────────────────────────────────────────────────────────────

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Lazy import of tool handlers — populated in T004/T005/T007/T008/T009/T010
  try {
    switch (name) {
      // Read tools
      case "wiki_dashboard":
      case "wiki_feature_get":
      case "wiki_feature_list":
      case "wiki_sprint_get":
      case "wiki_bug_list":
      case "wiki_contract_get": {
        const { handleReadTool } = await import("./tools/read.js");
        return await handleReadTool(name, args ?? {});
      }
      // Write tools
      case "wiki_feature_update":
      case "wiki_task_update":
      case "wiki_session_log": {
        const { handleWriteTool } = await import("./tools/write.js");
        return await handleWriteTool(name, args ?? {});
      }
      // Search
      case "wiki_search": {
        const { handleSearchTool } = await import("./tools/search.js");
        return await handleSearchTool(args ?? {});
      }
      // Bug tools
      case "wiki_bug_create":
      case "wiki_bug_update": {
        const { handleBugTool } = await import("./tools/bugs.js");
        return await handleBugTool(name, args ?? {});
      }
      // Atomic sprint tools
      case "wiki_sprint_close":
      case "wiki_sprint_open": {
        const { handleSprintTool } = await import("./tools/sprint.js");
        return await handleSprintTool(name, args ?? {});
      }
      // Contract tools
      case "wiki_contract_update": {
        const { handleContractTool } = await import("./tools/contracts.js");
        return await handleContractTool(args ?? {});
      }
      default:
        return {
          content: [{ type: "text" as const, text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text" as const, text: `Tool error: ${message}` }],
      isError: true,
    };
  }
});

// ─── Start server ─────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Log to stderr so stdout (MCP messages) stays clean
  process.stderr.write("EAM Wiki MCP server started (stdio)\n");
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
