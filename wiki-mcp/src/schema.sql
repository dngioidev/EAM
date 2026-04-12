-- EAM Wiki SQLite Schema v1
-- Sprint 4.5 / wiki-infra T002
-- BR-WIKII-06: WAL mode is set at connection time in db.ts (PRAGMA journal_mode=WAL)
-- All tables include a `data` JSON text column for the full typed record,
-- plus indexed columns for filtering without JSON extraction.

-- ─── Enumerations enforced via CHECK ─────────────────────────────────────────

-- feature status: todo | planning | in_progress | done | blocked | cancelled
-- sprint status:  planned | active | closed
-- task status:    todo | in_progress | done | blocked
-- bug severity:   low | medium | high | critical
-- bug status:     open | in_progress | fixed | wontfix | deferred

-- ─── Core tables ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS features (
  id          TEXT PRIMARY KEY,          -- e.g. 'auth', 'wiki-infra'
  title       TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'planning'
                CHECK(status IN ('todo','planning','in_progress','done','blocked','cancelled')),
  sprint      TEXT,                      -- sprint id this feature belongs to
  domain      TEXT,                      -- e.g. 'internal-tooling', 'pos'
  priority    INTEGER DEFAULT 5,
  size        TEXT,                      -- S/M/L/XL
  owner       TEXT,
  data        TEXT NOT NULL,             -- full JSON record (pretty-printed)
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

CREATE TABLE IF NOT EXISTS sprints (
  id          TEXT PRIMARY KEY,          -- e.g. 'sprint-4-5'
  title       TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'planned'
                CHECK(status IN ('planned','active','closed')),
  start_date  TEXT,                      -- ISO date YYYY-MM-DD
  end_date    TEXT,
  goal        TEXT,
  velocity    INTEGER DEFAULT 0,
  data        TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

CREATE TABLE IF NOT EXISTS tasks (
  id          TEXT NOT NULL,             -- e.g. 'T001'
  feature_id  TEXT NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'todo'
                CHECK(status IN ('todo','in_progress','done','blocked')),
  priority    TEXT DEFAULT 'P1',         -- P0/P1/P2/P3
  size        TEXT,
  notes       TEXT,
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  PRIMARY KEY (id, feature_id)
);

CREATE TABLE IF NOT EXISTS api_contracts (
  module      TEXT PRIMARY KEY,          -- e.g. 'auth', 'order'
  version     TEXT NOT NULL DEFAULT '1.0.0',
  status      TEXT NOT NULL DEFAULT 'draft'
                CHECK(status IN ('draft','approved','deprecated')),
  data        TEXT NOT NULL,
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

CREATE TABLE IF NOT EXISTS bugs (
  id          TEXT PRIMARY KEY,          -- e.g. 'BUG-0001'
  title       TEXT NOT NULL,
  severity    TEXT NOT NULL DEFAULT 'medium'
                CHECK(severity IN ('low','medium','high','critical')),
  status      TEXT NOT NULL DEFAULT 'open'
                CHECK(status IN ('open','in_progress','fixed','wontfix','deferred')),
  feature     TEXT,                      -- related feature id (optional)
  sprint      TEXT,
  description TEXT,
  data        TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

CREATE TABLE IF NOT EXISTS history (
  date        TEXT PRIMARY KEY,          -- ISO date YYYY-MM-DD
  title       TEXT,
  data        TEXT NOT NULL,
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

CREATE TABLE IF NOT EXISTS decisions (
  id          TEXT PRIMARY KEY,          -- e.g. 'DEC-0001'
  title       TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'accepted'
                CHECK(status IN ('proposed','accepted','superseded','rejected')),
  feature     TEXT,
  data        TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

CREATE TABLE IF NOT EXISTS changelog (
  version     TEXT PRIMARY KEY,          -- semver e.g. '0.17.0'
  date        TEXT NOT NULL,
  sprint      TEXT,
  summary     TEXT NOT NULL,
  data        TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

-- ─── Dashboard singleton ───────────────────────────────────────────────────────
-- Single row (id=1) storing the serialized dashboard.json content
CREATE TABLE IF NOT EXISTS dashboard (
  id          INTEGER PRIMARY KEY CHECK(id = 1),
  data        TEXT NOT NULL,
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

-- ─── Audit log — BR-WIKII-04 ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  tool        TEXT NOT NULL,             -- MCP tool name e.g. 'wiki_feature_update'
  author      TEXT NOT NULL DEFAULT 'vibe-agent',
  target_type TEXT,                      -- 'feature', 'sprint', 'bug', etc.
  target_id   TEXT,                      -- the record ID affected
  changed     TEXT,                      -- JSON diff / patch applied
  timestamp   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

-- ─── Indexes for common query patterns ────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_features_status   ON features(status);
CREATE INDEX IF NOT EXISTS idx_features_sprint   ON features(sprint);
CREATE INDEX IF NOT EXISTS idx_features_domain   ON features(domain);
CREATE INDEX IF NOT EXISTS idx_tasks_feature     ON tasks(feature_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status      ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_bugs_status       ON bugs(status);
CREATE INDEX IF NOT EXISTS idx_bugs_severity     ON bugs(severity);
CREATE INDEX IF NOT EXISTS idx_bugs_feature      ON bugs(feature);
CREATE INDEX IF NOT EXISTS idx_bugs_sprint       ON bugs(sprint);
CREATE INDEX IF NOT EXISTS idx_audit_target      ON audit_log(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp   ON audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_changelog_date    ON changelog(date);
CREATE INDEX IF NOT EXISTS idx_sprints_status    ON sprints(status);

-- ─── FTS5 virtual tables — T008 ───────────────────────────────────────────────
-- content= tables mirror the base table columns; rowid references base table rowid
-- Tokenizer: unicode61 (handles Vietnamese text and accented characters)

CREATE VIRTUAL TABLE IF NOT EXISTS features_fts USING fts5(
  id UNINDEXED,
  title,
  domain UNINDEXED,
  body,                                  -- tldr + problem + solution concatenated at insert
  tokenize = 'unicode61'
);

CREATE VIRTUAL TABLE IF NOT EXISTS bugs_fts USING fts5(
  id UNINDEXED,
  title,
  description,
  tokenize = 'unicode61'
);

CREATE VIRTUAL TABLE IF NOT EXISTS decisions_fts USING fts5(
  id UNINDEXED,
  title,
  body,                                  -- rationale + notes concatenated at insert
  tokenize = 'unicode61'
);

CREATE VIRTUAL TABLE IF NOT EXISTS contracts_fts USING fts5(
  module UNINDEXED,
  body,                                  -- concatenated endpoint paths + descriptions
  tokenize = 'unicode61'
);

-- ─── Generic pages — catch-all for sections not in dedicated tables ────────────
-- Stores techstack, rulebook, impact-map, business-workflow, design, plan, etc.
-- Keyed by (section, slug) so the wiki-app can query by URL path segment.
-- Single-file sections (onboarding.json, glossary.json, etc.) use slug = '_index'.
CREATE TABLE IF NOT EXISTS pages (
  section     TEXT NOT NULL,             -- e.g. 'techstack', 'rulebook', 'design'
  slug        TEXT NOT NULL,             -- e.g. 'backend', '_index' for single files
  title       TEXT,
  data        TEXT NOT NULL,
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  PRIMARY KEY (section, slug)
);

CREATE INDEX IF NOT EXISTS idx_pages_section ON pages(section);
