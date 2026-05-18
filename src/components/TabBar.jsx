import { motion, LayoutGroup } from 'framer-motion';
import { useStore, MAIN_TAB_AGENT_IDS, deriveStatus } from '@/store/useStore';

const STATUS_DOT = {
  healthy:  'bg-emerald-500',
  warning:  'bg-amber-400',
  critical: 'bg-red-500 animate-status-pulse',
};

const TAB_LABELS = {
  'agent-2': 'MVP Real Estate',
  'agent-3': 'Inspire Estate',
  'agent-4': 'Potters Estate',
  'agent-1': 'TBD HR',
};

export default function TabBar() {
  const activeTab    = useStore((s) => s.activeTab);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const agents       = useStore((s) => s.agents);
  const checks       = useStore((s) => s.maintenanceChecks);

  const tabs = [
    ...MAIN_TAB_AGENT_IDS.map((id) => ({
      id,
      label:  TAB_LABELS[id] ?? agents.find((a) => a.id === id)?.name ?? id,
      status: deriveStatus(id, checks),
      isDemo: false,
    })),
    { id: 'demo', label: 'Demo Agents', status: null, isDemo: true },
  ];

  return (
    <div className="border-b border-slate-200/80 dark:border-white/8 bg-white/80 dark:bg-[#060E1F]/90 backdrop-blur sticky top-0 z-20 shadow-sm">
      <div className="px-4 md:px-8 overflow-x-auto scrollbar-none">
        <LayoutGroup>
          <div className="flex gap-0 min-w-max">
            {tabs.map((tab, i) => {
              const isActive = activeTab === i;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(i)}
                  className={`relative flex items-center gap-2 px-5 py-4 text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'text-tbd-blue dark:text-white'
                      : 'text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/70 hover:bg-slate-50/60 dark:hover:bg-white/4'
                  }`}
                >
                  {tab.status && (
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[tab.status] ?? 'bg-slate-300'}`} />
                  )}
                  {tab.isDemo && (
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-tbd-orange text-white text-[10px] font-bold flex-shrink-0">
                      4
                    </span>
                  )}
                  <span>{tab.label}</span>

                  {isActive && (
                    <motion.span
                      layoutId="tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full"
                      style={{ background: 'linear-gradient(90deg, #1E4DB7, #E8743E)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </LayoutGroup>
      </div>
    </div>
  );
}
