/**
 * migrate.ts — one-time JSON→SQLite importer
 * T003 / wiki-infra Sprint 4.5
 *
 * Reads all wiki/ JSON files and populates wiki.db idempotently.
 * Safe to re-run: uses INSERT OR REPLACE throughout.
 *
 * Usage:
 *   node --import=tsx/esm src/migrate.ts
 *   # or after build:
 *   node dist/migrate.js
 *
 * The wiki/ folder is resolved relative to the repo root (two levels up from src/).
 */

import Database from "better-sqlite3";
import { readFileSync, readdirSync, existsSync, statSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT  = path.resolve(__dirname, "../..");
const WIKI_ROOT  = path.join(REPO_ROOT, "wiki");
const DB_PATH    = path.join(REPO_ROOT, "wiki.db");
// schema.sql lives in src/ — resolve from repo root so this works from both
// dist/migrate.js (compiled) and src/migrate.ts (tsx dev mode)
const SCHEMA     = path.join(REPO_ROOT, "wiki-mcp", "src", "schema.sql");

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readJson<T = Record<string, unknown>>(filePath: string): T | null {
  try {
    return JSON.parse(readFileSync(filePath, "utf8")) as T;
  } catch (err) {
    console.warn(`  WARN: could not parse ${filePath} — skipping`);
    return null;
  }
}

function jsonFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json") && f !== "_index.json" && !f.startsWith("_"))
    .map((f) => path.join(dir, f));
}

function now(): string {
  return new Date().toISOString().replace(/\.\d+Z$/, "Z");
}

// ─── Import functions ──────────────────────────────────────────────────────────

function importFeatures(db: Database.Database): number {
  const upsertFeature = db.prepare(`
    INSERT OR REPLACE INTO features
      (id, title, status, sprint, domain, priority, size, owner, data, created_at, updated_at)
    VALUES
      (@id, @title, @status, @sprint, @domain, @priority, @size, @owner, @data, @created_at, @updated_at)
  `);

  const upsertTask = db.prepare(`
    INSERT OR REPLACE INTO tasks
      (id, feature_id, title, status, priority, size, notes, updated_at)
    VALUES
      (@id, @feature_id, @title, @status, @priority, @size, @notes, @updated_at)
  `);

  const upsertFts = db.prepare(`
    INSERT OR REPLACE INTO features_fts (id, title, domain, body)
    VALUES (@id, @title, @domain, @body)
  `);

  let count = 0;
  const dir = path.join(WIKI_ROOT, "features");

  for (const file of jsonFiles(dir)) {
    const raw = readJson(file);
    if (!raw) continue;

    const meta: Record<string, unknown> = (raw.meta as Record<string, unknown>) ?? {};
    const qf: Record<string, unknown>   = (raw.quick_facts as Record<string, unknown>) ?? {};
    const content: Record<string, unknown> = (raw.content as Record<string, unknown>) ?? {};

    // Support two feature JSON shapes observed in the codebase:
    // Shape A (auth/order/…): meta.id + meta.status + meta.sprint
    // Shape B (wiki-infra):   quick_facts.feature_id + meta.status + quick_facts.sprint
    const id: string =
      (meta.id as string) ??
      (qf.feature_id as string) ??
      path.basename(file, ".json");

    const status = normalizeFeatureStatus(
      (meta.status as string) ?? "planning"
    );

    const ts = now();

    upsertFeature.run({
      id,
      title:      (content.title as string) ?? (meta.title as string) ?? id,
      status,
      sprint:     String(qf.sprint ?? meta.sprint ?? ""),
      domain:     (qf.domain as string) ?? "",
      priority:   Number(qf.priority ?? meta.priority ?? 5),
      size:       (qf.size as string) ?? "",
      owner:      (meta.owner as string) ?? "",
      data:       JSON.stringify(raw, null, 2),
      created_at: (meta.created as string) ?? ts,
      updated_at: (meta.last_updated as string) ?? ts,
    });

    // FTS body: tldr + problem_statement + solution_summary
    const ftsBody = [
      content.tldr,
      content.problem_statement,
      content.solution_summary,
      content.summary,
    ]
      .filter(Boolean)
      .join(" ");

    upsertFts.run({
      id,
      title: (content.title as string) ?? id,
      domain: (qf.domain as string) ?? "",
      body:  ftsBody,
    });

    // Tasks — use Array.isArray guard since not all feature shapes include tasks
    const tasks = Array.isArray(content.tasks) ? content.tasks as Array<Record<string, unknown>> : [];
    for (const t of tasks) {
      upsertTask.run({
        id:         String(t.id ?? ""),
        feature_id: id,
        title:      String(t.title ?? ""),
        status:     normalizeTaskStatus(String(t.status ?? "todo")),
        priority:   String(t.priority ?? "P1"),
        size:       String(t.size ?? ""),
        notes:      String(t.notes ?? ""),
        updated_at: ts,
      });
    }

    count++;
  }

  return count;
}

