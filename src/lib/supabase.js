import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

if (!url) {
  throw new Error('VITE_SUPABASE_URL is missing. Add it in Vercel → Settings → Environment Variables.');
}
if (!key) {
  throw new Error('VITE_SUPABASE_ANON_KEY is missing. Add it in Vercel → Settings → Environment Variables.');
}
if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
  throw new Error(`VITE_SUPABASE_URL looks wrong: "${url}". It must be exactly like: https://xxxxxx.supabase.co`);
}

export const supabase = createClient(url, key);

export function dbToAgent(row) {
  return {
    id:         row.id,
    name:       row.name,
    role:       row.role,
    status:     row.status,
    phone:      row.phone,
    agentGroup: row.agent_group ?? 'main',
  };
}

export function agentToDb(agent) {
  return {
    id:          agent.id,
    name:        agent.name,
    role:        agent.role,
    status:      agent.status,
    phone:       agent.phone,
    agent_group: agent.agent_group ?? 'main',
    pass_rate:          0,
    weekly_history:     [],
    current_week_tests: {},
  };
}

export function dbToCheck(row) {
  return {
    id:        row.id,
    agentId:   row.agent_id,
    label:     row.label,
    passed:    row.passed,
    checkedAt: row.checked_at,
    isDefault: row.is_default,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

export function checkToDb(check) {
  return {
    id:         check.id,
    agent_id:   check.agentId,
    label:      check.label,
    passed:     check.passed,
    checked_at: check.checkedAt ?? null,
    is_default: check.isDefault ?? false,
    sort_order: check.sortOrder ?? 0,
  };
}

export function dbToIssue(row) {
  return {
    id:             row.id,
    agentId:        row.agent_id,
    title:          row.title,
    marloResult:    row.marlo_result,
    marloComment:   row.marlo_comment,
    markResult:     row.mark_result,
    markComment:    row.mark_comment,
    michaelResult:  row.michael_result,
    michaelComment: row.michael_comment,
    createdAt:      row.created_at,
  };
}

export function issueToDb(issue) {
  return {
    id:              issue.id,
    agent_id:        issue.agentId,
    title:           issue.title,
    marlo_result:    issue.marloResult    ?? 'pending',
    marlo_comment:   issue.marloComment   ?? '',
    mark_result:     issue.markResult     ?? 'pending',
    mark_comment:    issue.markComment    ?? '',
    michael_result:  issue.michaelResult  ?? 'pending',
    michael_comment: issue.michaelComment ?? '',
  };
}
