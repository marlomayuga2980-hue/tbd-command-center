import { useMemo } from 'react';
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, Tooltip,
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#0d1b33] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-slate-400 dark:text-white/50 mb-1">{label}</p>
      <p className="text-tbd-orange font-semibold">{payload[0].value}% pass rate</p>
    </div>
  );
}

export default function AgentLineChart({ data, agentId }) {
  const gradientId = useMemo(() => `gradient-${agentId}`, [agentId]);

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#1E4DB7" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#1E4DB7" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="week"
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
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(0,0,0,0.08)', strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="passRate"
          stroke="#1E4DB7"
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 5, fill: '#E8743E', stroke: '#E8743E' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
