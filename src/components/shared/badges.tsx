"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency, formatR } from "@/lib/format";

export function DirectionBadge({ direction }: { direction: string }) {
  const isLong = direction === "long";
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 border font-mono text-[10px] uppercase",
        isLong
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
          : "border-rose-500/30 bg-rose-500/10 text-rose-500"
      )}
    >
      {isLong ? "LONG" : "SHORT"}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const open = status === "open";
  return (
    <Badge
      variant="outline"
      className={cn(
        "border text-[10px] uppercase",
        open
          ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
          : "border-white/10 bg-white/5 text-muted-foreground"
      )}
    >
      {open ? "OUVERT" : "CLÔTURÉ"}
    </Badge>
  );
}

export function PnlText({
  value,
  withSign = true,
  className,
}: {
  value: number;
  withSign?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-mono tabular-nums",
        value > 0
          ? "text-emerald-500"
          : value < 0
          ? "text-rose-500"
          : "text-muted-foreground",
        className
      )}
    >
      {withSign ? formatCurrency(value, { sign: true }) : formatCurrency(value)}
    </span>
  );
}

export function RText({ value }: { value: number | null | undefined }) {
  if (value == null) return <span className="text-muted-foreground">—</span>;
  return (
    <span
      className={cn(
        "font-mono tabular-nums",
        value > 0 ? "text-emerald-500" : value < 0 ? "text-rose-500" : "text-muted-foreground"
      )}
    >
      {formatR(value)}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    low: "border-white/10 bg-white/5 text-muted-foreground",
    medium: "border-amber-500/30 bg-amber-500/10 text-amber-500",
    high: "border-orange-500/30 bg-orange-500/10 text-orange-500",
    critical: "border-rose-500/30 bg-rose-500/10 text-rose-500",
  };
  return (
    <Badge
      variant="outline"
      className={cn(
        "border text-[10px] uppercase",
        map[severity] ?? map.medium
      )}
    >
      {severity}
    </Badge>
  );
}

export function EmotionTag({ emotion }: { emotion: string | null | undefined }) {
  if (!emotion) return null;
  const positive = ["confiance", "calme"].includes(emotion);
  const negative = ["peur", "avidité", "FOMO", "frustration"].includes(emotion);
  return (
    <Badge
      variant="outline"
      className={cn(
        "border text-[10px]",
        positive
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
          : negative
          ? "border-rose-500/30 bg-rose-500/10 text-rose-500"
          : "border-white/10 bg-white/5 text-muted-foreground"
      )}
    >
      {emotion}
    </Badge>
  );
}
