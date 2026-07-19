import {
  ComposedChart,
  BarChart,
  LineChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

const COLORS = {
  bar1: 'var(--theme-accent)',
  bar2: '#34d399',
  bar3: '#fbbf24',
  line1: 'var(--theme-accent-muted)',
  line2: '#fb923c',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-theme-bg border border-theme-accent/30 rounded-xl p-3 shadow-2xl text-sm">
      <p className="font-semibold text-theme-accent mb-2 font-data">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-zinc-300 text-xs">{entry.name}:</span>
          <span className="text-theme-accent font-medium font-data text-xs">{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function FinChart({ spec }) {
  let parsed;
  try {
    parsed = typeof spec === 'string' ? JSON.parse(spec) : spec;
  } catch {
    return (
      <div className="text-red-400 text-sm p-4 bg-red-950/30 rounded-xl border border-red-900/40">
        ⚠️ Failed to parse chart data.
      </div>
    );
  }

  const { title, subtitle, type = 'bar', data = [], series = [], yAxisLabel, source } = parsed;

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    const THEME_COLORS = ['var(--theme-accent)', '#34d399', '#fbbf24', '#60a5fa', 'var(--theme-accent-muted)'];

    const axes = (
      <>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(63,63,70,0.3)" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#a1a1aa', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 10, dy: 50, fontFamily: "'JetBrains Mono', monospace" } : undefined} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ color: '#a1a1aa', fontSize: 11, paddingTop: '16px', fontFamily: "'JetBrains Mono', monospace" }} />
      </>
    );

    if (type === 'line') {
      return (
        <LineChart {...commonProps}>
          {axes}
          {series.map((s, i) => {
            const color = THEME_COLORS[i % THEME_COLORS.length];
            return <Line key={s.key} type="monotone" dataKey={s.key} stroke={color} strokeWidth={2} dot={{ r: 3, fill: color }} activeDot={{ r: 5 }} />;
          })}
        </LineChart>
      );
    }

    if (type === 'bar') {
      return (
        <BarChart {...commonProps}>
          {axes}
          {series.map((s, i) => {
            const color = THEME_COLORS[i % THEME_COLORS.length];
            return <Bar key={s.key} dataKey={s.key} fill={color} radius={[4, 4, 0, 0]} maxBarSize={50} />;
          })}
        </BarChart>
      );
    }

    // composed (default): mix bar and line
    return (
      <ComposedChart {...commonProps}>
        {axes}
        {series.map((s, i) => {
          const color = THEME_COLORS[i % THEME_COLORS.length];
          if (s.type === 'line') {
            return <Line key={s.key} type="monotone" dataKey={s.key} stroke={color} strokeWidth={2} dot={{ r: 3, fill: color }} activeDot={{ r: 5 }} />;
          }
          return <Bar key={s.key} dataKey={s.key} fill={color} radius={[4, 4, 0, 0]} maxBarSize={50} />;
        })}
      </ComposedChart>
    );
  };

  return (
    <div className="my-8 rounded-xl border border-zinc-800/50 bg-gradient-to-br from-zinc-900/80 to-zinc-950 overflow-hidden shadow-xl break-inside-avoid">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 border-b border-zinc-800/40">
        <h3 className="text-white font-semibold text-sm leading-snug">{title}</h3>
        {subtitle && <p className="text-zinc-500 text-xs mt-0.5">{subtitle}</p>}
      </div>

      {/* Chart */}
      <div className="px-6 py-4">
        <ResponsiveContainer width="100%" height={280}>
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      {source && (
        <div className="px-6 pb-4">
          <p className="text-zinc-700 text-[10px] font-data">{source}</p>
        </div>
      )}
    </div>
  );
}