function importSprints(db: Database.Database): number {
  const upsert = db.prepare(`
    INSERT OR REPLACE INTO sprints
      (id, title, status, start_date, end_date, goal, velocity, data, created_at, updated_at)
    VALUES
      (@id, @title, @status, @start_date, @end_date, @goal, @velocity, @data, @created_at, @updated_at)
  `);

  let count = 0;
  const dir = path.join(WIKI_ROOT, "plan", "sprints");

  for (const file of jsonFiles(dir)) {
    const raw = readJson(file);
    if (!raw) continue;

    const meta: Record<string, unknown> = (raw.meta as Record<string, unknown>) ?? {};
    const qf:   Record<string, unknown> = (raw.quick_facts as Record<string, unknown>) ?? {};

    // Sprint ID from filename (e.g. sprint-4-5.json → sprint-4-5)
    const id = path.basename(file, ".json");
    const ts = now();

    upsert.run({
      id,
      title:      String(meta.title ?? id),
      status:     normalizeSprintStatus(String(qf.status ?? "planned")),
      start_date: String(qf.sprint_start ?? qf.start_date ?? ""),
      end_date:   String(qf.sprint_end ?? qf.end_date ?? ""),
      goal:       String(qf.sprint_goal ?? qf.goal ?? ""),
      velocity:   Number(qf.velocity_actual ?? qf.velocity_planned ?? 0),
      data:       JSON.stringify(raw, null, 2),
      created_at: ts,
      updated_at: String(meta.last_updated ?? ts),
    });

    count++;
  }

  return count;
}

function importContracts(db: Database.Database): number {
  const upsert = db.prepare(`
    INSERT OR REPLACE INTO api_contracts
      (module, version, status, data, updated_at)
    VALUES
      (@module, @version, @status, @data, @updated_at)
  `);

  const upsertFts = db.prepare(`
    INSERT OR REPLACE INTO contracts_fts (module, body)
    VALUES (@module, @body)
  `);

  let count = 0;
  const dir = path.join(WIKI_ROOT, "api-contracts");

  for (const file of jsonFiles(dir)) {
    const raw = readJson(file);
    if (!raw) continue;

    const meta: Record<string, unknown> = (raw.meta as Record<string, unknown>) ?? {};
    const module = path.basename(file, ".json");
    const ts = now();

    upsert.run({
      module,
      version:    String(meta.version ?? "1.0.0"),
      status:     normalizeContractStatus(String(meta.status ?? "draft")),
      data:       JSON.stringify(raw, null, 2),
      updated_at: String(meta.last_updated ?? ts),
    });

    // FTS: flatten all endpoint paths + summaries
    const endpoints = flattenEndpoints(raw);
    upsertFts.run({ module, body: endpoints });

    count++;
  }

  return count;
}

function importBugs(db: Database.Database): number {
  const upsert = db.prepare(`
    INSERT OR REPLACE INTO bugs
      (id, title, severity, status, feature, sprint, description, data, created_at, updated_at)
    VALUES
      (@id, @title, @severity, @status, @feature, @sprint, @description, @data, @created_at, @updated_at)
  `);

  const upsertFts = db.prepare(`
    INSERT OR REPLACE INTO bugs_fts (id, title, description)
    VALUES (@id, @title, @description)
  `);

  let count = 0;
  const dir = path.join(WIKI_ROOT, "bugs");

  for (const file of jsonFiles(dir)) {
    const raw = readJson(file);
    if (!raw) continue;

    const meta:    Record<string, unknown> = (raw.meta as Record<string, unknown>) ?? {};
    const content: Record<string, unknown> = (raw.content as Record<string, unknown>) ?? {};
    const ts = now();

    const id = String(
      meta.id ?? path.basename(file, ".json")
    );

    const description = String(
      content.description ?? content.problem ?? content.root_cause ?? ""
    );

    upsert.run({
      id,
      title:       String(content.title ?? meta.title ?? id),
      severity:    normalizeSeverity(String(meta.severity ?? content.severity ?? "medium")),
      status:      normalizeBugStatus(String(meta.status ?? content.status ?? "open")),
      feature:     String(meta.feature ?? content.feature ?? meta.module ?? ""),
      sprint:      String(meta.sprint ?? content.sprint ?? ""),
      description,
      data:        JSON.stringify(raw, null, 2),
      created_at:  String(meta.created_at ?? meta.created ?? ts),
      updated_at:  String(meta.last_updated ?? meta.updated_at ?? ts),
    });

    upsertFts.run({ id, title: String(content.title ?? id), description });

    count++;
  }

  return count;
}

