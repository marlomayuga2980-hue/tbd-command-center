import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useStore } from '@/store/useStore';

const VARIANT_STYLES = {
  success: { border: 'border-l-success', icon: CheckCircle, iconColor: 'text-success' },
  error:   { border: 'border-l-danger',  icon: AlertCircle, iconColor: 'text-danger' },
  info:    { border: 'border-l-tbd-blue', icon: Info,        iconColor: 'text-tbd-blue' },
};

function ToastItem({ toast }) {
  const removeToast = useStore((s) => s.removeToast);
  const { border, icon: Icon, iconColor } = VARIANT_STYLES[toast.variant] ?? VARIANT_STYLES.info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0,  scale: 1 }}
      exit={{    opacity: 0, x: 80, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-[#0d1b33] border border-slate-200 dark:border-white/10 border-l-4 ${border} shadow-xl min-w-[280px] max-w-[360px]`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
      <span className="flex-1 text-sm font-medium text-slate-800 dark:text-white/90">{toast.title}</span>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-slate-300 dark:text-white/30 hover:text-slate-600 dark:hover:text-white/70 transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export default function ToastProvider() {
  const toasts = useStore((s) => s.toasts);

  return (
    <div className="fixed top-4 right-4 z-[9998] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
