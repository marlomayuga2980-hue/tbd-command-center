-- ============================================================
-- TBD Agent Command Center — Initial Schema
-- Run this once in your Supabase SQL Editor
-- ============================================================

-- Agents (core data + JSONB blobs for tests & history)
CREATE TABLE IF NOT EXISTS agents (
  id                  TEXT PRIMARY KEY,
  name                TEXT NOT NULL,
  role                TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'healthy',
  phone               TEXT NOT NULL DEFAULT '+61 XXX XXX XXX',
  pass_rate           INTEGER NOT NULL DEFAULT 0,
  weekly_history      JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_week_tests  JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notes (one per agent, relational)
CREATE TABLE IF NOT EXISTS notes (
  id          TEXT PRIMARY KEY,
  agent_id    TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  body        TEXT NOT NULL,
  note_ts     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transcript logs (one per agent, relational)
CREATE TABLE IF NOT EXISTS transcripts (
  id             TEXT PRIMARY KEY,
  agent_id       TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  recording_url  TEXT,
  transcript     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Platform & agent updates feed
CREATE TABLE IF NOT EXISTS updates (
  id          TEXT PRIMARY KEY,
  type        TEXT NOT NULL,
  agent_id    TEXT,
  agent_name  TEXT,
  priority    TEXT NOT NULL DEFAULT 'info',
  title       TEXT NOT NULL,
  description TEXT,
  author      TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Access (internal tool — no auth required) ──────────────
ALTER TABLE agents      DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes       DISABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts DISABLE ROW LEVEL SECURITY;
ALTER TABLE updates     DISABLE ROW LEVEL SECURITY;

GRANT ALL ON agents      TO anon, authenticated;
GRANT ALL ON notes       TO anon, authenticated;
GRANT ALL ON transcripts TO anon, authenticated;
GRANT ALL ON updates     TO anon, authenticated;

-- ── Real-time replication ─────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE agents, notes, transcripts, updates;

-- ── Auto-update updated_at on agents ──────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS agents_updated_at ON agents;
CREATE TRIGGER agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
