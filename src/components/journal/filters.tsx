"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { useFetch } from "@/lib/api";

interface FilterValues {
  range: string;
  instrument: string;
  strategyId: string;
  result: string;
}

export function Filters({
  filters,
  setFilters,
}: {
  filters: FilterValues;
  setFilters: (f: FilterValues) => void;
}) {
  const { data: strategies } = useFetch<any[]>("/api/strategies");

  const update = (k: keyof FilterValues, v: string) =>
    setFilters({ ...filters, [k]: v });

  const reset = () =>
    setFilters({ range: "all", instrument: "", strategyId: "all", result: "all" });

  const hasFilters =
    filters.range !== "all" ||
    filters.instrument !== "" ||
    filters.strategyId !== "all" ||
    filters.result !== "all";

  return (
    <Card className="border-white/5 bg-zinc-900/60 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={filters.range} onValueChange={(v) => update("range", v)}>
          <SelectTrigger className="h-9 w-[140px] border-white/10 bg-white/5 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-zinc-900">
            <SelectItem value="all">Toute la période</SelectItem>
            <SelectItem value="today">Aujourd'hui</SelectItem>
            <SelectItem value="week">7 derniers jours</SelectItem>
            <SelectItem value="month">30 derniers jours</SelectItem>
            <SelectItem value="year">12 derniers mois</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.instrument}
            onChange={(e) => update("instrument", e.target.value)}
            placeholder="Rechercher un instrument…"
            className="h-9 border-white/10 bg-white/5 pl-9 text-xs"
          />
        </div>

        <Select value={filters.strategyId} onValueChange={(v) => update("strategyId", v)}>
          <SelectTrigger className="h-9 w-[150px] border-white/10 bg-white/5 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-zinc-900">
            <SelectItem value="all">Toutes stratégies</SelectItem>
            {strategies?.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.result} onValueChange={(v) => update("result", v)}>
          <SelectTrigger className="h-9 w-[130px] border-white/10 bg-white/5 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-zinc-900">
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="win">Gagnants</SelectItem>
            <SelectItem value="loss">Perdants</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="h-9 px-2 text-xs text-muted-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Réinitialiser
          </Button>
        )}
      </div>
    </Card>
  );
}
