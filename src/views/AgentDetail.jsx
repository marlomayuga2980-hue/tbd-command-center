import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Phone, CheckSquare, Plus, Trash2,
  Pencil, Check, ExternalLink, ChevronDown, Mic,
} from 'lucide-react';
import TestRow from '@/components/TestRow';
import AgentLineChart from '@/components/charts/AgentLineChart';
import Confetti from '@/components/ui/Confetti';
import { useStore } from '@/store/useStore';

const STATUS_CONFIG = {
  healthy:  { label: 'Healthy',  badge: 'bg-success/10 text-success border-success/25' },
  warning:  { label: 'Warning',  badge: 'bg-warning/10 text-warning border-warning/25' },
  critical: { label: 'Critical', badge: 'bg-danger/10  text-danger  border-danger/25'  },
};

const TEST_KEYS = ['callSuccess', 'emailToPM', 'streetcoIntegration'];

function formatTimestamp(ts) {
  if (!ts) return null;
  return new Date(ts).toLocaleDateString('en-AU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function InlinePhoneEditor({ agentId, phone }) {
  const updatePhone = useStore((s) => s.updatePhone);
  const addToast    = useStore((s) => s.addToast);
  const [editing, setEditing] = useState(false);
  const [value,   setValue]   = useState(phone);

  const save = () => {
    updatePhone(agentId, value);
    addToast({ title: 'Phone number saved', variant: 'success' });
    setEditing(false);
  };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter')  save();
    if (e.key === 'Escape') { setValue(phone); setEditing(false); }
  };

  return (
    <div className="flex items-center gap-2">
      <Phone className="w-4 h-4 text-slate-300 dark:text-white/30 flex-shrink-0" />
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={save}
            onKeyDown={handleKeyDown}
            autoFocus
            className="bg-slate-50 dark:bg-white/8 border border-tbd-blue/40 rounded-lg px-3 py-1 text-sm text-slate-800 dark:text-white font-mono focus:outline-none w-48"
          />
          <button onClick={save} className="text-success hover:opacity-80">
            <Check className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => { setEditing(true); setValue(phone); }}
          className="flex items-center gap-2 group"
        >
          <span className="text-slate-500 dark:text-white/60 text-sm font-mono hover:text-slate-900 dark:hover:text-white transition-colors">{phone}</span>
          <Pencil className="w-3.5 h-3.5 text-slate-300 dark:text-white/20 group-hover:text-tbd-blue transition-colors" />
        </button>
      )}
    </div>
  );
}

// ── Transcript Log section ─────────────────────────────────────

