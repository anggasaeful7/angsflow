'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const monthFmt = new Intl.DateTimeFormat('id-ID', {
  month: 'short',
  year: '2-digit',
});
const currencyFmt = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  notation: 'compact',
});

export default function CashflowChart({
  data,
}: {
  data: { y: number; m: number; income: number; expense: number; net: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <XAxis dataKey={(d) => monthFmt.format(new Date(d.y, d.m - 1))} />
        <YAxis tickFormatter={(v) => currencyFmt.format(v)} />
        <Tooltip formatter={(v: number) => currencyFmt.format(v)} />
        <Legend />
        <Area type="monotone" dataKey="income" stroke="#4ade80" fill="#4ade80" />
        <Area type="monotone" dataKey="expense" stroke="#f87171" fill="#f87171" />
        <Area type="monotone" dataKey="net" stroke="#60a5fa" fill="#60a5fa" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
