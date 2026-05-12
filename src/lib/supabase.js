import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient(url, key);

// ── Transform helpers ──────────────────────────────────────

export function dbToAgent(row) {
  return {
    id:               row.id,
    name:             row.name,
    role:             row.role,
    status:           row.status,
    phone:            row.phone,
    passRate:         row.pass_rate,
    weeklyHistory:    row.weekly_history   ?? [],
    currentWeekTests: row.current_week_tests ?? {},
    notes: (row.notes ?? [])
      .map((n) => ({ id: n.id, body: n.body, timestamp: n.note_ts }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    transcripts: (row.transcripts ?? [])
      .map((t) => ({
        id:           t.id,
        title:        t.title,
        recordingUrl: t.recording_url,
        transcript:   t.transcript,
        createdAt:    t.created_at,
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  };
}

export function agentToDb(agent) {
  return {
    id:                  agent.id,
    name:                agent.name,
    role:                agent.role,
    status:              agent.status,
    phone:               agent.phone,
    pass_rate:           agent.passRate,
    weekly_history:      agent.weeklyHistory,
    current_week_tests:  agent.currentWeekTests,
  };
}

export function dbToUpdate(row) {
  return {
    id:          row.id,
    type:        row.type,
    agentId:     row.agent_id,
    agentName:   row.agent_name,
    priority:    row.priority,
    title:       row.title,
    description: row.description,
    author:      row.author,
    createdAt:   row.created_at,
  };
}

export function updateToDb(update) {
  return {
    id:          update.id,
    type:        update.type,
    agent_id:    update.agentId  ?? null,
    agent_name:  update.agentName ?? null,
    priority:    update.priority,
    title:       update.title,
    description: update.description ?? '',
    author:      update.author,
    created_at:  update.createdAt,
  };
}
