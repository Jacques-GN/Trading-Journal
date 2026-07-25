"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  delta?: { value: string; positive: boolean } | null;
  icon?: ReactNode;
  sublabel?: string;
  className?: string;
  accent?: "emerald" | "rose" | "default";
}

export function StatCard({
  label,
  value,
  delta,
  icon,
  sublabel,
  className,
  accent = "default",
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-white/5 bg-zinc-900/60 p-4 md:p-5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          <p
            className={cn(
              "mt-2 font-mono text-2xl font-semibold tabular-nums md:text-3xl",
              accent === "emerald"
                ? "text-emerald-500"
                : accent === "rose"
                ? "text-rose-500"
                : "text-foreground"
            )}
          >
            {value}
          </p>
          {(sublabel || delta) && (
            <div className="mt-2 flex items-center gap-2 text-xs">
              {delta && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded px-1 py-0.5 font-mono",
                    delta.positive
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-rose-500/10 text-rose-500"
                  )}
                >
                  {delta.positive ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {delta.value}
                </span>
              )}
              {sublabel && (
                <span className="truncate text-muted-foreground">{sublabel}</span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/5 text-muted-foreground">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

export function SectionTitle({
  children,
  sub,
  right,
}: {
  children: ReactNode;
  sub?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-2">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-foreground">
          {children}
        </h2>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 border-dashed border-white/10 bg-zinc-900/40 p-8 text-center">
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-muted-foreground">
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm font-semibold">{title}</p>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </Card>
  );
}
