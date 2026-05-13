import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const data = [
  { name: 'J', inbound: 45000, outbound: 40000 },
  { name: 'F', inbound: 32000, outbound: 28000 },
  { name: 'M', inbound: 48000, outbound: 17000 },
  { name: 'A', inbound: 65000, outbound: 30000 },
  { name: 'M', inbound: 25000, outbound: 10000 },
  { name: 'J', inbound: 55000, outbound: 20000 },
  { name: 'J', inbound: 42000, outbound: 13000 },
  { name: 'A', inbound: 68000, outbound: 22000 },
  { name: 'S', inbound: 30000, outbound: 10000 },
  { name: 'O', inbound: 45000, outbound: 15000 },
  { name: 'N', inbound: 58000, outbound: 22000 },
  { name: 'D', inbound: 35000, outbound: 15000 },
];

export function TrafficDistributionChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-[300px] mt-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl animate-pulse"></div>;
  }

  return (
    <div className="w-full h-[300px] flex-1">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
            tickFormatter={(value) => `${value / 1000}k`}
          />
          <Tooltip
            cursor={{ fill: 'rgba(99,102,241,0.05)' }}
            contentStyle={{ 
              borderRadius: '1rem', 
              border: 'none',
              backgroundColor: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              fontSize: '12px',
              padding: '12px 16px'
            }}
            itemStyle={{ fontWeight: 700 }}
            labelStyle={{ fontWeight: 700, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}
            formatter={(value: number, name: string) => [`${value.toLocaleString()}`, name]}
          />
          <Bar dataKey="inbound" name="Inbound" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="outbound" name="Outbound" fill="#f43f5e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
