"use client";

import { Users, UserCheck, RadioTower, Send, RefreshCw } from "lucide-react";
import { AppStats } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AppMetricsBarProps {
  stats: AppStats | null;
  loading: boolean;
  onRefresh?: () => void;
}

export function AppMetricsBar({
  stats,
  loading,
  onRefresh,
}: AppMetricsBarProps) {
  const metricCards = [
    {
      title: "Broadcast Subscribers",
      value: stats?.broadcast_subscribers_count ?? 0,
      description: "Users opted in to channel memos",
      icon: Users,
      color: "from-blue-500/10 to-indigo-500/10",
      textColor: "text-blue-600",
      iconBorder: "border-blue-200/60",
    },
    {
      title: "Unicast Subscribers",
      value: stats?.unicast_subscribers_count ?? 0,
      description: "Users paired for direct alerts",
      icon: UserCheck,
      color: "from-violet-500/10 to-purple-500/10",
      textColor: "text-violet-600",
      iconBorder: "border-violet-200/60",
    },
    {
      title: "Total Broadcast Memos",
      value: stats?.total_broadcast_memos_sent ?? 0,
      description: "Channel-wide push messages sent",
      icon: RadioTower,
      color: "from-amber-500/10 to-orange-500/10",
      textColor: "text-amber-600",
      iconBorder: "border-amber-200/60",
    },
    {
      title: "Total Direct Memos",
      value: stats?.total_direct_memos_sent ?? 0,
      description: "Targeted unicast messages sent",
      icon: Send,
      color: "from-emerald-500/10 to-teal-500/10",
      textColor: "text-emerald-600",
      iconBorder: "border-emerald-200/60",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
          Metrics Overview
        </h2>
        {onRefresh && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="h-7 px-2 text-xs text-zinc-500 hover:text-zinc-800"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 mr-1", loading && "animate-spin")} />
            Refresh Stats
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-2xs hover:shadow-xs transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-zinc-500">{card.title}</p>
                  {loading ? (
                    <div className="h-8 w-20 bg-zinc-200/70 rounded-md animate-pulse my-1" />
                  ) : (
                    <p className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
                      {card.value.toLocaleString()}
                    </p>
                  )}
                  <p className="text-[11px] text-zinc-400">{card.description}</p>
                </div>

                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center border bg-linear-to-br shrink-0 shadow-2xs",
                    card.color,
                    card.iconBorder
                  )}
                >
                  <Icon className={cn("w-5 h-5", card.textColor)} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
