// ── Seed Agents ───────────────────────────────────────────

export const SEED_AGENTS = [
  { id: 'agent-2', name: 'MVP Real Estate After Hour Support', role: 'After-hour real estate support',  status: 'warning', phone: '+61 XXX XXX XXX',   agent_group: 'main' },
  { id: 'agent-3', name: 'Inspire Estate AI Agent',            role: 'Real estate inquiries',           status: 'healthy', phone: '+61 XXX XXX XXX',   agent_group: 'main' },
  { id: 'agent-4', name: 'Potters Estate AI Agent',            role: 'Real estate inquiries',           status: 'critical',phone: '+61 XXX XXX XXX',   agent_group: 'main' },
  { id: 'agent-1', name: 'TBD HR Screening Assistant',         role: 'HR candidate screening',          status: 'warning', phone: '+61 XXX XXX XXX',   agent_group: 'main' },
  { id: 'demo-1',  name: 'Demo BURLEIGH TBD Realty',           role: 'Demo real estate AI agent',       status: 'healthy', phone: '+61 XXX XXX XXX',   agent_group: 'demo' },
  { id: 'demo-2',  name: 'DEMO LONDON TBD REALTY',             role: 'Demo real estate AI agent',       status: 'healthy', phone: '+44 XXX XXX XXXX',  agent_group: 'demo' },
  { id: 'demo-3',  name: 'Demo - USA',                         role: 'Demo real estate AI agent',       status: 'healthy', phone: '+1 XXX XXX XXXX',   agent_group: 'demo' },
  { id: 'demo-4',  name: 'DEMO AUCKLAND TBD REALTY',           role: 'Demo real estate AI agent',       status: 'healthy', phone: '+64 XXX XXX XXXX',  agent_group: 'demo' },
];

// ── Default maintenance check labels ─────────────────────
const DEFAULT_CHECKS = [
  'AI agent responds on call',
  'Number integration working',
  'Call summary email delivered',
];

export function buildSeedChecks() {
  const checks = [];
  SEED_AGENTS.forEach((agent) => {
    DEFAULT_CHECKS.forEach((label, idx) => {
      checks.push({
        id:         `mc-${agent.id}-${idx}`,
        agent_id:   agent.id,
        label,
        passed:     false,
        is_default: true,
        sort_order: idx,
      });
    });
  });
  return checks;
}

// ── Sample seed issues ────────────────────────────────────
export const SEED_ISSUES = [
  { id: 'iss-2-1', agent_id: 'agent-2', title: 'Streetco integration returning stale listings' },
  { id: 'iss-2-2', agent_id: 'agent-2', title: 'After-hours call not transferring to voicemail' },
  { id: 'iss-3-1', agent_id: 'agent-3', title: 'Confirm viewing booking email not sending' },
  { id: 'iss-4-1', agent_id: 'agent-4', title: 'API key 403 error on Streetco — needs rotation' },
  { id: 'iss-4-2', agent_id: 'agent-4', title: 'Call drops at 30-second mark' },
  { id: 'iss-1-1', agent_id: 'agent-1', title: 'Candidate confirmation emails landing in spam' },
];
