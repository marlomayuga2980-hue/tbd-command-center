import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useStore, MAIN_TAB_AGENT_IDS } from '@/store/useStore';
import TabBar from '@/components/TabBar';
import ToastProvider from '@/components/ui/Toast';
import AgentPage from '@/views/AgentPage';
import DemoAgentsPage from '@/views/DemoAgentsPage';

function ThemeToggle() {
  const theme       = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  return (
    <motion.button
      onClick={toggleTheme}
      whileTap={{ scale: 0.93 }}
      className="flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-medium transition-all
        bg-white border-slate-200 text-slate-600 hover:border-tbd-blue/40 hover:text-tbd-blue hover:bg-blue-50
        dark:bg-white/6 dark:border-white/12 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white shadow-sm"
    >
      {theme === 'light'
        ? <Moon className="w-4 h-4" />
        : <Sun  className="w-4 h-4 text-amber-400" />}
      <span className="hidden sm:inline">{theme === 'light' ? 'Dark' : 'Light'}</span>
    </motion.button>
  );
}

function TBDLogo() {
  return (
    <div className="flex items-center gap-3 flex-shrink-0">
      <div className="w-9 h-9 rounded-xl gradient-cta flex items-center justify-center flex-shrink-0 shadow-md shadow-tbd-blue/25">
        <span className="font-black text-white text-sm tracking-tight">TBD</span>
      </div>
      <div className="hidden sm:block">
        <p className="text-slate-900 dark:text-white font-bold text-[15px] leading-tight tracking-tight">Teams by Design</p>
        <p className="text-slate-400 dark:text-white/40 text-xs font-medium">Agent Command Center</p>
      </div>
    </div>
  );
}

function App() {
  const activeTab = useStore((s) => s.activeTab);
  const theme     = useStore((s) => s.theme);
  const loading   = useStore((s) => s.loading);
  const error     = useStore((s) => s.error);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f0f4ff] dark:bg-[#060E1F]">
        <div className="flex flex-col items-center gap-5">
          <div className="w-12 h-12 rounded-2xl gradient-cta flex items-center justify-center shadow-lg shadow-tbd-blue/30 animate-pulse">
            <span className="font-black text-white text-base">TBD</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-tbd-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-tbd-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-tbd-orange rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-slate-500 dark:text-white/40 text-sm font-medium">Connecting to database…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f0f4ff] dark:bg-[#060E1F]">
        <div className="flex flex-col items-center gap-3 max-w-sm text-center px-6">
          <p className="text-red-500 font-bold text-lg">Connection failed</p>
          <p className="text-slate-500 dark:text-white/50 text-sm">{error}</p>
          <button
            onClick={() => useStore.getState().initialize()}
            className="mt-2 px-5 py-2 rounded-xl gradient-cta text-white text-sm font-semibold shadow-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const activeAgentId = MAIN_TAB_AGENT_IDS[activeTab];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f0f4ff] dark:bg-[#060E1F]">
      {/* Header */}
      <header className="flex items-center justify-between px-5 md:px-8 py-3.5 border-b border-slate-200/80 dark:border-white/8 bg-white/90 dark:bg-[#060E1F] backdrop-blur flex-shrink-0 z-30 shadow-sm">
        <TBDLogo />
        <ThemeToggle />
      </header>

      {/* Tab bar */}
      <TabBar />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="min-h-full"
          >
            {activeTab < 4
              ? <AgentPage agentId={activeAgentId} />
              : <DemoAgentsPage />
            }
          </motion.div>
        </AnimatePresence>
      </main>

      <ToastProvider />
    </div>
  );
}

export default App;