function importHistory(db: Database.Database): number {
  const upsert = db.prepare(`
    INSERT OR REPLACE INTO history (date, title, data, updated_at)
    VALUES (@date, @title, @data, @updated_at)
  `);

  let count = 0;
  const dir = path.join(WIKI_ROOT, "history");

  for (const file of jsonFiles(dir)) {
    const raw = readJson(file);
    if (!raw) continue;

    const meta: Record<string, unknown> = (raw.meta as Record<string, unknown>) ?? {};
    const date = String(meta.date ?? path.basename(file, ".json"));
    const ts   = now();

    upsert.run({
      date,
      title:      String(meta.title ?? date),
      data:       JSON.stringify(raw, null, 2),
      updated_at: ts,
    });

    count++;
  }

  return count;
}

function importDecisions(db: Database.Database): number {
  const upsert = db.prepare(`
    INSERT OR REPLACE INTO decisions
      (id, title, status, feature, data, created_at, updated_at)
    VALUES
      (@id, @title, @status, @feature, @data, @created_at, @updated_at)
  `);

  const upsertFts = db.prepare(`
    INSERT OR REPLACE INTO decisions_fts (id, title, body)
    VALUES (@id, @title, @body)
  `);

  let count = 0;
  const dir = path.join(WIKI_ROOT, "decisions");
  const files = jsonFiles(dir);

  if (files.length === 0) {
    console.log("  (no decision files found — skipping decisions section)");
    return 0;
  }

  for (const file of files) {
    const raw = readJson(file);
    if (!raw) continue;

    const meta:    Record<string, unknown> = (raw.meta as Record<string, unknown>) ?? {};
    const content: Record<string, unknown> = (raw.content as Record<string, unknown>) ?? {};
    const ts = now();

    const id = String(meta.id ?? path.basename(file, ".json"));

    upsert.run({
      id,
      title:      String(content.title ?? meta.title ?? id),
      status:     normalizeDecisionStatus(String(meta.status ?? "accepted")),
      feature:    String(meta.feature ?? ""),
      data:       JSON.stringify(raw, null, 2),
      created_at: String(meta.created_at ?? ts),
      updated_at: String(meta.last_updated ?? ts),
    });

    const body = [content.context, content.decision, content.rationale, content.notes]
      .filter(Boolean)
      .join(" ");

    upsertFts.run({ id, title: String(content.title ?? id), body });

    count++;
  }

  return count;
}

function importChangelog(db: Database.Database): number {
  const file = path.join(WIKI_ROOT, "changelog.json");
  const raw = readJson(file);
  if (!raw) return 0;

  const upsert = db.prepare(`
    INSERT OR REPLACE INTO changelog
      (version, date, sprint, summary, data, created_at)
    VALUES
      (@version, @date, @sprint, @summary, @data, @created_at)
  `);

  const content: Record<string, unknown> = (raw.content as Record<string, unknown>) ?? {};
  const entries = (content.entries as Array<Record<string, unknown>>) ?? [];
  let count = 0;

  for (const entry of entries) {
    upsert.run({
      version:    String(entry.version ?? ""),
      date:       String(entry.date ?? ""),
      sprint:     String(entry.sprint ?? ""),
      summary:    String(entry.summary ?? ""),
      data:       JSON.stringify(entry, null, 2),
      created_at: now(),
    });
    count++;
  }

  return count;
}

function importDashboard(db: Database.Database): boolean {
  const file = path.join(WIKI_ROOT, "dashboard.json");
  const raw = readJson(file);
  if (!raw) return false;

  const upsert = db.prepare(`
    INSERT OR REPLACE INTO dashboard (id, data, updated_at)
    VALUES (1, @data, @updated_at)
  `);

  const meta: Record<string, unknown> = (raw.meta as Record<string, unknown>) ?? {};
  upsert.run({
    data:       JSON.stringify(raw, null, 2),
    updated_at: String(meta.last_updated ?? now()),
  });

  return true;
}

/**
 * importPages — migrates all wiki sections not covered by dedicated tables into
 * the generic `pages` table keyed by (section, slug).
 *
 * Handles:
 *   - Folder sections with multiple JSON files (techstack/, rulebook/, etc.)
 *   - Single-file "sections" (glossary.json → section=glossary slug=_index, etc.)
 *   - Nested subdirectories: recursed into with parent+child as section key
 */
