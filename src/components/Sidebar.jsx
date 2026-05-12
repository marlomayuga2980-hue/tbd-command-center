import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Bell, BarChart3, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { useStore } from '@/store/useStore';

const NAV_ITEMS = [
  { view: 'dashboard', label: 'Dashboard',    icon: LayoutDashboard },
  { view: 'updates',   label: 'Updates',       icon: Bell },
  { view: 'report',    label: 'Weekly Report', icon: BarChart3 },
];

function TBDLogo({ collapsed }) {
  return (
    <div className="flex items-center gap-3 px-1">
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
        <rect width="36" height="36" rx="8" fill="#1E4DB7" />
        <text x="4" y="26" fontFamily="Inter, system-ui" fontWeight="900" fontSize="18" fill="white">T</text>
        <text x="13" y="26" fontFamily="Inter, system-ui" fontWeight="900" fontSize="18" fill="#E8743E">B</text>
        <text x="23" y="26" fontFamily="Inter, system-ui" fontWeight="900" fontSize="18" fill="white">D</text>
      </svg>
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-slate-900 dark:text-white font-bold text-sm whitespace-nowrap leading-tight">Teams by Design</p>
            <p className="text-slate-400 dark:text-white/40 text-xs whitespace-nowrap">Agent Command Center</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Sidebar() {
  const activeView  = useStore((s) => s.activeView);
  const navigateTo  = useStore((s) => s.navigateTo);
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isViewActive = (view) =>
    activeView === view || (view === 'dashboard' && activeView === 'agent-detail');

  const handleNav = (view) => {
    navigateTo(view);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-200 dark:border-white/8">
        <TBDLogo collapsed={collapsed} />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {NAV_ITEMS.map(({ view, label, icon: Icon }) => {
          const active = isViewActive(view);
          return (
            <button
              key={view}
              onClick={() => handleNav(view)}
              className="relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors group"
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-xl bg-tbd-blue/10 dark:bg-tbd-blue/20 border border-tbd-blue/30 dark:border-tbd-blue/40"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <Icon
                className={`relative z-10 w-4 h-4 flex-shrink-0 transition-colors ${
                  active
                    ? 'text-tbd-orange'
                    : 'text-slate-400 dark:text-white/40 group-hover:text-slate-600 dark:group-hover:text-white/70'
                }`}
              />
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`relative z-10 whitespace-nowrap overflow-hidden font-medium transition-colors ${
                      active
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-500 dark:text-white/50 group-hover:text-slate-800 dark:group-hover:text-white/80'
                    }`}
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </nav>

      {/* User info */}
      <div className="px-3 py-4 border-t border-slate-200 dark:border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-tbd-blue to-tbd-orange flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
            TBD
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <p className="text-slate-700 dark:text-white/80 text-xs font-medium whitespace-nowrap">Teams by Design</p>
                <p className="text-slate-400 dark:text-white/30 text-xs whitespace-nowrap">Internal Dashboard</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden md:flex items-center justify-center p-3 border-t border-slate-200 dark:border-white/8 text-slate-400 dark:text-white/30 hover:text-slate-700 dark:hover:text-white/70 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ type: 'spring', stiffness: 300, damping: 35 }}
        className="hidden md:flex flex-col flex-shrink-0 h-screen sticky top-0 border-r border-slate-200 dark:border-white/8 bg-white dark:bg-[#060E1F] overflow-hidden"
        style={{ minWidth: collapsed ? 64 : 240 }}
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile hamburger */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl bg-white dark:bg-white/6 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/70 shadow-sm"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              className="fixed left-0 top-0 h-full w-64 z-50 bg-white dark:bg-[#060E1F] border-r border-slate-200 dark:border-white/8 flex flex-col md:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/70"
              >
                <X className="w-5 h-5" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
