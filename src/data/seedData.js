function generateWeeklyHistory(baseRate, variance) {
  return Array.from({ length: 12 }, (_, i) => ({
    week: `W${i + 1}`,
    passRate: Math.min(100, Math.max(0,
      Math.round(baseRate + (Math.random() - 0.5) * variance * 2)
    )),
  }));
}

export const SEED_AGENTS = [
  {
    id: 'agent-1',
    name: 'TBD HR Screening Assistant',
    role: 'HR candidate screening',
    status: 'warning',
    phone: '+61 XXX XXX XXX',
    weeklyHistory: generateWeeklyHistory(72, 15),
    currentWeekTests: {
      callSuccess:         { passed: false, notes: '', timestamp: null },
      emailToPM:           { passed: false, notes: 'Emails routing to spam intermittently', timestamp: null },
      streetcoIntegration: { passed: false, notes: '', timestamp: null },
    },
    notes: [
      { id: 'n1-1', body: 'Client reported missed candidate calls on Tuesday — monitoring closely', timestamp: '2026-05-10T09:30:00Z' },
    ],
    transcripts: [],
    passRate: 72,
  },
  {
    id: 'agent-2',
    name: 'MVP Real Estate After Hour Support',
    role: 'After-hour real estate support',
    status: 'warning',
    phone: '+61 XXX XXX XXX',
    weeklyHistory: generateWeeklyHistory(68, 20),
    currentWeekTests: {
      callSuccess:         { passed: true,  notes: 'Confirmed working — tested twice', timestamp: '2026-05-12T09:15:00Z' },
      emailToPM:           { passed: false, notes: '', timestamp: null },
      streetcoIntegration: { passed: false, notes: 'API key may need rotation', timestamp: null },
    },
    notes: [
      { id: 'n2-1', body: 'Streetco re-auth ticket raised with their support team', timestamp: '2026-05-11T14:00:00Z' },
    ],
    transcripts: [],
    passRate: 68,
  },
  {
    id: 'agent-3',
    name: 'Inspire Estate AI Agent',
    role: 'Real estate inquiries',
    status: 'healthy',
    phone: '+61 XXX XXX XXX',
    weeklyHistory: generateWeeklyHistory(91, 8),
    currentWeekTests: {
      callSuccess:         { passed: true, notes: 'Perfect — no dropped calls', timestamp: '2026-05-12T08:00:00Z' },
      emailToPM:           { passed: true, notes: 'All PM emails delivered on time', timestamp: '2026-05-12T08:05:00Z' },
      streetcoIntegration: { passed: true, notes: 'Live listings updating in real time', timestamp: '2026-05-12T08:10:00Z' },
    },
    notes: [],
    transcripts: [],
    passRate: 91,
  },
  {
    id: 'agent-4',
    name: 'Potters Estate AI Agent',
    role: 'Real estate inquiries',
    status: 'critical',
    phone: '+61 XXX XXX XXX',
    weeklyHistory: generateWeeklyHistory(38, 25),
    currentWeekTests: {
      callSuccess:         { passed: false, notes: 'Calls drop at the 30-second mark', timestamp: null },
      emailToPM:           { passed: false, notes: '', timestamp: null },
      streetcoIntegration: { passed: false, notes: 'Auth error 403 — Streetco API key invalid', timestamp: null },
    },
    notes: [
      { id: 'n4-1', body: 'Escalated to Assistable support — ticket #AST-8812', timestamp: '2026-05-12T10:45:00Z' },
      { id: 'n4-2', body: 'Call drops suspected to be telephony provider issue — investigating', timestamp: '2026-05-12T09:00:00Z' },
    ],
    transcripts: [],
    passRate: 38,
  },
];

export const SEED_UPDATES = [
  {
    id: 'upd-1',
    type: 'agent',
    agentId: 'agent-4',
    agentName: 'Potters Estate AI Agent',
    priority: 'critical',
    title: 'Auth failure on Streetco integration',
    description: 'Potters Estate is receiving 403 errors from the Streetco API since 08:00 AM. Investigating API key rotation on their end. All inquiries are currently failing to retrieve live listings.',
    author: 'Marlo M.',
    createdAt: '2026-05-12T10:30:00Z',
  },
  {
    id: 'upd-2',
    type: 'agent',
    agentId: 'agent-3',
    agentName: 'Inspire Estate AI Agent',
    priority: 'info',
    title: 'All weekly tests passed — Week 12',
    description: 'Inspire Estate AI Agent passed all three weekly checks with zero issues. Call test, PM email routing, and Streetco integration all confirmed working. Pass rate holds at 91%.',
    author: 'Marlo M.',
    createdAt: '2026-05-12T09:00:00Z',
  },
  {
    id: 'upd-3',
    type: 'agent',
    agentId: 'agent-1',
    agentName: 'TBD HR Screening Assistant',
    priority: 'important',
    title: 'Candidate confirmation emails routing to spam',
    description: 'HR Screening Assistant emails are intermittently landing in spam folders. Whitelisting process has been raised with the email provider. Candidates advised to check spam in the meantime.',
    author: 'Marlo M.',
    createdAt: '2026-05-11T16:45:00Z',
  },
  {
    id: 'upd-4',
    type: 'platform',
    agentId: null,
    agentName: null,
    priority: 'info',
    title: 'Assistable.ai platform maintenance scheduled',
    description: 'Assistable.ai has scheduled maintenance on May 15 from 02:00–04:00 AEST. All agents may experience brief downtime. No action required — agents will resume automatically.',
    author: 'Marlo M.',
    createdAt: '2026-05-11T12:00:00Z',
  },
];
