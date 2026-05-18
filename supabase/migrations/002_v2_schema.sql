-- ============================================================
-- TBD Agent Command Center — v2 Schema Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Add agent_group column to agents
ALTER TABLE agents ADD COLUMN IF NOT EXISTS agent_group TEXT NOT NULL DEFAULT 'main';

-- ── Maintenance Checks ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS maintenance_checks (
  id          TEXT PRIMARY KEY,
  agent_id    TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  passed      BOOLEAN NOT NULL DEFAULT false,
  checked_at  TIMESTAMPTZ,
  is_default  BOOLEAN NOT NULL DEFAULT false,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Issues ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS issues (
  id               TEXT PRIMARY KEY,
  agent_id         TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  marlo_result     TEXT NOT NULL DEFAULT 'pending',
  marlo_comment    TEXT NOT NULL DEFAULT '',
  mark_result      TEXT NOT NULL DEFAULT 'pending',
  mark_comment     TEXT NOT NULL DEFAULT '',
  michael_result   TEXT NOT NULL DEFAULT 'pending',
  michael_comment  TEXT NOT NULL DEFAULT '',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Access ─────────────────────────────────────────────────
ALTER TABLE maintenance_checks DISABLE ROW LEVEL SECURITY;
ALTER TABLE issues              DISABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON maintenance_checks TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON issues              TO anon, authenticated;

-- ── Real-time replication ──────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE maintenance_checks, issues;

-- ── Insert 4 demo agents ───────────────────────────────────
INSERT INTO agents (id, name, role, status, phone, pass_rate, weekly_history, current_week_tests, agent_group)
VALUES
  ('demo-1', 'Demo BURLEIGH TBD Realty',  'Demo real estate AI agent', 'healthy', '+61 XXX XXX XXX', 0, '[]', '{}', 'demo'),
  ('demo-2', 'DEMO LONDON TBD REALTY',    'Demo real estate AI agent', 'healthy', '+44 XXX XXX XXXX', 0, '[]', '{}', 'demo'),
  ('demo-3', 'Demo - USA',                'Demo real estate AI agent', 'healthy', '+1 XXX XXX XXXX', 0, '[]', '{}', 'demo'),
  ('demo-4', 'DEMO AUCKLAND TBD REALTY',  'Demo real estate AI agent', 'healthy', '+64 XXX XXX XXXX', 0, '[]', '{}', 'demo')
ON CONFLICT (id) DO NOTHING;

-- ── Seed default maintenance checks for all 8 agents ───────
INSERT INTO maintenance_checks (id, agent_id, label, passed, is_default, sort_order) VALUES
  -- MVP Real Estate (agent-2)
  ('mc-2-1', 'agent-2', 'AI agent responds on call',       false, true,  0),
  ('mc-2-2', 'agent-2', 'Number integration working',      false, true,  1),
  ('mc-2-3', 'agent-2', 'Call summary email delivered',    false, true,  2),
  -- Inspire Estate (agent-3)
  ('mc-3-1', 'agent-3', 'AI agent responds on call',       false, true,  0),
  ('mc-3-2', 'agent-3', 'Number integration working',      false, true,  1),
  ('mc-3-3', 'agent-3', 'Call summary email delivered',    false, true,  2),
  -- Potters Estate (agent-4)
  ('mc-4-1', 'agent-4', 'AI agent responds on call',       false, true,  0),
  ('mc-4-2', 'agent-4', 'Number integration working',      false, true,  1),
  ('mc-4-3', 'agent-4', 'Call summary email delivered',    false, true,  2),
  -- TBD HR (agent-1)
  ('mc-1-1', 'agent-1', 'AI agent responds on call',       false, true,  0),
  ('mc-1-2', 'agent-1', 'Number integration working',      false, true,  1),
  ('mc-1-3', 'agent-1', 'Call summary email delivered',    false, true,  2),
  -- Demo BURLEIGH (demo-1)
  ('mc-d1-1', 'demo-1', 'AI agent responds on call',       false, true,  0),
  ('mc-d1-2', 'demo-1', 'Number integration working',      false, true,  1),
  ('mc-d1-3', 'demo-1', 'Call summary email delivered',    false, true,  2),
  -- Demo LONDON (demo-2)
  ('mc-d2-1', 'demo-2', 'AI agent responds on call',       false, true,  0),
  ('mc-d2-2', 'demo-2', 'Number integration working',      false, true,  1),
  ('mc-d2-3', 'demo-2', 'Call summary email delivered',    false, true,  2),
  -- Demo USA (demo-3)
  ('mc-d3-1', 'demo-3', 'AI agent responds on call',       false, true,  0),
  ('mc-d3-2', 'demo-3', 'Number integration working',      false, true,  1),
  ('mc-d3-3', 'demo-3', 'Call summary email delivered',    false, true,  2),
  -- Demo AUCKLAND (demo-4)
  ('mc-d4-1', 'demo-4', 'AI agent responds on call',       false, true,  0),
  ('mc-d4-2', 'demo-4', 'Number integration working',      false, true,  1),
  ('mc-d4-3', 'demo-4', 'Call summary email delivered',    false, true,  2)
ON CONFLICT (id) DO NOTHING;

-- ── Seed sample issues ─────────────────────────────────────
INSERT INTO issues (id, agent_id, title) VALUES
  ('iss-2-1', 'agent-2', 'Streetco integration returning stale listings'),
  ('iss-2-2', 'agent-2', 'After-hours call not transferring to voicemail'),
  ('iss-3-1', 'agent-3', 'Confirm viewing booking email not sending'),
  ('iss-4-1', 'agent-4', 'API key 403 error on Streetco — needs rotation'),
  ('iss-4-2', 'agent-4', 'Call drops at 30-second mark'),
  ('iss-1-1', 'agent-1', 'Candidate confirmation emails landing in spam')
ON CONFLICT (id) DO NOTHING;
