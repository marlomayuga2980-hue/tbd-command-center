import { motion } from 'framer-motion';
import { Phone, Copy } from 'lucide-react';
import { useStore } from '@/store/useStore';

const STATUS_CONFIG = {
  healthy:  { label: 'Healthy',  dot: 'bg-success',  text: 'text-success',  badge: 'bg-success/10 text-success border-success/20' },
  warning:  { label: 'Warning',  dot: 'bg-warning',  text: 'text-warning',  badge: 'bg-warning/10 text-warning border-warning/20' },
  critical: { label: 'Critical', dot: 'bg-danger',   text: 'text-danger',   badge: 'bg-danger/10 text-danger border-danger/20' },
};

function PassRateBar({ passRate, status }) {
  const color = status === 'healthy' ? 'bg-success' : status === 'warning' ? 'bg-warning' : 'bg-danger';
  return (
    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-white/8 overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${passRate}%` }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
      />
    </div>
  );
}

function getLastTested(agent) {
  const timestamps = Object.values(agent.currentWeekTests)
    .map((t) => t.timestamp)
    .filter(Boolean)
    .sort()
    .reverse();
  if (!timestamps.length) return 'Not tested';
  const d = new Date(timestamps[0]);
  return d.toLocaleDateString('en-AU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AgentCard({ agent }) {
  const navigateTo = useStore((s) => s.navigateTo);
  const addToast   = useStore((s) => s.addToast);
  const cfg        = STATUS_CONFIG[agent.status] ?? STATUS_CONFIG.healthy;
  const lastTested = getLastTested(agent);

  const copyPhone = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(agent.phone).then(() =>
      addToast({ title: 'Phone number copied', variant: 'info' })
    );
  };

  return (
    <motion.div
      onClick={() => navigateTo('agent-detail', agent.id)}
      whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(0,0,0,0.12)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="card-surface rounded-2xl p-5 cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="text-slate-900 dark:text-white font-semibold text-sm leading-snug line-clamp-2 group-hover:text-tbd-blue dark:group-hover:text-tbd-orange transition-colors">
            {agent.name}
          </h3>
          <p className="text-slate-400 dark:text-white/40 text-xs mt-1">{agent.role}</p>
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${cfg.badge}`}>
          <span
            className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${
              agent.status !== 'healthy' ? 'animate-status-pulse' : ''
            }`}
          />
          {cfg.label}
        </div>
      </div>

      {/* Phone */}
      <div className="flex items-center gap-2 mb-4">
        <Phone className="w-3.5 h-3.5 text-slate-300 dark:text-white/30 flex-shrink-0" />
        <span className="text-slate-500 dark:text-white/50 text-xs font-mono flex-1 truncate">{agent.phone}</span>
        <button
          onClick={copyPhone}
          className="text-slate-300 dark:text-white/20 hover:text-tbd-blue transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Pass rate */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-slate-400 dark:text-white/40 text-xs">Pass rate</span>
          <span className={`text-xs font-semibold ${cfg.text}`}>{agent.passRate}%</span>
        </div>
        <PassRateBar passRate={agent.passRate} status={agent.status} />
      </div>

      {/* Last tested */}
      <p className="text-slate-400 dark:text-white/30 text-xs">Last tested: {lastTested}</p>
    </motion.div>
  );
}
