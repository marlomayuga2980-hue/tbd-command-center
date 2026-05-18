import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Pencil, Check, Shield, AlertTriangle, AlertOctagon } from 'lucide-react';
import { useStore, deriveStatus } from '@/store/useStore';

const STATUS_CONFIG = {
  healthy: {
    label: 'Healthy',
    icon: Shield,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/25',
    accent: 'from-emerald-500/10 to-transparent border-emerald-200 dark:border-emerald-500/20',
    scoreColor: 'text-emerald-600 dark:text-emerald-400',
    scoreBg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
  },
  warning: {
    label: 'Warning',
    icon: AlertTriangle,
    iconColor: 'text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-400',
    badge: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-400/15 dark:text-amber-300 dark:border-amber-400/25',
    accent: 'from-amber-400/10 to-transparent border-amber-200 dark:border-amber-400/20',
    scoreColor: 'text-amber-600 dark:text-amber-400',
    scoreBg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-400/20',
  },
  critical: {
    label: 'Critical',
    icon: AlertOctagon,
    iconColor: 'text-red-600 dark:text-red-400',
    dot: 'bg-red-500 animate-status-pulse',
    badge: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/25',
    accent: 'from-red-500/10 to-transparent border-red-200 dark:border-red-500/20',
    scoreColor: 'text-red-600 dark:text-red-400',
    scoreBg: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20',
  },
};

function PhoneEditor({ agentId, phone }) {
  const updatePhone = useStore((s) => s.updatePhone);
  const addToast    = useStore((s) => s.addToast);
  const [editing, setEditing] = useState(false);
  const [value,   setValue]   = useState(phone);

  const save = () => {
    if (value.trim() !== phone) {
      updatePhone(agentId, value.trim());
      addToast({ title: 'Phone number saved', variant: 'success' });
    }
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-white/8 flex items-center justify-center flex-shrink-0">
        <Phone className="w-3 h-3 text-slate-500 dark:text-white/40" />
      </div>
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setValue(phone); setEditing(false); } }}
            autoFocus
            className="bg-slate-50 dark:bg-white/8 border border-tbd-blue/50 rounded-lg px-3 py-1.5 text-sm text-slate-800 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-tbd-blue/20 w-48"
          />
          <button onClick={save} className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-600 transition-colors">
            <Check className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button onClick={() => { setEditing(true); setValue(phone); }} className="flex items-center gap-2 group">
          <span className="text-slate-600 dark:text-white/60 text-sm font-mono group-hover:text-tbd-blue dark:group-hover:text-tbd-blue/80 transition-colors">{phone}</span>
          <Pencil className="w-3 h-3 text-slate-300 dark:text-white/20 group-hover:text-tbd-blue/60 transition-colors opacity-0 group-hover:opacity-100" />
        </button>
      )}
    </div>
  );
}

export default function AgentHeader({ agentId }) {
  const agents = useStore((s) => s.agents);
  const checks = useStore((s) => s.maintenanceChecks);
  const agent  = agents.find((a) => a.id === agentId);
  if (!agent) return null;

  const status      = deriveStatus(agentId, checks);
  const cfg         = STATUS_CONFIG[status] ?? STATUS_CONFIG.healthy;
  const StatusIcon  = cfg.icon;
  const allChecks   = checks.filter((c) => c.agentId === agentId && c.isDefault);
  const passedCount = allChecks.filter((c) => c.passed).length;
  const totalCount  = allChecks.length;
  const pct         = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

  return (
    <div className={`card-surface rounded-2xl mb-6 overflow-hidden border-l-4 ${
      status === 'healthy' ? 'border-l-emerald-500' :
      status === 'warning' ? 'border-l-amber-400'  : 'border-l-red-500'
    }`}>
      {/* Subtle gradient accent strip */}
      <div className={`h-1 w-full bg-gradient-to-r ${cfg.accent}`} />

      <div className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Name + badge row */}
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${cfg.dot}`} />
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{agent.name}</h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.badge}`}>
                <StatusIcon className={`w-3 h-3 ${cfg.iconColor}`} />
                {cfg.label}
              </span>
            </div>

            {/* Role */}
            <p className="text-slate-500 dark:text-white/45 text-sm mb-4 ml-6 font-medium">{agent.role}</p>

            {/* Phone */}
            <div className="ml-6">
              <PhoneEditor agentId={agentId} phone={agent.phone} />
            </div>
          </div>

          {/* Health score */}
          <div className={`flex flex-col items-center justify-center w-24 h-24 rounded-2xl border-2 ${cfg.scoreBg} flex-shrink-0`}>
            <span className={`text-3xl font-black tabular-nums leading-none ${cfg.scoreColor}`}>
              {totalCount > 0 ? `${pct}%` : '—'}
            </span>
            <span className="text-slate-400 dark:text-white/35 text-[10px] font-semibold uppercase tracking-wider mt-1">Health</span>
            <span className={`text-xs font-medium mt-0.5 ${cfg.scoreColor}`}>{passedCount}/{totalCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
