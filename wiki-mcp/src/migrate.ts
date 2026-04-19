/**
 * migrate.ts â€” PostgreSQL wiki schema creator + data seeder
 * Reads _wiki_dump.json (extracted from wiki.db) and populates
 * the wiki schema in the project's PostgreSQL database.
 *
 * Usage:
 *   npx tsx src/migrate.ts                    # dev mode
 *   node dist/migrate.js                      # compiled
 *
 * Environment variables (same as backend):
 *   DATABASE_HOST (default: localhost)
 *   DATABASE_PORT (default: 5432)
 *   DATABASE_USER (default: eam_user)
 *   DATABASE_PASSWORD (default: devpassword123)
 *   DATABASE_NAME (default: eam_db)
 */

import pg from "pg";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const SCHEMA_PATH = path.join(REPO_ROOT, "wiki-mcp", "src", "schema.sql");
const DUMP_PATH = path.join(REPO_ROOT, "_wiki_dump.json");

const pool = new pg.Pool({
  host: process.env.DATABASE_HOST ?? "localhost",
  port: parseInt(process.env.DATABASE_PORT ?? "5432", 10),
  user: process.env.DATABASE_USER ?? "eam_user",
  password: process.env.DATABASE_PASSWORD ?? "devpassword123",
  database: process.env.DATABASE_NAME ?? "eam_db",
});

interface DumpRow {
  id?: string;
  module?: string;
  date?: string;
  version?: string;
  section?: string;
  slug?: string;
  title?: string;
  status?: string;
  sprint?: string;
  domain?: string;
  priority?: number;
  size?: string;
  owner?: string;
  start_date?: string;
  end_date?: string;
  goal?: string;
  velocity?: number;
  feature_id?: string;
  notes?: string;
  severity?: string;
  feature?: string;
  description?: string;
  summary?: string;
  tool?: string;
  author?: string;
  target_type?: string;
  target_id?: string;
  changed?: string;
  timestamp?: string;
  data?: string;
  created_at?: string;
  updated_at?: string;
}

interface Dump {
  dashboard: DumpRow[];
  features: DumpRow[];
  sprints: DumpRow[];
  tasks: DumpRow[];
  api_contracts: DumpRow[];
  bugs: DumpRow[];
  history: DumpRow[];
  decisions: DumpRow[];
  changelog: DumpRow[];
  audit_log: DumpRow[];
  pages: DumpRow[];
}

