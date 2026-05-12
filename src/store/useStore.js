import { create } from 'zustand';
import { supabase, dbToAgent, agentToDb, dbToUpdate, updateToDb } from '@/lib/supabase';
import { SEED_AGENTS, SEED_UPDATES } from '@/data/seedData';

let toastCounter = 0;

// ── Fetch helpers ─────────────────────────────────────────────

async function fetchAgents() {
  const { data: agentRows, error: agentErr } = await supabase
    .from('agents')
    .select('*')
    .order('created_at');
  if (agentErr) throw agentErr;

  const { data: noteRows,       error: noteErr }       = await supabase.from('notes').select('*');
  const { data: transcriptRows, error: transcriptErr } = await supabase.from('transcripts').select('*');
  if (noteErr)       console.warn('[TBD] notes fetch error:', noteErr);
  if (transcriptErr) console.warn('[TBD] transcripts fetch error:', transcriptErr);

  return agentRows.map((row) => ({
    ...row,
    notes:       (noteRows       ?? []).filter((n) => n.agent_id === row.id),
    transcripts: (transcriptRows ?? []).filter((t) => t.agent_id === row.id),
  })).map(dbToAgent);
}

async function fetchUpdates() {
  const { data, error } = await supabase
    .from('updates')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(dbToUpdate);
}

// ── Store ────────────────────────────────────────────────────

