import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useStore } from '@/store/useStore';

const TEST_META = {
  callSuccess:         { label: 'Call test successful',           emoji: '☎️' },
  emailToPM:           { label: 'Email sent to Property Manager', emoji: '📧' },
  streetcoIntegration: { label: 'street.co integration working',  emoji: '🌐' },
};

function formatTimestamp(ts) {
  if (!ts) return null;
  const d = new Date(ts);
  return d.toLocaleDateString('en-AU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function TestRow({ agentId, testKey, test }) {
  const toggleTest      = useStore((s) => s.toggleTest);
  const updateTestNotes = useStore((s) => s.updateTestNotes);
  const addToast        = useStore((s) => s.addToast);
  const [expanded, setExpanded] = useState(false);
  const meta = TEST_META[testKey];

  const handleToggle = () => {
    toggleTest(agentId, testKey);
    addToast({
      title:   test.passed ? `${meta.emoji} Marked as failed` : `${meta.emoji} Marked as passed`,
      variant: test.passed ? 'error' : 'success',
    });
  };

  return (
    <motion.div
      whileTap={{ scale: 0.99 }}
      className="rounded-xl border border-slate-200 dark:border-white/8 overflow-hidden bg-white dark:bg-transparent"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Custom toggle */}
        <button
          onClick={handleToggle}
          className="flex-shrink-0 focus:outline-none"
          aria-label={`Toggle ${meta.label}`}
        >
          <motion.div
            animate={{
              backgroundColor: test.passed ? '#10B981' : 'transparent',
              borderColor:     test.passed ? '#10B981' : 'rgba(0,0,0,0.2)',
              scale: [1, 1.15, 1],
            }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-5 h-5 rounded-md border-2 flex items-center justify-center dark:[&]:border-white/20"
          >
            <AnimatePresence>
              {test.passed && (
                <motion.svg
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{   scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </motion.svg>
              )}
            </AnimatePresence>
          </motion.div>
        </button>

        {/* Label */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm">{meta.emoji}</span>
            <span className={`text-sm font-medium ${test.passed ? 'text-slate-400 dark:text-white/40 line-through' : 'text-slate-700 dark:text-white/80'}`}>
              {meta.label}
            </span>
          </div>
          {test.timestamp && (
            <p className="text-xs text-slate-400 dark:text-white/30 mt-0.5">Tested {formatTimestamp(test.timestamp)}</p>
          )}
        </div>

        {/* Expand notes */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-slate-300 dark:text-white/30 hover:text-slate-600 dark:hover:text-white/60 transition-colors flex-shrink-0"
        >
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </button>
      </div>

      {/* Notes area */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 border-t border-slate-100 dark:border-white/6">
              <textarea
                value={test.notes}
                onChange={(e) => updateTestNotes(agentId, testKey, e.target.value)}
                placeholder="Add notes..."
                rows={2}
                className="mt-2 w-full bg-slate-50 dark:bg-white/4 border border-slate-200 dark:border-white/8 rounded-lg px-3 py-2 text-xs text-slate-700 dark:text-white/70 placeholder-slate-300 dark:placeholder-white/20 resize-none focus:outline-none focus:border-tbd-blue/50 transition-colors"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