function importPages(db: Database.Database): number {
  const upsert = db.prepare(`
    INSERT OR REPLACE INTO pages (section, slug, title, data, updated_at)
    VALUES (@section, @slug, @title, @data, @updated_at)
  `);

  // Sections already handled by dedicated tables — skip them
  const SKIP_DIRS = new Set([
    "features", "api-contracts", "bugs", "history",
    "decisions", "plan", "_schema",
  ]);
  // Single-file JSON files at wiki root that we want to store as pages
  const ROOT_FILES = [
    "glossary.json",
    "onboarding.json",
    "roadmap.json",
    "state-map.json",
    "env-config.json",
  ];

  let count = 0;
  const ts = now();

  function extractTitle(raw: Record<string, unknown>, fallback: string): string {
    const meta = raw.meta as Record<string, unknown> | undefined;
    const content = raw.content as Record<string, unknown> | undefined;
    return String(
      meta?.title ?? content?.title ?? raw.title ?? fallback
    );
  }

  function upsertFile(section: string, slug: string, filePath: string): void {
    const raw = readJson(filePath);
    if (!raw) return;
    const title = extractTitle(raw, slug);
    const meta = raw.meta as Record<string, unknown> | undefined;
    upsert.run({
      section,
      slug,
      title,
      data: JSON.stringify(raw, null, 2),
      updated_at: String(meta?.last_updated ?? ts),
    });
    count++;
  }

  // Walk a directory, storing each JSON file as a page (1 level deep for subdirs)
  function importDir(section: string, dir: string): void {
    if (!existsSync(dir)) return;
    const entries = readdirSync(dir);
    for (const entry of entries) {
      if (entry.startsWith("_") || !entry.endsWith(".json")) {
        // Check if it's a subdirectory (no extension)
        const fullPath = path.join(dir, entry);
        if (!entry.includes(".") && statSync(fullPath).isDirectory()) {
          // Use section/subdir as slug prefix to avoid collisions
          importDir(`${section}/${entry}`, fullPath);
        }
        continue;
      }
      const slug = entry.replace(/\.json$/, "");
      upsertFile(section, slug, path.join(dir, entry));
    }
  }

  // Migrate root-level single-file pages
  for (const filename of ROOT_FILES) {
    const section = filename.replace(/\.json$/, "");
    upsertFile(section, "_index", path.join(WIKI_ROOT, filename));
  }

  // Migrate all subdirectory sections not already handled
  const rootEntries = readdirSync(WIKI_ROOT);
  for (const entry of rootEntries) {
    if (entry.startsWith("_") || entry.includes(".")) continue;
    if (SKIP_DIRS.has(entry)) continue;
    const dir = path.join(WIKI_ROOT, entry);
    if (!statSync(dir).isDirectory()) continue;
    importDir(entry, dir);
  }

  // Migrate plan/ — sprints are in dedicated table but plan-level files aren't
  const planDir = path.join(WIKI_ROOT, "plan");
  if (existsSync(planDir)) {
    for (const entry of readdirSync(planDir)) {
      if (entry.startsWith("_") || !entry.endsWith(".json")) continue;
      const slug = entry.replace(/\.json$/, "");
      upsertFile("plan", slug, path.join(planDir, entry));
    }
  }

  return count;
}

// ─── Normalizers — map observed JSON values to schema enums ───────────────────

function normalizeFeatureStatus(s: string): string {
  const map: Record<string, string> = {
    done: "done", completed: "done",
    "in-progress": "in_progress", in_progress: "in_progress", active: "in_progress",
    planning: "planning", planned: "planning",
    blocked: "blocked",
    cancelled: "cancelled", canceled: "cancelled",
    todo: "todo",
  };
  return map[s.toLowerCase()] ?? "planning";
}

function normalizeTaskStatus(s: string): string {
  const map: Record<string, string> = {
    done: "done", completed: "done",
    "in-progress": "in_progress", in_progress: "in_progress",
    blocked: "blocked",
    todo: "todo",
  };
  return map[s.toLowerCase()] ?? "todo";
}

function normalizeSprintStatus(s: string): string {
  const map: Record<string, string> = {
    closed: "closed", done: "closed", completed: "closed",
    active: "active", in_progress: "active", "in-progress": "active",
    planned: "planned",
  };
  return map[s.toLowerCase()] ?? "planned";
}

function normalizeSeverity(s: string): string {
  const allowed = ["low", "medium", "high", "critical"];
  return allowed.includes(s.toLowerCase()) ? s.toLowerCase() : "medium";
}

