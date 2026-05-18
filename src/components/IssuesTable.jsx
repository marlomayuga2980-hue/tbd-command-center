import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ChevronDown, Bug, Clock, CheckCircle2, XCircle, Ban } from 'lucide-react';
import { useStore } from '@/store/useStore';

// ── Result cycling ─────────────────────────────────────────

const RESULT_ORDER = ['pending', 'pass', 'fail', 'blocked'];

const RESULT_CONFIG = {
  pending: {
    label: 'Pending',
    Icon: Clock,
    pill: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-white/8 dark:text-white/45 dark:border-white/12',
    iconColor: 'text-slate-400 dark:text-white/35',
  },
  pass: {
    label: 'Pass',
    Icon: CheckCircle2,
    pill: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/12 dark:text-emerald-400 dark:border-emerald-500/25',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
  },
  fail: {
    label: 'Fail',
    Icon: XCircle,
    pill: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/12 dark:text-red-400 dark:border-red-500/25',
    iconColor: 'text-red-500 dark:text-red-400',
  },
  blocked: {
    label: 'Blocked',
    Icon: Ban,
    pill: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/12 dark:text-purple-400 dark:border-purple-500/25',
    iconColor: 'text-purple-500 dark:text-purple-400',
  },
};

const TESTER_CONFIG = {
  marlo:   { label: 'Marlo',   accent: 'text-tbd-blue',    headerBg: 'bg-tbd-blue/5 dark:bg-tbd-blue/8',    border: 'border-tbd-blue/15 dark:border-tbd-blue/20'   },
  mark:    { label: 'Mark',    accent: 'text-tbd-orange',  headerBg: 'bg-tbd-orange/5 dark:bg-tbd-orange/8', border: 'border-tbd-orange/15 dark:border-tbd-orange/20' },
  michael: { label: 'Michael', accent: 'text-emerald-600 dark:text-emerald-400', headerBg: 'bg-emerald-500/5 dark:bg-emerald-500/8', border: 'border-emerald-500/15 dark:border-emerald-500/20' },
};

function ResultPill({ issueId, tester, value }) {
  const updateIssueResult = useStore((s) => s.updateIssueResult);
  const cfg = RESULT_CONFIG[value] ?? RESULT_CONFIG.pending;
  const { Icon } = cfg;

  const cycle = () => {
    const next = RESULT_ORDER[(RESULT_ORDER.indexOf(value) + 1) % RESULT_ORDER.length];
    updateIssueResult(issueId, tester, next);
  };

  return (
    <motion.button
      onClick={cycle}
      whileTap={{ scale: 0.9 }}
      title="Click to cycle result"
      className={`inline-flex items-center justify-center gap-1 px-2 py-1 rounded-lg border text-xs font-bold transition-all hover:opacity-75 cursor-pointer select-none whitespace-nowrap shadow-sm w-full ${cfg.pill}`}
    >
      <Icon className={`w-3 h-3 ${cfg.iconColor}`} strokeWidth={2.5} />
      <span>{cfg.label}</span>
    </motion.button>
  );
}

