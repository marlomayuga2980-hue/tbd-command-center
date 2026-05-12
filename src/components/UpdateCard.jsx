import { motion } from 'framer-motion';
import { AlertTriangle, Info, Zap } from 'lucide-react';

const PRIORITY_CONFIG = {
  info:      { label: 'Info',      bg: 'bg-tbd-blue/10',  text: 'text-tbd-blue',  border: 'border-tbd-blue/25',  icon: Info,          pulse: false },
  important: { label: 'Important', bg: 'bg-warning/10',   text: 'text-warning',   border: 'border-warning/25',   icon: AlertTriangle, pulse: false },
  critical:  { label: 'Critical',  bg: 'bg-danger/10',    text: 'text-danger',    border: 'border-danger/25',    icon: Zap,           pulse: true  },
};

function timeAgo(dateStr) {
  const diff    = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1)  return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)   return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function UpdateCard({ update, isNew }) {
  const cfg  = PRIORITY_CONFIG[update.priority] ?? PRIORITY_CONFIG.info;
  const Icon = cfg.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1,  y: 0 }}
      className={`card-surface rounded-xl p-4 ${isNew ? 'ring-1 ring-tbd-blue/40' : ''}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Priority badge */}
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            <span className={`inline-flex ${cfg.pulse ? 'animate-status-pulse' : ''}`}>
              <Icon className="w-3 h-3" />
            </span>
            {cfg.label}
          </span>
          {/* Agent pill */}
          {update.agentName && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-white/6 text-slate-500 dark:text-white/50 border border-slate-200 dark:border-white/8 truncate max-w-[160px]">
              {update.agentName}
            </span>
          )}
          {update.type === 'platform' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-tbd-blue/8 dark:bg-tbd-deep/40 text-tbd-blue border border-tbd-blue/20">
              Platform
            </span>
          )}
        </div>
        <span className="text-slate-400 dark:text-white/25 text-xs flex-shrink-0 mt-0.5">{timeAgo(update.createdAt)}</span>
      </div>

      {/* Title */}
      <h4 className="text-slate-800 dark:text-white/90 text-sm font-semibold mb-1">{update.title}</h4>

      {/* Description */}
      <p className="text-slate-500 dark:text-white/45 text-xs leading-relaxed">{update.description}</p>

      {/* Footer */}
      <p className="text-slate-400 dark:text-white/25 text-xs mt-3">by {update.author}</p>
    </motion.div>
  );
}
