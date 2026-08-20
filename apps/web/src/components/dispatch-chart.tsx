'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function DispatchChart({ data }: { data: unknown[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <XAxis
          dataKey="hour"
          stroke="rgb(var(--muted-foreground))"
          fontSize={11}
          tickLine={false}
        />
        <YAxis
          stroke="rgb(var(--muted-foreground))"
          fontSize={11}
          tickLine={false}
          width={28}
        />
        <Tooltip
          contentStyle={{
            background: 'rgb(var(--popover))',
            border: '1px solid rgb(var(--border))',
            borderRadius: 8,
            color: 'rgb(var(--foreground))',
            fontSize: 12,
          }}
          cursor={{ fill: 'rgb(var(--muted) / 0.5)' }}
        />
        <Bar
          dataKey="count"
          fill="rgb(var(--primary))"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}