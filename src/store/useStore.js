import { create } from 'zustand';
import { supabase, dbToAgent, agentToDb, dbToCheck, checkToDb, dbToIssue, issueToDb } from '@/lib/supabase';
import { SEED_AGENTS, buildSeedChecks, SEED_ISSUES } from '@/data/seedData';

let toastCounter = 0;
const commentTimers = {};

// ── Status derivation ─────────────────────────────────────
export function deriveStatus(agentId, checks) {
  const defaults = checks.filter((c) => c.agentId === agentId && c.isDefault);
  if (defaults.length === 0) return 'warning';
  const passed = defaults.filter((c) => c.passed).length;
  if (passed === defaults.length) return 'healthy';
  if (passed === 0) return 'critical';
  return 'warning';
}

// ── Fetch helpers ─────────────────────────────────────────

async function fetchAgents() {
  const { data, error } = await supabase.from('agents').select('*').order('created_at');
  if (error) throw error;
  return data.map(dbToAgent);
}

async function fetchChecks() {
  const { data, error } = await supabase
    .from('maintenance_checks')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return data.map(dbToCheck);
}

async function fetchIssues() {
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(dbToIssue);
}

// ── Tab order ─────────────────────────────────────────────
export const MAIN_TAB_AGENT_IDS  = ['agent-2', 'agent-3', 'agent-4', 'agent-1'];
export const DEMO_TAB_AGENT_IDS  = ['demo-1', 'demo-2', 'demo-3', 'demo-4'];

// ── Store ─────────────────────────────────────────────────

