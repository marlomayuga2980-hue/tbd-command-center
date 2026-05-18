import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useStore, DEMO_TAB_AGENT_IDS, deriveStatus } from '@/store/useStore';
import AgentPage from '@/views/AgentPage';

const STATUS_DOT = {
  healthy:  'bg-emerald-500',
  warning:  'bg-amber-400',
  critical: 'bg-red-500 animate-status-pulse',
};

const SHORT_NAMES = {
  'demo-1': 'Burleigh',
  'demo-2': 'London',
  'demo-3': 'USA',
  'demo-4': 'Auckland',
};

export default function DemoAgentsPage() {
  const activeDemoSubTab   = useStore((s) => s.activeDemoSubTab);
  const setActiveDemoSubTab = useStore((s) => s.setActiveDemoSubTab);
  const agents = useStore((s) => s.agents);
  const checks = useStore((s) => s.maintenanceChecks);

  const activeAgentId = DEMO_TAB_AGENT_IDS[activeDemoSubTab];

  return (
    <div>
      {/* Demo sub-tab bar */}
      <div className="border-b border-slate-200 dark:border-white/8 bg-slate-50/60 dark:bg-white/2 sticky top-[49px] z-10">
        <div className="px-5 md:px-8 overflow-x-auto scrollbar-none">
          <LayoutGroup id="demo-tabs">
            <div className="flex gap-0 min-w-max">
              {DEMO_TAB_AGENT_IDS.map((id, i) => {
                const agent   = agents.find((a) => a.id === id);
                const status  = deriveStatus(id, checks);
                const isActive = activeDemoSubTab === i;

                return (
                  <button
                    key={id}
                    onClick={() => setActiveDemoSubTab(i)}
                    className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'text-tbd-orange dark:text-tbd-orange'
                        : 'text-slate-500 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/65'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[status] ?? 'bg-slate-300'}`} />
                    <span>{SHORT_NAMES[id] ?? agent?.name ?? id}</span>

                    {isActive && (
                      <motion.span
                        layoutId="demo-tab-underline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-tbd-orange"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </LayoutGroup>
        </div>
      </div>

      {/* Demo agent content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeAgentId}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <AgentPage agentId={activeAgentId} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
