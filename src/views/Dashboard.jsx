import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle, XCircle, Activity, ArrowRight } from 'lucide-react';
import AgentCard from '@/components/AgentCard';
import UpdateCard from '@/components/UpdateCard';
import { useStore } from '@/store/useStore';

function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    const frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return value;
}

function HealthRing({ passRate }) {
  const animated = useCountUp(passRate);
  const radius   = 36;
  const circ     = 2 * Math.PI * radius;
  const offset   = circ * (1 - passRate / 100);

  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="rgb(226 232 240)" strokeWidth="8"
          className="dark:stroke-white/6" />
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#1E4DB7" />
            <stop offset="100%" stopColor="#E8743E" />
          </linearGradient>
        </defs>
        <motion.circle
          cx="48" cy="48" r={radius}
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-xl font-bold text-slate-900 dark:text-white">{animated}%</span>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const count = useCountUp(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card-surface rounded-2xl p-5"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-slate-400 dark:text-white/40 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className="text-slate-900 dark:text-white text-2xl font-bold">{count}</p>
    </motion.div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const agents     = useStore((s) => s.agents);
  const updates    = useStore((s) => s.updates);
  const navigateTo = useStore((s) => s.navigateTo);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const allTests  = agents.flatMap((a) => Object.values(a.currentWeekTests));
  const passed    = allTests.filter((t) => t.passed).length;
  const failed    = allTests.length - passed;
  const avgHealth = Math.round(agents.reduce((s, a) => s + a.passRate, 0) / agents.length);
  const recentUpdates = updates.slice(0, 4);

  const timeStr = time.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Greeting */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            {getGreeting()}, Team 👋
          </h1>
          <p className="text-slate-400 dark:text-white/40 text-sm mt-1">
            {time.toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="card-surface rounded-xl px-4 py-2 font-mono text-tbd-orange text-lg font-semibold">
          {timeStr}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users}       label="Active Agents" value={agents.length} color="bg-tbd-blue/20" />
        <StatCard icon={CheckCircle} label="Tests Passed"  value={passed}        color="bg-success/20" />
        <StatCard icon={XCircle}     label="Tests Failed"  value={failed}        color="bg-danger/20" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="card-surface rounded-2xl p-5 flex flex-col items-center justify-center"
        >
          <p className="text-slate-400 dark:text-white/40 text-xs font-medium uppercase tracking-wider mb-2">Health Score</p>
          <HealthRing passRate={avgHealth} />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Agent grid */}
        <div className="xl:col-span-2">
          <h2 className="text-slate-900 dark:text-white font-semibold mb-4">Agents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {agents.map((agent, i) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.07 }}
              >
                <AgentCard agent={agent} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Updates */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-900 dark:text-white font-semibold">Recent Updates</h2>
            <button
              onClick={() => navigateTo('updates')}
              className="flex items-center gap-1 text-tbd-blue text-xs hover:text-tbd-orange transition-colors"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {recentUpdates.map((update, i) => (
              <motion.div
                key={update.id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
              >
                <UpdateCard update={update} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
