import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Check, ClipboardCheck } from 'lucide-react';
import { useStore } from '@/store/useStore';

function formatTs(ts) {
  if (!ts) return null;
  return new Date(ts).toLocaleDateString('en-AU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function CheckRow({ check }) {
  const toggleCheck = useStore((s) => s.toggleCheck);
  const deleteCheck = useStore((s) => s.deleteCheck);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.18 }}
      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 group cursor-pointer ${
        check.passed
          ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/30 shadow-sm shadow-emerald-100 dark:shadow-emerald-900/20'
          : 'bg-white border-slate-200 dark:bg-white/4 dark:border-white/10 hover:border-tbd-blue/40 dark:hover:border-tbd-blue/30 hover:bg-blue-50/30 dark:hover:bg-tbd-blue/5'
      }`}
      onClick={() => toggleCheck(check.id)}
    >
      {/* Toggle button */}
      <motion.div
        whileTap={{ scale: 0.85 }}
        className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
          check.passed
            ? 'bg-emerald-500 border-emerald-500 shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30'
            : 'bg-white dark:bg-transparent border-slate-300 dark:border-white/25 group-hover:border-tbd-blue/60 dark:group-hover:border-tbd-blue/40'
        }`}
      >
        <AnimatePresence initial={false}>
          {check.passed && (
            <motion.div
              key="check"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              <Check className="w-4 h-4 text-white" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Label + timestamp */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold leading-snug ${
          check.passed
            ? 'text-emerald-800 dark:text-emerald-300 line-through decoration-emerald-400/60'
            : 'text-slate-700 dark:text-white/80'
        }`}>
          {check.label}
        </p>
        {check.checkedAt ? (
          <p className={`text-xs mt-0.5 font-medium ${
            check.passed ? 'text-emerald-600/70 dark:text-emerald-400/60' : 'text-slate-400 dark:text-white/30'
          }`}>
            {check.passed ? '✓ Passed' : 'Last checked'} · {formatTs(check.checkedAt)}
          </p>
        ) : (
          <p className="text-xs mt-0.5 text-slate-400 dark:text-white/25 font-medium">Not yet tested</p>
        )}
      </div>

      {/* Delete custom checks */}
      {!check.isDefault && (
        <button
          onClick={(e) => { e.stopPropagation(); deleteCheck(check.id); }}
          className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all flex-shrink-0"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
    </motion.div>
  );
}

export default function MaintenanceChecks({ agentId }) {
  const allChecks = useStore((s) => s.maintenanceChecks);
  const checks    = allChecks.filter((c) => c.agentId === agentId);
  const addCheck  = useStore((s) => s.addCheck);
  const [adding,   setAdding]   = useState(false);
  const [newLabel, setNewLabel] = useState('');

  const passed  = checks.filter((c) => c.passed).length;
  const total   = checks.length;
  const allPass = total > 0 && passed === total;

  const handleAdd = () => {
    const label = newLabel.trim();
    if (!label) return;
    addCheck(agentId, label);
    setNewLabel('');
    setAdding(false);
  };

  const sorted = [...checks].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="card-surface rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-white/8 bg-gradient-to-r from-tbd-blue/5 to-transparent dark:from-tbd-blue/8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-tbd-blue/10 dark:bg-tbd-blue/15 flex items-center justify-center flex-shrink-0">
              <ClipboardCheck className="w-4 h-4 text-tbd-blue" />
            </div>
            <div className="min-w-0">
              <h2 className="text-slate-900 dark:text-white font-bold text-[15px]">Maintenance Checks</h2>
              <p className="text-slate-400 dark:text-white/35 text-xs font-medium">Regular tests to confirm agent is working</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border whitespace-nowrap ${
              allPass
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/8 dark:text-white/50 dark:border-white/12'
            }`}>
              {passed}/{total} {allPass ? '✓ All passing' : 'passing'}
            </span>
            <motion.button
              onClick={() => setAdding(!adding)}
              whileTap={{ scale: 0.94 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-tbd-blue text-white hover:bg-tbd-deep text-xs font-semibold transition-colors shadow-sm shadow-tbd-blue/30 whitespace-nowrap"
            >
              <motion.span animate={{ rotate: adding ? 45 : 0 }} transition={{ duration: 0.18 }}>
                <Plus className="w-3.5 h-3.5" />
              </motion.span>
              Add Test
            </motion.button>
          </div>
        </div>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden border-b border-slate-100 dark:border-white/8"
          >
            <div className="flex gap-2 p-4 bg-blue-50/60 dark:bg-tbd-blue/5">
              <input
                autoFocus
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setAdding(false); setNewLabel(''); } }}
                placeholder="e.g. Voicemail fallback working"
                className="flex-1 bg-white dark:bg-white/8 border border-slate-200 dark:border-white/12 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white/85 placeholder-slate-400 dark:placeholder-white/25 focus:outline-none focus:border-tbd-blue focus:ring-2 focus:ring-tbd-blue/15 transition-all shadow-sm"
              />
              <motion.button
                onClick={handleAdd}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-xl gradient-cta text-white text-sm font-bold hover:opacity-90 shadow-sm flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Add
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Check rows */}
      <div className="p-4 space-y-2.5">
        <AnimatePresence initial={false}>
          {sorted.length === 0 ? (
            <p className="text-slate-400 dark:text-white/25 text-sm text-center py-6">No checks yet. Add one above.</p>
          ) : (
            sorted.map((check) => <CheckRow key={check.id} check={check} />)
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
