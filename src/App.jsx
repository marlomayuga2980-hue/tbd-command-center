import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import ToastProvider from '@/components/ui/Toast';
import Dashboard from '@/views/Dashboard';
import AgentDetail from '@/views/AgentDetail';
import Updates from '@/views/Updates';
import WeeklyReport from '@/views/WeeklyReport';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';

function ThemeToggle() {
  const theme       = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);

  return (
    <motion.button
      onClick={toggleTheme}
      whileTap={{ scale: 0.93 }}
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-medium transition-colors
        bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900
        dark:bg-white/6 dark:border-white/10 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white/90"
    >
      {theme === 'light'
        ? <Moon className="w-4 h-4" />
        : <Sun  className="w-4 h-4" />}
      <span className="hidden sm:inline">{theme === 'light' ? 'Dark' : 'Light'}</span>
    </motion.button>
  );
}

function App() {
  const activeView      = useStore((s) => s.activeView);
  const selectedAgentId = useStore((s) => s.selectedAgentId);
  const theme           = useStore((s) => s.theme);
  const loading         = useStore((s) => s.loading);
  const error           = useStore((s) => s.error);
  const [dbDebug, setDbDebug] = useState(null);

  useEffect(() => {
    supabase.from('agents').select('id, name').then(({ data, error }) => {
      setDbDebug(error ? `ERROR: ${error.message} (code: ${error.code})` : `OK — ${data?.length ?? 0} agents found`);
    });
  }, []);

  // Apply / remove `dark` class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#060E1F]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-tbd-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-white/50 text-sm">Connecting to database…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#060E1F]">
        <div className="flex flex-col items-center gap-3 max-w-sm text-center px-6">
          <p className="text-danger font-semibold text-lg">Connection failed</p>
          <p className="text-slate-500 dark:text-white/50 text-sm">{error}</p>
          <button
            onClick={() => useStore.getState().initialize()}
            className="mt-2 px-4 py-2 rounded-lg bg-tbd-blue text-white text-sm font-medium hover:bg-tbd-deep transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  function renderView() {
    switch (activeView) {
      case 'dashboard':    return <Dashboard />;
      case 'agent-detail': return <AgentDetail agentId={selectedAgentId} />;
      case 'updates':      return <Updates />;
      case 'report':       return <WeeklyReport />;
      default:             return <Dashboard />;
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#060E1F]">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar with theme toggle */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-white/8 bg-white dark:bg-[#060E1F] flex-shrink-0">
          {dbDebug && (
            <span className={`text-xs font-mono px-2 py-1 rounded ${dbDebug.startsWith('ERROR') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              DB: {dbDebug}
            </span>
          )}
          <ThemeToggle />
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView + (selectedAgentId ?? '')}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="min-h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <ToastProvider />
    </div>
  );
}

export default App;
