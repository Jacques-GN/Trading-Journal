"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SectionTitle } from "@/components/shared/stat-card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/format";

export function EquityCurve({ stats }: { stats: any }) {
  const data = (stats.equity ?? []).map((p: any) => ({
    i: p.i,
    balance: Math.round(p.balance * 100) / 100,
    date: p.date,
  }));
  const min = data.length ? Math.min(...data.map((d: any) => d.balance)) : 0;
  const max = data.length ? Math.max(...data.map((d: any) => d.balance)) : 0;
  const padding = (max - min) * 0.1 || 100;

  return (
    <Card className="border-white/5 bg-zinc-900/60 p-4 md:p-5">
      <SectionTitle
        sub="Évolution du capital"
        right={
          <div className="flex items-center gap-4 text-right">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Solde</p>
              <p className="font-mono text-base font-semibold text-emerald-500">{formatCurrency(stats.endBalance)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Drawdown max</p>
              <p className="font-mono text-base font-semibold text-rose-500">-{stats.maxDrawdown.toFixed(2)}%</p>
            </div>
          </div>
        }
      >
        Courbe de capital
      </SectionTitle>
      <CardContent className="px-0">
        <div className="h-72 w-full">
          {data.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Pas de trades clôturés.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="statEquityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="i" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis domain={[min - padding, max + padding]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={60} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
                <Tooltip
                  contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }}
                  labelStyle={{ color: "#fafafa" }}
                  labelFormatter={(l) => `Trade #${l}`}
                  formatter={(v: number) => [formatCurrency(v), "Solde"]}
                />
                <Area type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={2} fill="url(#statEquityGrad)" dot={false} activeDot={{ r: 4, fill: "#10b981" }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