export const useStore = create((set, get) => ({
  // ── State ────────────────────────────────────────────────
  agents:          [],
  updates:         [],
  activeView:      'dashboard',
  selectedAgentId: null,
  toasts:          [],
  confettiBurst:   false,
  theme:           'light',
  loading:         true,
  error:           null,

  // ── Theme ─────────────────────────────────────────────────
  toggleTheme: () =>
    set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),

  // ── Initialise ────────────────────────────────────────────
  initialize: async () => {
    try {
      const [agents, updates] = await Promise.all([fetchAgents(), fetchUpdates()]);

      // Seed database on first run (empty agents table)
      if (agents.length === 0) {
        await get().seedDatabase();
        return;
      }

      set({ agents, updates, loading: false });
      get().subscribeToChanges();

    } catch (err) {
      console.error('[TBD] Init error:', err);
      set({ error: err.message, loading: false });
    }
  },

  seedDatabase: async () => {
    // Insert seed agents
    for (const a of SEED_AGENTS) {
      const { error } = await supabase.from('agents').upsert(agentToDb(a));
      if (error) console.error('[TBD] seed agent error:', error);
    }
    // Insert seed notes
    for (const a of SEED_AGENTS) {
      for (const n of a.notes) {
        const { error } = await supabase.from('notes').upsert({
          id: n.id, agent_id: a.id, body: n.body, note_ts: n.timestamp,
        });
        if (error) console.error('[TBD] seed note error:', error);
      }
    }
    // Insert seed updates
    for (const u of SEED_UPDATES) {
      const { error } = await supabase.from('updates').upsert(updateToDb(u));
      if (error) console.error('[TBD] seed update error:', error);
    }

    const [agents, updates] = await Promise.all([fetchAgents(), fetchUpdates()]);
    console.log('[TBD] seed complete — agents:', agents.length, 'updates:', updates.length);
    set({ agents, updates, loading: false });
    get().subscribeToChanges();
  },

  subscribeToChanges: () => {
    const onAgentChange  = async () => set({ agents:  await fetchAgents() });
    const onUpdateChange = async () => set({ updates: await fetchUpdates() });

    supabase
      .channel('tbd-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' },      onAgentChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' },       onAgentChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transcripts' }, onAgentChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'updates' },     onUpdateChange)
      .subscribe();
  },

  // ── Navigation ────────────────────────────────────────────
  navigateTo: (view, agentId = null) =>
    set({ activeView: view, selectedAgentId: agentId }),

  // ── Agent mutations ───────────────────────────────────────

  toggleTest: async (agentId, testKey) => {
    const agent = get().agents.find((a) => a.id === agentId);
    if (!agent) return;

    const updatedTests = {
      ...agent.currentWeekTests,
      [testKey]: {
        ...agent.currentWeekTests[testKey],
        passed:    !agent.currentWeekTests[testKey].passed,
        timestamp: new Date().toISOString(),
      },
    };

    // Optimistic update
    set((s) => ({
      agents: s.agents.map((a) =>
        a.id !== agentId ? a : { ...a, currentWeekTests: updatedTests }
      ),
    }));

    const { error } = await supabase
      .from('agents')
      .update({ current_week_tests: updatedTests })
      .eq('id', agentId);

    if (error) {
      get().addToast({ title: 'Save failed — please retry', variant: 'error' });
      set({ agents: await fetchAgents() }); // revert
    }
  },

  updateTestNotes: async (agentId, testKey, notes) => {
    const agent = get().agents.find((a) => a.id === agentId);
    if (!agent) return;

    const updatedTests = {
      ...agent.currentWeekTests,
      [testKey]: { ...agent.currentWeekTests[testKey], notes },
    };

    // Optimistic
    set((s) => ({
      agents: s.agents.map((a) =>
        a.id !== agentId ? a : { ...a, currentWeekTests: updatedTests }
      ),
    }));

    await supabase
      .from('agents')
      .update({ current_week_tests: updatedTests })
      .eq('id', agentId);
  },

  updatePhone: async (agentId, phone) => {
    // Optimistic
    set((s) => ({
      agents: s.agents.map((a) => a.id === agentId ? { ...a, phone } : a),
    }));

    const { error } = await supabase
      .from('agents')
      .update({ phone })
      .eq('id', agentId);

    if (error) {
      get().addToast({ title: 'Failed to save phone number', variant: 'error' });
      set({ agents: await fetchAgents() });
    }
  },

  addNote: async (agentId, body) => {
    const id        = `note-${Date.now()}`;
    const timestamp = new Date().toISOString();

    // Optimistic
    set((s) => ({
      agents: s.agents.map((a) =>
        a.id !== agentId ? a : {
          ...a,
          notes: [{ id, body, timestamp }, ...a.notes],
        }
      ),
    }));

    const { error } = await supabase.from('notes').insert({
      id, agent_id: agentId, body, note_ts: timestamp,
    });

    if (error) {
      get().addToast({ title: 'Failed to save note', variant: 'error' });
      set({ agents: await fetchAgents() });
    }
  },

  deleteNote: async (agentId, noteId) => {
    // Optimistic
    set((s) => ({
      agents: s.agents.map((a) =>
        a.id !== agentId ? a : { ...a, notes: a.notes.filter((n) => n.id !== noteId) }
      ),
    }));

    await supabase.from('notes').delete().eq('id', noteId);
  },

  markAllTested: async (agentId) => {
    const agent = get().agents.find((a) => a.id === agentId);
    if (!agent) return;

    const ts       = new Date().toISOString();
    const testKeys = ['callSuccess', 'emailToPM', 'streetcoIntegration'];
    const updatedTests = Object.fromEntries(
      testKeys.map((k) => [k, { ...agent.currentWeekTests[k], passed: true, timestamp: ts }])
    );

    // Optimistic
    set((s) => ({
      agents: s.agents.map((a) =>
        a.id !== agentId ? a : { ...a, currentWeekTests: updatedTests }
      ),
      confettiBurst: true,
    }));
    setTimeout(() => set({ confettiBurst: false }), 2500);
    get().addToast({ title: '🎉 All tests passed!', variant: 'success' });

    await supabase
      .from('agents')
      .update({ current_week_tests: updatedTests })
      .eq('id', agentId);
  },

  // ── Transcript logs ───────────────────────────────────────

  addTranscript: async (agentId, { title, recordingUrl, transcript }) => {
    const id        = `tr-${Date.now()}`;
    const createdAt = new Date().toISOString();

    // Optimistic
    set((s) => ({
      agents: s.agents.map((a) =>
        a.id !== agentId ? a : {
          ...a,
          transcripts: [{ id, title, recordingUrl, transcript, createdAt }, ...a.transcripts],
        }
      ),
    }));

    const { error } = await supabase.from('transcripts').insert({
      id,
      agent_id:      agentId,
      title,
      recording_url: recordingUrl || null,
      transcript:    transcript   || null,
      created_at:    createdAt,
    });

    if (error) {
      get().addToast({ title: 'Failed to save transcript', variant: 'error' });
      set({ agents: await fetchAgents() });
    }
  },

  deleteTranscript: async (agentId, transcriptId) => {
    // Optimistic
    set((s) => ({
      agents: s.agents.map((a) =>
        a.id !== agentId ? a : {
          ...a,
          transcripts: a.transcripts.filter((t) => t.id !== transcriptId),
        }
      ),
    }));

    await supabase.from('transcripts').delete().eq('id', transcriptId);
  },

  // ── Updates ───────────────────────────────────────────────

  postUpdate: async (data) => {
    const id        = `upd-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const entry     = { id, createdAt, author: 'You', ...data };

    // Optimistic
    set((s) => ({ updates: [entry, ...s.updates] }));

    const { error } = await supabase.from('updates').insert(updateToDb(entry));

    if (error) {
      get().addToast({ title: 'Failed to post update', variant: 'error' });
      set({ updates: await fetchUpdates() });
    }
  },

  // ── Toasts ────────────────────────────────────────────────
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