function CommentCell({ issueId, tester, value }) {
  const updateIssueComment = useStore((s) => s.updateIssueComment);
  const [focused, setFocused] = useState(false);

  return (
    <textarea
      value={value}
      onChange={(e) => updateIssueComment(issueId, tester, e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      rows={focused ? 3 : 1}
      placeholder="Add note…"
      className={`w-full bg-transparent text-xs leading-relaxed placeholder-slate-300 dark:placeholder-white/20 resize-none focus:outline-none transition-all min-w-[90px] ${
        focused
          ? 'border border-tbd-blue/30 rounded-lg px-2 py-1.5 bg-blue-50/60 dark:bg-tbd-blue/5 text-slate-700 dark:text-white/80'
          : 'text-slate-500 dark:text-white/50'
      }`}
    />
  );
}

function TesterColumns({ issue, tester }) {
  const cfg = TESTER_CONFIG[tester];
  return (
    <>
      {/* Result cell — thicker left border (group divider) + subtle right border separating from Note */}
      <td className={`px-3 py-3 align-top text-center border-l-2 border-r border-slate-100 dark:border-white/8 ${cfg.border}`}>
        <ResultPill issueId={issue.id} tester={tester} value={issue[`${tester}Result`]} />
      </td>
      {/* Note cell — extra left padding for breathing room */}
      <td className="pl-4 pr-3 py-3 align-top">
        <CommentCell issueId={issue.id} tester={tester} value={issue[`${tester}Comment`]} />
      </td>
    </>
  );
}

function IssueRow({ issue, onDelete, index }) {
  const updateIssueTitle = useStore((s) => s.updateIssueTitle);
  const [editingTitle, setEditingTitle] = useState(!issue.title);
  const [titleVal, setTitleVal] = useState(issue.title);
  const titleRef = useRef(null);

  const saveTitle = () => {
    const t = titleVal.trim();
    if (t && t !== issue.title) updateIssueTitle(issue.id, t);
    setEditingTitle(false);
  };

  return (
    <motion.tr
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.18 }}
      className="border-b border-slate-100 dark:border-white/6 group hover:bg-blue-50/30 dark:hover:bg-tbd-blue/3 transition-colors"
    >
      {/* Row number + title */}
      <td className="px-3 py-3 align-middle text-center">
        <div className="flex items-center justify-center gap-2">
          {/* Row number */}
          <span className="flex-shrink-0 w-5 h-5 rounded-md bg-slate-100 dark:bg-white/8 flex items-center justify-center text-[10px] font-bold text-slate-400 dark:text-white/35 mt-0.5">
            {index + 1}
          </span>

          {editingTitle ? (
            <textarea
              ref={titleRef}
              autoFocus
              value={titleVal}
              onChange={(e) => setTitleVal(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveTitle(); }
                if (e.key === 'Escape') { setTitleVal(issue.title); setEditingTitle(false); }
              }}
              rows={2}
              className="flex-1 bg-white dark:bg-white/6 border border-tbd-blue/40 rounded-lg px-2.5 py-1.5 text-sm text-slate-800 dark:text-white/85 resize-none focus:outline-none focus:ring-2 focus:ring-tbd-blue/15 w-full shadow-sm"
            />
          ) : (
            <div className="flex-1 flex items-start justify-between gap-2">
              <button
                onClick={() => setEditingTitle(true)}
                className="text-left text-sm font-semibold text-slate-700 dark:text-white/80 hover:text-tbd-blue dark:hover:text-tbd-blue/80 transition-colors leading-snug"
              >
                {issue.title || <span className="text-slate-300 dark:text-white/20 italic font-normal">Untitled issue</span>}
              </button>
              <button
                onClick={onDelete}
                className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-md bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all flex-shrink-0 mt-0.5"
              >
                <Trash2 className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
        </div>
      </td>

      {/* Tester columns */}
      <TesterColumns issue={issue} tester="marlo"   />
      <TesterColumns issue={issue} tester="mark"    />
      <TesterColumns issue={issue} tester="michael" />
    </motion.tr>
  );
}

export default function IssuesTable({ agentId }) {
  const allIssues   = useStore((s) => s.issues);
  const issues      = allIssues.filter((i) => i.agentId === agentId);
  const addIssue    = useStore((s) => s.addIssue);
  const deleteIssue = useStore((s) => s.deleteIssue);

  const [collapsed, setCollapsed] = useState(false);

  const failCount = issues.reduce((n, iss) => {
    return n + (['marlo', 'mark', 'michael'].filter((t) => iss[`${t}Result`] === 'fail').length > 0 ? 1 : 0);
  }, 0);

  const passCount = issues.reduce((n, iss) => {
    const allPass = ['marlo', 'mark', 'michael'].every((t) => iss[`${t}Result`] === 'pass');
    return n + (allPass ? 1 : 0);
  }, 0);

  return (
    <div className="card-surface rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-white/8 bg-gradient-to-r from-tbd-orange/5 to-transparent dark:from-tbd-orange/8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-8 h-8 rounded-xl bg-tbd-orange/10 dark:bg-tbd-orange/15 flex items-center justify-center hover:bg-tbd-orange/15 dark:hover:bg-tbd-orange/20 transition-colors flex-shrink-0"
            >
              <motion.span animate={{ rotate: collapsed ? -90 : 0 }} transition={{ duration: 0.18 }}>
                <ChevronDown className="w-4 h-4 text-tbd-orange" />
              </motion.span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-slate-900 dark:text-white font-bold text-[15px]">Test Issues</h2>
                {failCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400 text-[11px] font-bold border border-red-200 dark:border-red-500/25">
                    {failCount} failing
                  </span>
                )}
                {passCount > 0 && failCount === 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold border border-emerald-200 dark:border-emerald-500/25">
                    {passCount} passing
                  </span>
                )}
              </div>
              <p className="text-slate-400 dark:text-white/35 text-xs font-medium">
                {issues.length === 0 ? 'No issues logged yet' : `${issues.length} issue${issues.length !== 1 ? 's' : ''} · Click result pills to update status`}
              </p>
            </div>
          </div>
          <motion.button
            onClick={() => { addIssue(agentId, ''); setCollapsed(false); }}
            whileTap={{ scale: 0.94 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-tbd-orange text-white hover:opacity-90 text-xs font-semibold transition-all shadow-sm shadow-tbd-orange/30 flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Issue
          </motion.button>
        </div>
      </div>

      {/* Table */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {issues.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/6 flex items-center justify-center mx-auto mb-3">
                  <Bug className="w-5 h-5 text-slate-300 dark:text-white/25" />
                </div>
                <p className="text-slate-500 dark:text-white/35 text-sm font-semibold">No issues logged yet</p>
                <p className="text-slate-400 dark:text-white/25 text-xs mt-1">Click "+ Add Issue" to log a test issue.</p>
              </div>
            ) : (
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full table-fixed">
                  <colgroup>
                    <col className="w-[22%]" />
                    {/* Marlo */}
                    <col className="w-[9%]" />
                    <col className="w-[12%]" />
                    {/* Mark */}
                    <col className="w-[9%]" />
                    <col className="w-[12%]" />
                    {/* Michael */}
                    <col className="w-[9%]" />
                    <col className="w-[27%]" />
                  </colgroup>
                  <thead>
                    {/* Tester group headers */}
                    <tr className="border-b border-slate-100 dark:border-white/6">
                      <th className="px-3 py-3 text-center bg-slate-50/80 dark:bg-white/3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/35">Test Issue</span>
                      </th>
                      {['marlo', 'mark', 'michael'].map((t) => {
                        const cfg = TESTER_CONFIG[t];
                        return (
                          <th
                            key={t}
                            colSpan={2}
                            className={`px-3 py-3 text-center ${cfg.headerBg} border-l-2 ${cfg.border}`}
                          >
                            <span className={`text-[11px] font-bold uppercase tracking-wider ${cfg.accent}`}>
                              {cfg.label}
                            </span>
                          </th>
                        );
                      })}
                    </tr>
                    {/* Sub-headers: Result / Note */}
                    <tr className="border-b border-slate-100 dark:border-white/6 bg-slate-50/40 dark:bg-white/1">
                      <th></th>
                      {['marlo', 'mark', 'michael'].map((t) => {
                        const cfg = TESTER_CONFIG[t];
                        return (
                          <>
                            <th key={`${t}-result`} className={`px-3 py-2 text-center border-l-2 border-r border-slate-100 dark:border-white/8 ${cfg.border}`}>
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-300 dark:text-white/25">Result</span>
                            </th>
                            <th key={`${t}-note`} className="px-3 py-2 text-left">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-300 dark:text-white/25">Note</span>
                            </th>
                          </>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence initial={false}>
                      {issues.map((issue, i) => (
                        <IssueRow
                          key={issue.id}
                          issue={issue}
                          index={i}
                          onDelete={() => deleteIssue(issue.id)}
                        />
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