function TranscriptEntry({ agentId, transcript }) {
  const deleteTranscript = useStore((s) => s.deleteTranscript);
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="border border-slate-200 dark:border-white/8 rounded-xl overflow-hidden bg-white dark:bg-transparent"
    >
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-8 h-8 rounded-lg bg-tbd-blue/10 dark:bg-tbd-blue/15 flex items-center justify-center flex-shrink-0">
          <Mic className="w-4 h-4 text-tbd-blue" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-slate-800 dark:text-white/85 text-sm font-semibold truncate">{transcript.title}</p>
          <p className="text-slate-400 dark:text-white/30 text-xs mt-0.5">{formatTimestamp(transcript.createdAt)}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {transcript.recordingUrl && (
            <a
              href={transcript.recordingUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-xs text-tbd-blue hover:text-tbd-orange transition-colors font-medium"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Recording</span>
            </a>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-slate-300 dark:text-white/30 hover:text-slate-600 dark:hover:text-white/60 transition-colors"
          >
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </button>
          <button
            onClick={() => deleteTranscript(agentId, transcript.id)}
            className="text-slate-300 dark:text-white/20 hover:text-danger transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Transcript text */}
      <AnimatePresence initial={false}>
        {expanded && transcript.transcript && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-slate-100 dark:border-white/6">
              <pre className="mt-3 text-xs text-slate-600 dark:text-white/60 leading-relaxed whitespace-pre-wrap font-mono bg-slate-50 dark:bg-white/3 rounded-lg p-3 max-h-64 overflow-y-auto scrollbar-thin">
                {transcript.transcript}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TranscriptLogs({ agentId, transcripts }) {
  const addTranscript = useStore((s) => s.addTranscript);
  const addToast      = useStore((s) => s.addToast);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ title: '', recordingUrl: '', transcript: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    addTranscript(agentId, form);
    addToast({ title: 'Transcript added', variant: 'success' });
    setForm({ title: '', recordingUrl: '', transcript: '' });
    setShowForm(false);
  };

  return (
    <div className="card-surface rounded-2xl p-6">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-slate-900 dark:text-white font-semibold">Transcript Logs</h2>
          <p className="text-slate-400 dark:text-white/40 text-xs mt-0.5">Call transcripts and recording links</p>
        </div>
        <motion.button
          onClick={() => setShowForm(!showForm)}
          whileTap={{ scale: 0.96 }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
            showForm
              ? 'bg-slate-100 dark:bg-white/8 text-slate-600 dark:text-white/60'
              : 'bg-tbd-blue/10 dark:bg-tbd-blue/15 text-tbd-blue hover:bg-tbd-blue/15 dark:hover:bg-tbd-blue/25'
          }`}
        >
          <motion.div animate={{ rotate: showForm ? 45 : 0 }} transition={{ duration: 0.2 }}>
            <Plus className="w-4 h-4" />
          </motion.div>
          {showForm ? 'Cancel' : 'Add Transcript'}
        </motion.button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit}
            className="overflow-hidden"
          >
            <div className="space-y-3 pb-4 border-b border-slate-100 dark:border-white/8 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 dark:text-white/50 text-xs font-medium uppercase tracking-wider mb-1.5 block">Call Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Inbound enquiry — 12 May"
                    required
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white/80 placeholder-slate-300 dark:placeholder-white/20 focus:outline-none focus:border-tbd-blue/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-slate-500 dark:text-white/50 text-xs font-medium uppercase tracking-wider mb-1.5 block">Recording URL</label>
                  <input
                    type="url"
                    value={form.recordingUrl}
                    onChange={(e) => setForm({ ...form, recordingUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white/80 placeholder-slate-300 dark:placeholder-white/20 focus:outline-none focus:border-tbd-blue/50 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-500 dark:text-white/50 text-xs font-medium uppercase tracking-wider mb-1.5 block">Transcript</label>
                <textarea
                  value={form.transcript}
                  onChange={(e) => setForm({ ...form, transcript: e.target.value })}
                  placeholder="Paste the call transcript here..."
                  rows={5}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white/80 placeholder-slate-300 dark:placeholder-white/20 resize-none focus:outline-none focus:border-tbd-blue/50 transition-colors font-mono"
                />
              </div>
              <motion.button
                type="submit"
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2 rounded-xl gradient-cta text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Save Transcript
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Transcript list */}
      <div className="space-y-2">
        <AnimatePresence>
          {transcripts.length === 0 ? (
            <p className="text-slate-400 dark:text-white/25 text-sm text-center py-6">
              No transcripts yet. Add one to get started.
            </p>
          ) : (
            transcripts.map((t) => (
              <TranscriptEntry key={t.id} agentId={agentId} transcript={t} />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────

export default function AgentDetail({ agentId }) {
  const agents        = useStore((s) => s.agents);
  const navigateTo    = useStore((s) => s.navigateTo);
  const markAllTested = useStore((s) => s.markAllTested);
  const addNote       = useStore((s) => s.addNote);
  const deleteNote    = useStore((s) => s.deleteNote);
  const confettiBurst = useStore((s) => s.confettiBurst);
  const addToast      = useStore((s) => s.addToast);

  const [noteInput, setNoteInput] = useState('');

  const agent = agents.find((a) => a.id === agentId);
  if (!agent) return null;

  const cfg = STATUS_CONFIG[agent.status] ?? STATUS_CONFIG.healthy;

  const handleAddNote = () => {
    const body = noteInput.trim();
    if (!body) return;
    addNote(agentId, body);
    setNoteInput('');
    addToast({ title: 'Note added', variant: 'success' });
  };

  const handleNoteKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddNote();
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {confettiBurst && <Confetti />}

      {/* Back */}
      <motion.button
        onClick={() => navigateTo('dashboard')}
        whileTap={{ scale: 0.97 }}
        className="flex items-center gap-2 text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/80 transition-colors mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </motion.button>

      {/* Agent header */}
      <div className="card-surface rounded-2xl p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{agent.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.badge}`}>
                {cfg.label}
              </span>
            </div>
            <p className="text-slate-400 dark:text-white/40 text-sm mb-3">{agent.role}</p>
            <InlinePhoneEditor agentId={agentId} phone={agent.phone} />
          </div>
          <motion.button
            onClick={() => markAllTested(agentId)}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-cta text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <CheckSquare className="w-4 h-4" />
            Mark All Tested
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Test checklist */}
        <div className="card-surface rounded-2xl p-6">
          <h2 className="text-slate-900 dark:text-white font-semibold mb-4">Weekly Tests</h2>
          <div className="space-y-3">
            {TEST_KEYS.map((key) => (
              <TestRow
                key={key}
                agentId={agentId}
                testKey={key}
                test={agent.currentWeekTests[key]}
              />
            ))}
          </div>
        </div>

        {/* 12-week chart */}
        <div className="card-surface rounded-2xl p-6">
          <h2 className="text-slate-900 dark:text-white font-semibold mb-4">12-Week Pass Rate</h2>
          <AgentLineChart data={agent.weeklyHistory} agentId={agentId} />
          <p className="text-center text-slate-400 dark:text-white/30 text-xs mt-2">Pass rate over the last 12 weeks</p>
        </div>
      </div>

      {/* Notes */}
      <div className="card-surface rounded-2xl p-6 mb-6">
        <h2 className="text-slate-900 dark:text-white font-semibold mb-4">Notes</h2>

        <div className="flex gap-2 mb-4">
          <textarea
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            onKeyDown={handleNoteKeyDown}
            placeholder="Add a note... (Enter to save)"
            rows={2}
            className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white/80 placeholder-slate-300 dark:placeholder-white/20 resize-none focus:outline-none focus:border-tbd-blue/50 transition-colors"
          />
          <motion.button
            onClick={handleAddNote}
            whileTap={{ scale: 0.95 }}
            className="px-3 rounded-xl bg-tbd-blue/10 dark:bg-tbd-blue/20 border border-tbd-blue/25 dark:border-tbd-blue/30 text-tbd-blue hover:bg-tbd-blue/20 dark:hover:bg-tbd-blue/30 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {agent.notes.length === 0 && (
              <p className="text-slate-400 dark:text-white/25 text-sm text-center py-4">No notes yet.</p>
            )}
            {agent.notes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="flex items-start gap-3 bg-slate-50 dark:bg-white/3 border border-slate-100 dark:border-white/6 rounded-xl px-4 py-3"
              >
                <p className="flex-1 text-slate-700 dark:text-white/70 text-sm leading-relaxed">{note.body}</p>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <button
                    onClick={() => deleteNote(agentId, note.id)}
                    className="text-slate-300 dark:text-white/20 hover:text-danger transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-slate-400 dark:text-white/25 text-xs">{formatTimestamp(note.timestamp)}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Transcript Logs */}
      <TranscriptLogs agentId={agentId} transcripts={agent.transcripts ?? []} />
    </div>
  );
}
