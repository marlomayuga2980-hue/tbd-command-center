import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useStore } from '@/store/useStore';

const PRIORITIES = [
  { value: 'info',      label: 'Info',      color: 'text-tbd-blue',  ring: 'ring-tbd-blue' },
  { value: 'important', label: 'Important', color: 'text-warning',   ring: 'ring-warning' },
  { value: 'critical',  label: 'Critical',  color: 'text-danger',    ring: 'ring-danger' },
];

export default function PostUpdateModal({ isOpen, onClose }) {
  const agents     = useStore((s) => s.agents);
  const postUpdate = useStore((s) => s.postUpdate);
  const addToast   = useStore((s) => s.addToast);

  const [type,        setType]        = useState('platform');
  const [agentId,     setAgentId]     = useState('');
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [priority,    setPriority]    = useState('info');

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else        document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const reset = () => {
    setType('platform'); setAgentId(''); setTitle('');
    setDescription(''); setPriority('info');
  };

  const handleClose  = () => { reset(); onClose(); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const selectedAgent = agents.find((a) => a.id === agentId);
    postUpdate({
      type,
      agentId:     type === 'agent' ? agentId : null,
      agentName:   type === 'agent' && selectedAgent ? selectedAgent.name : null,
      title:       title.trim(),
      description: description.trim(),
      priority,
    });
    addToast({ title: 'Update posted successfully', variant: 'success' });
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm"
          />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{   opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="relative w-full max-w-lg bg-white dark:bg-[#0d1b33] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-slate-900 dark:text-white font-semibold text-lg">Post Update</h2>
              <button
                onClick={handleClose}
                className="text-slate-400 dark:text-white/30 hover:text-slate-700 dark:hover:text-white/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Type toggle */}
              <div>
                <label className="text-slate-500 dark:text-white/50 text-xs font-medium uppercase tracking-wider mb-2 block">Type</label>
                <div className="flex gap-2">
                  {['platform', 'agent'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => { setType(t); setAgentId(''); }}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                        type === t
                          ? 'bg-tbd-blue text-white'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/50 hover:bg-slate-200 dark:hover:bg-white/8'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Agent selector */}
              <AnimatePresence>
                {type === 'agent' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <label className="text-slate-500 dark:text-white/50 text-xs font-medium uppercase tracking-wider mb-2 block">Agent</label>
                    <select
                      value={agentId}
                      onChange={(e) => setAgentId(e.target.value)}
                      required={type === 'agent'}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-700 dark:text-white/80 focus:outline-none focus:border-tbd-blue/50 transition-colors"
                    >
                      <option value="">Select agent...</option>
                      {agents.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Title */}
              <div>
                <label className="text-slate-500 dark:text-white/50 text-xs font-medium uppercase tracking-wider mb-2 block">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief summary of the update..."
                  required
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white/80 placeholder-slate-300 dark:placeholder-white/20 focus:outline-none focus:border-tbd-blue/50 transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-slate-500 dark:text-white/50 text-xs font-medium uppercase tracking-wider mb-2 block">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed explanation..."
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white/80 placeholder-slate-300 dark:placeholder-white/20 resize-none focus:outline-none focus:border-tbd-blue/50 transition-colors"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="text-slate-500 dark:text-white/50 text-xs font-medium uppercase tracking-wider mb-2 block">Priority</label>
                <div className="flex gap-2">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriority(p.value)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ring-inset ${
                        priority === p.value
                          ? `bg-slate-100 dark:bg-white/10 ring-2 ${p.ring} ${p.color}`
                          : 'bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-white/40 hover:bg-slate-100 dark:hover:bg-white/8'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                whileTap={{ scale: 0.97 }}
                className="w-full py-3 rounded-xl gradient-cta text-white font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Post Update
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
