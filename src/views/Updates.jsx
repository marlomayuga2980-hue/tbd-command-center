import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import UpdateCard from '@/components/UpdateCard';
import PostUpdateModal from '@/components/modals/PostUpdateModal';
import { useStore } from '@/store/useStore';

const FILTER_OPTS = [
  { key: 'all',       label: 'All' },
  { key: 'platform',  label: 'Platform' },
  { key: 'agent',     label: 'Agent' },
  { key: 'info',      label: 'Info' },
  { key: 'important', label: 'Important' },
  { key: 'critical',  label: 'Critical' },
];

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function Updates() {
  const updates  = useStore((s) => s.updates);
  const [filter,    setFilter]    = useState('all');
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = updates.filter((u) => {
    if (filter === 'all') return true;
    if (filter === 'platform' || filter === 'agent') return u.type === filter;
    return u.priority === filter;
  });

  const platform = filtered.filter((u) => u.type === 'platform');
  const agent    = filtered.filter((u) => u.type === 'agent');

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Update Command Center</h1>
          <p className="text-slate-400 dark:text-white/40 text-sm mt-1">{updates.length} total updates</p>
        </div>
        <motion.button
          onClick={() => setModalOpen(true)}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-cta text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Post Update
        </motion.button>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTER_OPTS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setFilter(opt.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === opt.key
                ? 'bg-tbd-blue text-white'
                : 'bg-slate-100 dark:bg-white/6 text-slate-500 dark:text-white/50 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white/80'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Two-column feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-tbd-blue" />
            <h2 className="text-slate-500 dark:text-white/70 text-sm font-semibold uppercase tracking-wider">Platform Updates</h2>
            <span className="text-slate-300 dark:text-white/25 text-xs ml-auto">{platform.length}</span>
          </div>
          <motion.div
            key={filter + '-platform'}
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            <AnimatePresence>
              {platform.length === 0 ? (
                <p className="text-slate-300 dark:text-white/20 text-sm text-center py-8">No platform updates</p>
              ) : (
                platform.map((u) => (
                  <motion.div key={u.id} variants={staggerItem}>
                    <UpdateCard update={u} />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Agent */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-tbd-orange" />
            <h2 className="text-slate-500 dark:text-white/70 text-sm font-semibold uppercase tracking-wider">Agent Updates</h2>
            <span className="text-slate-300 dark:text-white/25 text-xs ml-auto">{agent.length}</span>
          </div>
          <motion.div
            key={filter + '-agent'}
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            <AnimatePresence>
              {agent.length === 0 ? (
                <p className="text-slate-300 dark:text-white/20 text-sm text-center py-8">No agent updates</p>
              ) : (
                agent.map((u) => (
                  <motion.div key={u.id} variants={staggerItem}>
                    <UpdateCard update={u} />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      <PostUpdateModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
