-- ============================================================
-- EAM Wiki â€” PostgreSQL Schema
-- Replaces wiki.db (SQLite). Lives in the "wiki" schema
-- inside the existing eam_db PostgreSQL database.
-- ============================================================

CREATE SCHEMA IF NOT EXISTS wiki;

-- â”€â”€â”€ Core tables â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

CREATE TABLE IF NOT EXISTS wiki.features (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'planning'
                CHECK(status IN ('todo','planning','in_progress','done','blocked','cancelled')),
  sprint      TEXT,
  domain      TEXT,
  priority    INTEGER DEFAULT 5,
  size        TEXT,
  owner       TEXT,
  data        JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wiki.sprints (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'planned'
                CHECK(status IN ('planned','active','closed')),
  start_date  DATE,
  end_date    DATE,
  goal        TEXT,
  velocity    INTEGER DEFAULT 0,
  data        JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wiki.tasks (
  id          TEXT NOT NULL,
  feature_id  TEXT NOT NULL REFERENCES wiki.features(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'todo'
                CHECK(status IN ('todo','in_progress','done','blocked')),
  priority    TEXT DEFAULT 'P1',
  size        TEXT,
  notes       TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id, feature_id)
);

CREATE TABLE IF NOT EXISTS wiki.api_contracts (
  module      TEXT PRIMARY KEY,
  version     TEXT NOT NULL DEFAULT '1.0.0',
  status      TEXT NOT NULL DEFAULT 'draft'
                CHECK(status IN ('draft','approved','deprecated')),
  data        JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wiki.bugs (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  severity    TEXT NOT NULL DEFAULT 'medium'
                CHECK(severity IN ('low','medium','high','critical')),
  status      TEXT NOT NULL DEFAULT 'open'
                CHECK(status IN ('open','in_progress','fixed','wontfix','deferred')),
  feature     TEXT,
  sprint      TEXT,
  description TEXT,
  data        JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wiki.history (
  date        DATE PRIMARY KEY,
  title       TEXT,
  data        JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wiki.decisions (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'accepted'
                CHECK(status IN ('proposed','accepted','superseded','rejected')),
  feature     TEXT,
  data        JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wiki.changelog (
  version     TEXT PRIMARY KEY,
  date        DATE NOT NULL,
  sprint      TEXT,
  summary     TEXT NOT NULL,
  data        JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wiki.dashboard (
  id          INTEGER PRIMARY KEY CHECK(id = 1),
  data        JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wiki.audit_log (
  id          SERIAL PRIMARY KEY,
  tool        TEXT NOT NULL,
  author      TEXT NOT NULL DEFAULT 'vibe-agent',
  target_type TEXT,
  target_id   TEXT,
  changed     JSONB,
  timestamp   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wiki.pages (
  section     TEXT NOT NULL,
  slug        TEXT NOT NULL,
  title       TEXT,
  data        JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (section, slug)
);

-- â”€â”€â”€ Indexes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

CREATE INDEX IF NOT EXISTS idx_features_status   ON wiki.features(status);
CREATE INDEX IF NOT EXISTS idx_features_sprint   ON wiki.features(sprint);
CREATE INDEX IF NOT EXISTS idx_features_domain   ON wiki.features(domain);
CREATE INDEX IF NOT EXISTS idx_tasks_feature     ON wiki.tasks(feature_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status      ON wiki.tasks(status);
CREATE INDEX IF NOT EXISTS idx_bugs_status       ON wiki.bugs(status);
CREATE INDEX IF NOT EXISTS idx_bugs_severity     ON wiki.bugs(severity);
CREATE INDEX IF NOT EXISTS idx_bugs_feature      ON wiki.bugs(feature);
CREATE INDEX IF NOT EXISTS idx_bugs_sprint       ON wiki.bugs(sprint);
CREATE INDEX IF NOT EXISTS idx_audit_target      ON wiki.audit_log(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp   ON wiki.audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_changelog_date    ON wiki.changelog(date);
CREATE INDEX IF NOT EXISTS idx_sprints_status    ON wiki.sprints(status);
CREATE INDEX IF NOT EXISTS idx_pages_section     ON wiki.pages(section);

-- â”€â”€â”€ Full-Text Search (replaces SQLite FTS5) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- tsvector columns + GIN indexes + auto-update triggers

ALTER TABLE wiki.features ADD COLUMN IF NOT EXISTS tsv tsvector;
ALTER TABLE wiki.bugs     ADD COLUMN IF NOT EXISTS tsv tsvector;
ALTER TABLE wiki.decisions ADD COLUMN IF NOT EXISTS tsv tsvector;
ALTER TABLE wiki.api_contracts ADD COLUMN IF NOT EXISTS tsv tsvector;

CREATE INDEX IF NOT EXISTS idx_features_fts   ON wiki.features   USING GIN(tsv);
CREATE INDEX IF NOT EXISTS idx_bugs_fts       ON wiki.bugs       USING GIN(tsv);
CREATE INDEX IF NOT EXISTS idx_decisions_fts  ON wiki.decisions  USING GIN(tsv);
CREATE INDEX IF NOT EXISTS idx_contracts_fts  ON wiki.api_contracts USING GIN(tsv);

-- â”€â”€â”€ FTS trigger functions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

CREATE OR REPLACE FUNCTION wiki.features_tsv_trigger() RETURNS trigger AS $$
BEGIN
  NEW.tsv := to_tsvector('english',
    coalesce(NEW.title, '') || ' ' ||
    coalesce(NEW.domain, '') || ' ' ||
    coalesce(NEW.data->>'tldr', '') || ' ' ||
    coalesce(NEW.data->'content'->>'problem', '') || ' ' ||
    coalesce(NEW.data->'content'->>'solution', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_features_tsv ON wiki.features;
CREATE TRIGGER trg_features_tsv BEFORE INSERT OR UPDATE ON wiki.features
  FOR EACH ROW EXECUTE FUNCTION wiki.features_tsv_trigger();

CREATE OR REPLACE FUNCTION wiki.bugs_tsv_trigger() RETURNS trigger AS $$
BEGIN
  NEW.tsv := to_tsvector('english',
    coalesce(NEW.title, '') || ' ' ||
    coalesce(NEW.description, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bugs_tsv ON wiki.bugs;
CREATE TRIGGER trg_bugs_tsv BEFORE INSERT OR UPDATE ON wiki.bugs
  FOR EACH ROW EXECUTE FUNCTION wiki.bugs_tsv_trigger();

CREATE OR REPLACE FUNCTION wiki.decisions_tsv_trigger() RETURNS trigger AS $$
BEGIN
  NEW.tsv := to_tsvector('english',
    coalesce(NEW.title, '') || ' ' ||
    coalesce(NEW.data->>'rationale', '') || ' ' ||
    coalesce(NEW.data->>'notes', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_decisions_tsv ON wiki.decisions;
CREATE TRIGGER trg_decisions_tsv BEFORE INSERT OR UPDATE ON wiki.decisions
  FOR EACH ROW EXECUTE FUNCTION wiki.decisions_tsv_trigger();

CREATE OR REPLACE FUNCTION wiki.contracts_tsv_trigger() RETURNS trigger AS $$
BEGIN
  NEW.tsv := to_tsvector('english',
    coalesce(NEW.data::text, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_contracts_tsv ON wiki.api_contracts;
CREATE TRIGGER trg_contracts_tsv BEFORE INSERT OR UPDATE ON wiki.api_contracts
  FOR EACH ROW EXECUTE FUNCTION wiki.contracts_tsv_trigger();