function normalizeBugStatus(s: string): string {
  const map: Record<string, string> = {
    open: "open",
    "in-progress": "in_progress", in_progress: "in_progress",
    fixed: "fixed", resolved: "fixed",
    wontfix: "wontfix", "won't fix": "wontfix",
    deferred: "deferred",
  };
  return map[s.toLowerCase()] ?? "open";
}

function normalizeDecisionStatus(s: string): string {
  const allowed = ["proposed", "accepted", "superseded", "rejected"];
  return allowed.includes(s.toLowerCase()) ? s.toLowerCase() : "accepted";
}

function normalizeContractStatus(s: string): string {
  const allowed = ["draft", "approved", "deprecated"];
  return allowed.includes(s.toLowerCase()) ? s.toLowerCase() : "draft";
}

// Flatten all endpoint paths + descriptions from a contract JSON for FTS body
function flattenEndpoints(contract: Record<string, unknown>): string {
  const parts: string[] = [];

  function walk(node: unknown): void {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    const obj = node as Record<string, unknown>;
    if (typeof obj.path === "string")        parts.push(obj.path);
    if (typeof obj.method === "string")      parts.push(obj.method);
    if (typeof obj.description === "string") parts.push(obj.description);
    if (typeof obj.summary === "string")     parts.push(obj.summary);
    Object.values(obj).forEach(walk);
  }

  walk(contract);
  return parts.join(" ");
}

// ─── Audit log entry ──────────────────────────────────────────────────────────

function logMigration(
  db: Database.Database,
  summary: string
): void {
  db.prepare(`
    INSERT INTO audit_log (tool, author, target_type, target_id, changed, timestamp)
    VALUES ('migrate', 'migrate.ts', 'all', 'all', @changed, @timestamp)
  `).run({ changed: summary, timestamp: now() });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("EAM Wiki Migration: JSON → SQLite");
  console.log(`  DB: ${DB_PATH}`);
  console.log(`  Wiki root: ${WIKI_ROOT}\n`);

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("synchronous = NORMAL");

  // Apply schema
  console.log("Applying schema...");
  const schema = readFileSync(SCHEMA, "utf8");
  db.exec(schema);
  console.log("  schema.sql applied\n");

  // Run all imports inside a single transaction for atomicity
  const migrate = db.transaction(() => {
    console.log("Importing features...");
    const features = importFeatures(db);
    console.log(`  ${features} features imported\n`);

    console.log("Importing sprints...");
    const sprints = importSprints(db);
    console.log(`  ${sprints} sprints imported\n`);

    console.log("Importing API contracts...");
    const contracts = importContracts(db);
    console.log(`  ${contracts} contracts imported\n`);

    console.log("Importing bugs...");
    const bugs = importBugs(db);
    console.log(`  ${bugs} bugs imported\n`);

    console.log("Importing history...");
    const history = importHistory(db);
    console.log(`  ${history} history entries imported\n`);

    console.log("Importing decisions...");
    const decisions = importDecisions(db);
    console.log(`  ${decisions} decisions imported\n`);

    console.log("Importing changelog...");
    const changelog = importChangelog(db);
    console.log(`  ${changelog} changelog entries imported\n`);

    console.log("Importing dashboard...");
    const dashboard = importDashboard(db);
    console.log(`  dashboard: ${dashboard ? "imported" : "skipped"}\n`);

    console.log("Importing generic pages (techstack, rulebook, design, etc.)...");
    const pages = importPages(db);
    console.log(`  ${pages} pages imported\n`);

    const summary = JSON.stringify({
      features, sprints, contracts, bugs, history, decisions, changelog, dashboard, pages,
    });
    logMigration(db, summary);

    return { features, sprints, contracts, bugs, history, decisions, changelog, dashboard, pages };
  });

  try {
    const counts = migrate();

    console.log("Migration complete:");
    console.log(`  features:   ${counts.features}`);
    console.log(`  sprints:    ${counts.sprints}`);
    console.log(`  contracts:  ${counts.contracts}`);
    console.log(`  bugs:       ${counts.bugs}`);
    console.log(`  history:    ${counts.history}`);
    console.log(`  decisions:  ${counts.decisions}`);
    console.log(`  changelog:  ${counts.changelog}`);
    console.log(`  dashboard:  ${counts.dashboard ? "OK" : "skipped"}`);
    console.log(`  pages:      ${counts.pages}`);

    db.close();
    console.log("\nwiki.db ready.");
  } catch (err) {
    db.close();
    console.error("Migration FAILED (transaction rolled back):");
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

main();
