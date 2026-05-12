import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Activity, Clipboard } from 'lucide-react';
import AgentBarChart from '@/components/charts/AgentBarChart';
import { useStore } from '@/store/useStore';

const STATUS_DOT = {
  healthy:  'bg-success',
  warning:  'bg-warning',
  critical: 'bg-danger',
};

const TEST_LABELS = {
  callSuccess:         '☎️ Call test',
  emailToPM:           '📧 Email to PM',
  streetcoIntegration: '🌐 Streetco',
};

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-surface rounded-2xl p-5"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-slate-400 dark:text-white/40 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className="text-slate-900 dark:text-white text-2xl font-bold">{value}</p>
    </motion.div>
  );
}

export default function WeeklyReport() {
  const agents   = useStore((s) => s.agents);
  const addToast = useStore((s) => s.addToast);

  const report = useMemo(() => {
    const allTests   = agents.flatMap((a) => Object.values(a.currentWeekTests));
    const totalTests = allTests.length;
    const passed     = allTests.filter((t) => t.passed).length;
    const failed     = totalTests - passed;
    const healthPct  = Math.round((passed / totalTests) * 100);
    return { totalTests, passed, failed, healthPct };
  }, [agents]);

  const weekLabel = new Date().toLocaleDateString('en-AU', { month: 'long', day: 'numeric', year: 'numeric' });

  const copyReport = () => {
    const lines = [
      `TBD Agent Command Center — Weekly Report`,
      `Generated: ${weekLabel}`,
      ``,
      `Summary`,
      `Total Tests: ${report.totalTests} | Passed: ${report.passed} | Failed: ${report.failed} | Health: ${report.healthPct}%`,
      ``,
      `Per-Agent Breakdown`,
      ...agents.map((a) => {
        const tests = Object.entries(a.currentWeekTests)
          .map(([k, v]) => `  ${TEST_LABELS[k]}: ${v.passed ? '✅' : '❌'}`)
          .join('\n');
        return `${a.name} (${a.status.toUpperCase()}) — ${a.passRate}% avg\n${tests}`;
      }),
    ];
    navigator.clipboard.writeText(lines.join('\n')).then(() =>
      addToast({ title: 'Report copied to clipboard', variant: 'success' })
    );
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Weekly Report</h1>
          <p className="text-slate-400 dark:text-white/40 text-sm mt-1">Auto-generated · {weekLabel}</p>
        </div>
        <motion.button
          onClick={copyReport}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl card-surface text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white text-sm font-medium transition-colors"
        >
          <Clipboard className="w-4 h-4" /> Copy Summary
        </motion.button>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Activity}    label="Total Tests" value={report.totalTests}      color="bg-tbd-blue/20" />
        <StatCard icon={CheckCircle} label="Passed"      value={report.passed}          color="bg-success/20" />
        <StatCard icon={XCircle}     label="Failed"      value={report.failed}          color="bg-danger/20" />
        <StatCard icon={Activity}    label="Health %"    value={`${report.healthPct}%`} color="bg-tbd-orange/20" />
      </div>

      {/* Bar chart + breakdown: side by side */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="card-surface rounded-2xl p-6">
          <h2 className="text-slate-900 dark:text-white font-semibold mb-4">Pass Rate by Agent</h2>
          <AgentBarChart agents={agents} />
          <div className="flex items-center justify-center gap-6 mt-3">
            {[['Healthy','#10B981'], ['Warning','#F59E0B'], ['Critical','#EF4444']].map(([l, c]) => (
              <div key={l} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c }} />
                <span className="text-slate-400 dark:text-white/40 text-xs">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Per-agent breakdown */}
        <div className="card-surface rounded-2xl p-6">
          <h2 className="text-slate-900 dark:text-white font-semibold mb-4">Per-Agent Test Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/8">
                  <th className="text-left text-slate-400 dark:text-white/40 font-medium pb-3 pr-3 text-xs uppercase tracking-wider">Agent</th>
                  {Object.entries(TEST_LABELS).map(([k, l]) => (
                    <th key={k} className="text-center text-slate-400 dark:text-white/40 font-medium pb-3 px-2 text-xs uppercase tracking-wider whitespace-nowrap">
                      {l}
                    </th>
                  ))}
                  <th className="text-right text-slate-400 dark:text-white/40 font-medium pb-3 pl-3 text-xs uppercase tracking-wider">Rate</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent, i) => (
                  <motion.tr
                    key={agent.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="border-b border-slate-100 dark:border-white/6 last:border-0"
                  >
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[agent.status]} ${agent.status !== 'healthy' ? 'animate-status-pulse' : ''}`} />
                        <span className="text-slate-700 dark:text-white/80 font-medium text-xs leading-snug max-w-[120px]">{agent.name}</span>
                      </div>
                    </td>
                    {Object.keys(TEST_LABELS).map((key) => (
                      <td key={key} className="py-3 px-2 text-center text-base">
                        {agent.currentWeekTests[key]?.passed ? '✅' : '❌'}
                      </td>
                    ))}
                    <td className="py-3 pl-3 text-right">
                      <span className={`font-semibold text-sm ${
                        agent.passRate >= 80 ? 'text-success' :
                        agent.passRate >= 60 ? 'text-warning' : 'text-danger'
                      }`}>{agent.passRate}%</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
