import {
  ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, Tooltip, Cell,
} from 'recharts';

const STATUS_COLORS = {
  healthy:  '#10B981',
  warning:  '#F59E0B',
  critical: '#EF4444',
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#0d1b33] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-slate-400 dark:text-white/50 mb-1 max-w-[160px] truncate">{label}</p>
      <p className="font-semibold" style={{ color: payload[0].fill }}>{payload[0].value}% pass rate</p>
    </div>
  );
}

export default function AgentBarChart({ agents }) {
  const data = agents.map((a) => ({
    name:     a.name.split(' ').slice(0, 2).join(' '),
    passRate: a.passRate,
    status:   a.status,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }} barCategoryGap="30%">
        <XAxis
          dataKey="name"
          tick={{ fill: 'rgb(148 163 184)', fontSize: 11 }}
          axisLine={{ stroke: 'rgba(0,0,0,0.06)' }}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: 'rgb(148 163 184)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
        <Bar dataKey="passRate" radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={STATUS_COLORS[entry.status] ?? '#1E4DB7'}
              fillOpacity={0.85}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