export const useStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────
  agents:            [],
  maintenanceChecks: [],
  issues:            [],
  activeTab:         0,
  activeDemoSubTab:  0,
  toasts:            [],
  confettiBurst:     false,
  theme:             'light',
  loading:           true,
  error:             null,

  // ── Theme ──────────────────────────────────────────────
  toggleTheme: () =>
    set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),

  // ── Tab navigation ─────────────────────────────────────
  setActiveTab:        (n) => set({ activeTab: n }),
  setActiveDemoSubTab: (n) => set({ activeDemoSubTab: n }),

  // ── Initialise ─────────────────────────────────────────
  initialize: async () => {
    try {
      const [agents, checks, issues] = await Promise.all([
        fetchAgents(), fetchChecks(), fetchIssues(),
      ]);

      if (agents.length === 0) {
        await get().seedDatabase();
        return;
      }

      set({ agents, maintenanceChecks: checks, issues, loading: false });
      get().subscribeToChanges();
    } catch (err) {
      console.error('[TBD] Init error:', err);
      set({ error: err.message, loading: false });
    }
  },

  seedDatabase: async () => {
    for (const a of SEED_AGENTS) {
      const { error } = await supabase.from('agents').upsert(agentToDb(a));
      if (error) console.error('[TBD] seed agent error:', error);
    }
    for (const c of buildSeedChecks()) {
      const { error } = await supabase.from('maintenance_checks').upsert(c);
      if (error) console.error('[TBD] seed check error:', error);
    }
    for (const iss of SEED_ISSUES) {
      const { error } = await supabase.from('issues').upsert(iss);
      if (error) console.error('[TBD] seed issue error:', error);
    }

    const [agents, checks, issues] = await Promise.all([
      fetchAgents(), fetchChecks(), fetchIssues(),
    ]);
    console.log('[TBD] seed complete — agents:', agents.length);
    set({ agents, maintenanceChecks: checks, issues, loading: false });
    get().subscribeToChanges();
  },

  subscribeToChanges: () => {
    const reload = async () => {
      const [agents, checks, issues] = await Promise.all([
        fetchAgents(), fetchChecks(), fetchIssues(),
      ]);
      set({ agents, maintenanceChecks: checks, issues });
    };
    const reloadChecks = async () => set({ maintenanceChecks: await fetchChecks() });
    const reloadIssues = async () => set({ issues: await fetchIssues() });

    supabase
      .channel('tbd-realtime-v2')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' },             reload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_checks' }, reloadChecks)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'issues' },             reloadIssues)
      .subscribe();
  },

  // ── Agent mutations ────────────────────────────────────

  updatePhone: async (agentId, phone) => {
    set((s) => ({
      agents: s.agents.map((a) => a.id === agentId ? { ...a, phone } : a),
    }));
    const { error } = await supabase.from('agents').update({ phone }).eq('id', agentId);
    if (error) {
      get().addToast({ title: 'Failed to save phone number', variant: 'error' });
      set({ agents: await fetchAgents() });
    }
  },

  // ── Maintenance check mutations ────────────────────────

  toggleCheck: async (checkId) => {
    const check = get().maintenanceChecks.find((c) => c.id === checkId);
    if (!check) return;

    const newPassed   = !check.passed;
    const newCheckedAt = new Date().toISOString();

    set((s) => ({
      maintenanceChecks: s.maintenanceChecks.map((c) =>
        c.id !== checkId ? c : { ...c, passed: newPassed, checkedAt: newCheckedAt }
      ),
    }));

    const { error } = await supabase
      .from('maintenance_checks')
      .update({ passed: newPassed, checked_at: newCheckedAt })
      .eq('id', checkId);

    if (error) {
      get().addToast({ title: 'Save failed — please retry', variant: 'error' });
      set({ maintenanceChecks: await fetchChecks() });
    }
  },

  addCheck: async (agentId, label) => {
    const existing = get().maintenanceChecks.filter((c) => c.agentId === agentId);
    const sortOrder = existing.length;
    const id        = `mc-${agentId}-${Date.now()}`;
    const newCheck  = { id, agentId, label, passed: false, isDefault: false, sortOrder, checkedAt: null };

    set((s) => ({ maintenanceChecks: [...s.maintenanceChecks, newCheck] }));

    const { error } = await supabase.from('maintenance_checks').insert(checkToDb(newCheck));
    if (error) {
      get().addToast({ title: 'Failed to add test', variant: 'error' });
      set({ maintenanceChecks: await fetchChecks() });
    }
  },

  deleteCheck: async (checkId) => {
    set((s) => ({ maintenanceChecks: s.maintenanceChecks.filter((c) => c.id !== checkId) }));
    await supabase.from('maintenance_checks').delete().eq('id', checkId);
  },

  // ── Issue mutations ────────────────────────────────────

  addIssue: async (agentId, title) => {
    const id       = `iss-${agentId}-${Date.now()}`;
    const newIssue = {
      id, agentId, title,
      marloResult: 'pending',   marloComment: '',
      markResult:  'pending',   markComment:  '',
      michaelResult: 'pending', michaelComment: '',
      createdAt: new Date().toISOString(),
    };

    set((s) => ({ issues: [newIssue, ...s.issues] }));

    const { error } = await supabase.from('issues').insert(issueToDb(newIssue));
    if (error) {
      get().addToast({ title: 'Failed to add issue', variant: 'error' });
      set({ issues: await fetchIssues() });
    }
  },

  deleteIssue: async (issueId) => {
    set((s) => ({ issues: s.issues.filter((i) => i.id !== issueId) }));
    await supabase.from('issues').delete().eq('id', issueId);
  },

  updateIssueResult: async (issueId, tester, result) => {
    const field = `${tester}Result`;
    set((s) => ({
      issues: s.issues.map((i) => i.id !== issueId ? i : { ...i, [field]: result }),
    }));
    await supabase
      .from('issues')
      .update({ [`${tester}_result`]: result })
      .eq('id', issueId);
  },

  updateIssueComment: (issueId, tester, comment) => {
    const field = `${tester}Comment`;
    // Optimistic
    set((s) => ({
      issues: s.issues.map((i) => i.id !== issueId ? i : { ...i, [field]: comment }),
    }));
    // Debounced save
    const timerKey = `${issueId}-${tester}`;
    clearTimeout(commentTimers[timerKey]);
    commentTimers[timerKey] = setTimeout(async () => {
      await supabase
        .from('issues')
        .update({ [`${tester}_comment`]: comment })
        .eq('id', issueId);
    }, 600);
  },

  updateIssueTitle: async (issueId, title) => {
    set((s) => ({
      issues: s.issues.map((i) => i.id !== issueId ? i : { ...i, title }),
    }));
    await supabase.from('issues').update({ title }).eq('id', issueId);
  },

  // ── Toasts ─────────────────────────────────────────────
  addToast: ({ title, variant = 'info', duration = 3000 }) => {
    const id = `toast-${++toastCounter}`;
    set((s) => ({ toasts: [...s.toasts, { id, title, variant }] }));
    setTimeout(
      () => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      duration
    );
  },

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
