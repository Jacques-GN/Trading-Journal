"use client";

import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Brain,
  CalendarRange,
  ScrollText,
  Wallet,
  MoreHorizontal,
  TrendingUp,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Brain,
  CalendarRange,
  ScrollText,
  Wallet,
  MoreHorizontal,
  TrendingUp,
  ClipboardList,
};

export function NavIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Cmp = ICONS[name] ?? LayoutDashboard;
  return <Cmp className={className} />;
}