async function main() {
  const client = await pool.connect();

  try {
    // 1. Run schema DDL
    console.log("Creating wiki schema...");
    const schemaSql = readFileSync(SCHEMA_PATH, "utf-8");
    await client.query(schemaSql);
    console.log("  Schema created.");

    // 2. Load dump
    console.log("Loading data dump...");
    const dump: Dump = JSON.parse(readFileSync(DUMP_PATH, "utf-8"));

    await client.query("BEGIN");

    // 3. Clear existing data (idempotent re-runs)
    const tables = [
      "wiki.audit_log",
      "wiki.tasks",
      "wiki.pages",
      "wiki.changelog",
      "wiki.history",
      "wiki.decisions",
      "wiki.bugs",
      "wiki.api_contracts",
      "wiki.sprints",
      "wiki.features",
      "wiki.dashboard",
    ];
    for (const t of tables) {
      await client.query(`DELETE FROM ${t}`);
    }

    // 4. Seed dashboard
    for (const row of dump.dashboard) {
      await client.query(
        `INSERT INTO wiki.dashboard (id, data, updated_at)
         VALUES (1, $1::jsonb, COALESCE($2::timestamptz, now()))`,
        [row.data, row.updated_at]
      );
    }
    console.log(`  dashboard: ${dump.dashboard.length} rows`);

    // 5. Seed features
    for (const row of dump.features) {
      await client.query(
        `INSERT INTO wiki.features (id, title, status, sprint, domain, priority, size, owner, data, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, COALESCE($10::timestamptz, now()), COALESCE($11::timestamptz, now()))`,
        [
          row.id, row.title, row.status, row.sprint, row.domain,
          row.priority, row.size, row.owner, row.data,
          row.created_at, row.updated_at,
        ]
      );
    }
    console.log(`  features: ${dump.features.length} rows`);

    // 6. Seed sprints
    for (const row of dump.sprints) {
      await client.query(
        `INSERT INTO wiki.sprints (id, title, status, start_date, end_date, goal, velocity, data, created_at, updated_at)
         VALUES ($1, $2, $3, $4::date, $5::date, $6, $7, $8::jsonb, COALESCE($9::timestamptz, now()), COALESCE($10::timestamptz, now()))`,
        [
          row.id, row.title, row.status,
          row.start_date || null, row.end_date || null,
          row.goal, row.velocity, row.data,
          row.created_at, row.updated_at,
        ]
      );
    }
    console.log(`  sprints: ${dump.sprints.length} rows`);

    // 7. Seed tasks
    for (const row of dump.tasks) {
      await client.query(
        `INSERT INTO wiki.tasks (id, feature_id, title, status, priority, size, notes, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8::timestamptz, now()))`,
        [
          row.id, row.feature_id, row.title, row.status,
          row.priority, row.size, row.notes, row.updated_at,
        ]
      );
    }
    console.log(`  tasks: ${dump.tasks.length} rows`);

    // 8. Seed api_contracts
    for (const row of dump.api_contracts) {
      await client.query(
        `INSERT INTO wiki.api_contracts (module, version, status, data, updated_at)
         VALUES ($1, $2, $3, $4::jsonb, COALESCE($5::timestamptz, now()))`,
        [row.module, row.version, row.status, row.data, row.updated_at]
      );
    }
    console.log(`  api_contracts: ${dump.api_contracts.length} rows`);

    // 9. Seed bugs
    for (const row of dump.bugs) {
      await client.query(
        `INSERT INTO wiki.bugs (id, title, severity, status, feature, sprint, description, data, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, COALESCE($9::timestamptz, now()), COALESCE($10::timestamptz, now()))`,
        [
          row.id, row.title, row.severity, row.status,
          row.feature, row.sprint, row.description, row.data,
          row.created_at, row.updated_at,
        ]
      );
    }
    console.log(`  bugs: ${dump.bugs.length} rows`);

    // 10. Seed history
    for (const row of dump.history) {
      await client.query(
        `INSERT INTO wiki.history (date, title, data, updated_at)
         VALUES ($1::date, $2, $3::jsonb, COALESCE($4::timestamptz, now()))`,
        [row.date, row.title, row.data, row.updated_at]
      );
    }
    console.log(`  history: ${dump.history.length} rows`);

    // 11. Seed decisions
    for (const row of dump.decisions) {
      await client.query(
        `INSERT INTO wiki.decisions (id, title, status, feature, data, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5::jsonb, COALESCE($6::timestamptz, now()), COALESCE($7::timestamptz, now()))`,
        [
          row.id, row.title, row.status, row.feature, row.data,
          row.created_at, row.updated_at,
        ]
      );
    }
    console.log(`  decisions: ${dump.decisions.length} rows`);

    // 12. Seed changelog
    for (const row of dump.changelog) {
      await client.query(
        `INSERT INTO wiki.changelog (version, date, sprint, summary, data, created_at)
         VALUES ($1, $2::date, $3, $4, $5::jsonb, COALESCE($6::timestamptz, now()))`,
        [row.version, row.date, row.sprint, row.summary, row.data, row.created_at]
      );
    }
    console.log(`  changelog: ${dump.changelog.length} rows`);

    // 13. Seed audit_log
    for (const row of dump.audit_log) {
      await client.query(
        `INSERT INTO wiki.audit_log (tool, author, target_type, target_id, changed, timestamp)
         VALUES ($1, $2, $3, $4, $5::jsonb, COALESCE($6::timestamptz, now()))`,
        [
          row.tool, row.author ?? "vibe-agent",
          row.target_type, row.target_id,
          row.changed, row.timestamp,
        ]
      );
    }
    console.log(`  audit_log: ${dump.audit_log.length} rows`);

    // 14. Seed pages
    for (const row of dump.pages) {
      await client.query(
        `INSERT INTO wiki.pages (section, slug, title, data, updated_at)
         VALUES ($1, $2, $3, $4::jsonb, COALESCE($5::timestamptz, now()))`,
        [row.section, row.slug, row.title, row.data, row.updated_at]
      );
    }
    console.log(`  pages: ${dump.pages.length} rows`);

    await client.query("COMMIT");
    console.log("\nMigration complete. All wiki data seeded into PostgreSQL.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();

