"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ExternalLink,
  Send,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  Settings,
  Globe,
  Radio,
  ArrowRight,
} from "lucide-react";
import { VendorApp } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AppCardProps {
  app: VendorApp;
  onSendNotification: (app: VendorApp) => void;
  viewMode?: "grid" | "list";
}

export function AppCard({
  app,
  onSendNotification,
  viewMode = "grid",
}: AppCardProps) {
  const [logoError, setLogoError] = useState(false);

  // Format creation date
  const createdDate = app.created_at || app.createdAt;
  const formattedDate = createdDate
    ? new Date(createdDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently created";

  // App initials for fallback icon
  const initials = app.name
    ? app.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "AP";

  const hasCallback = Boolean(app.unicast_callback_url && app.unicast_callback_url.trim());

  if (viewMode === "list") {
    return (
      <div className="group rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-xs hover:shadow-md hover:border-zinc-300 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Logo & Info */}
        <div className="flex items-start sm:items-center gap-4 min-w-0">
          {/* Logo or Fallback */}
          <div className="relative shrink-0">
            {app.logo && !logoError ? (
              <img
                src={app.logo}
                alt={app.name}
                onError={() => setLogoError(true)}
                className="w-12 h-12 rounded-xl object-cover border border-zinc-200 bg-zinc-50 shadow-2xs"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-2xs ring-1 ring-zinc-700/50">
                {initials}
              </div>
            )}
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/dashboard/apps/${app.id}`}
                className="font-bold text-base text-zinc-900 hover:text-indigo-600 transition-colors truncate tracking-tight"
              >
                {app.name}
              </Link>

              {/* Callback Badge */}
              {hasCallback ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Callback Configured
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
                  <AlertCircle className="w-3 h-3 text-zinc-400" />
                  No Callback Set
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-500 line-clamp-1 max-w-xl">
              {app.description || "No description provided for this vendor app."}
            </p>

            <div className="flex items-center gap-3 text-[11px] text-zinc-400 pt-0.5">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Created {formattedDate}
              </span>
              {hasCallback && (
                <span className="hidden sm:inline font-mono truncate max-w-xs text-zinc-400">
                  {app.unicast_callback_url}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Quick Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onSendNotification(app)}
            className="h-9 px-3.5 border-zinc-200 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 font-medium text-xs rounded-xl"
          >
            <Send className="w-3.5 h-3.5 mr-1.5 text-zinc-500" />
            Send Notification
          </Button>

          <Link href={`/dashboard/apps/${app.id}`}>
            <Button
              type="button"
              size="sm"
              className="h-9 px-4 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded-xl shadow-xs gap-1.5"
            >
              <span>Manage App</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-300" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Grid Mode Card
  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-xs hover:shadow-lg hover:border-zinc-300/90 transition-all duration-200">
      {/* Top Header: Logo, Name, Callback Badge */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          {/* Logo or Fallback Initials */}
          <div className="relative">
            {app.logo && !logoError ? (
              <img
                src={app.logo}
                alt={app.name}
                onError={() => setLogoError(true)}
                className="w-12 h-12 rounded-xl object-cover border border-zinc-200 bg-zinc-50 shadow-2xs group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-800 via-zinc-900 to-black text-white flex items-center justify-center font-bold text-base tracking-tight shadow-xs ring-1 ring-zinc-700/60 group-hover:scale-105 transition-transform duration-200">
                {initials}
              </div>
            )}
          </div>

          {/* Callback URL Status Badge */}
          {hasCallback ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Configured
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 text-zinc-500 border border-zinc-200">
              <AlertCircle className="w-3 h-3 text-zinc-400" />
              Not set
            </span>
          )}
        </div>

        {/* Title and Description */}
        <div className="space-y-1.5">
          <Link
            href={`/dashboard/apps/${app.id}`}
            className="block font-bold text-lg text-zinc-900 group-hover:text-indigo-600 transition-colors tracking-tight line-clamp-1"
          >
            {app.name}
          </Link>

          <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed min-h-[34px]">
            {app.description || "No description provided for this vendor application."}
          </p>
        </div>

        {/* Metadata: Unicast Callback / Creation Date */}
        <div className="pt-2 border-t border-zinc-100 space-y-1.5 text-[11px] text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>Created {formattedDate}</span>
          </div>

          {hasCallback ? (
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-500 truncate" title={app.unicast_callback_url || ""}>
              <Globe className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">{app.unicast_callback_url}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Globe className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
              <span className="italic">No webhook callback URL</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions Footer */}
      <div className="pt-5 mt-4 border-t border-zinc-100 flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onSendNotification(app)}
          className="flex-1 h-9 border-zinc-200 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 text-xs font-semibold rounded-xl"
        >
          <Send className="w-3.5 h-3.5 mr-1 text-zinc-500" />
          Send Notification
        </Button>

        <Link href={`/dashboard/apps/${app.id}`} className="flex-1">
          <Button
            type="button"
            size="sm"
            className="w-full h-9 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center justify-center gap-1"
          >
            <span>Manage App</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
