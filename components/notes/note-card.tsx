"use client";

import React from "react";
import { Pin, Pencil, Trash2, Calendar, Clock, FileText } from "lucide-react";
import { Note } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  onTogglePin?: (note: Note) => void;
  viewMode?: "grid" | "list";
}

export function NoteCard({
  note,
  onEdit,
  onDelete,
  onTogglePin,
  viewMode = "grid",
}: NoteCardProps) {
  const formattedDate = React.useMemo(() => {
    if (!note.created_at) return null;
    try {
      const date = new Date(note.created_at);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
    } catch {
      return null;
    }
  }, [note.created_at]);

  const readTime = React.useMemo(() => {
    const wordCount = note.content.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(wordCount / 180));
    return `${minutes} min read`;
  }, [note.content]);

  // List View Layout
  if (viewMode === "list") {
    return (
      <div
        className={cn(
          "group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition-all duration-200",
          "hover:shadow-md hover:border-zinc-300 bg-white",
          note.pinned
            ? "border-amber-200/90 bg-gradient-to-r from-amber-50/40 via-white to-white"
            : "border-zinc-200/80"
        )}
      >
        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
          {onTogglePin && (
            <button
              type="button"
              onClick={() => onTogglePin(note)}
              title={note.pinned ? "Unpin note" : "Pin note"}
              className={cn(
                "mt-0.5 sm:mt-0 p-1.5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-zinc-950 shrink-0",
                note.pinned
                  ? "text-amber-500 bg-amber-100/80 hover:bg-amber-200/80"
                  : "text-zinc-300 hover:text-zinc-600 hover:bg-zinc-100"
              )}
            >
              <Pin
                className={cn(
                  "h-4 w-4 transition-transform",
                  note.pinned ? "fill-amber-500 rotate-12" : "group-hover:scale-110"
                )}
              />
            </button>
          )}

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-zinc-900 truncate group-hover:text-indigo-600 transition-colors">
                {note.title}
              </h4>
              {note.pinned && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  Pinned
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 truncate max-w-2xl">
              {note.content}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            {formattedDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formattedDate}
              </span>
            )}
            <span className="hidden md:flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {readTime}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
              onClick={() => onEdit(note)}
            >
              <Pencil className="w-3.5 h-3.5 mr-1" />
              Edit
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
              onClick={() => onDelete(note)}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Grid View Layout (Modern Card)
  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl border transition-all duration-300 overflow-hidden",
        "hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-200/50",
        note.pinned
          ? "border-amber-200/80 bg-gradient-to-b from-amber-50/30 via-white to-white shadow-xs"
          : "border-zinc-200/80 bg-white hover:border-zinc-300"
      )}
    >
      {/* Top color accent strip for pinned notes */}
      {note.pinned && (
        <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300" />
      )}

      {/* Card Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {note.pinned && (
                <Badge
                  variant="amber"
                  className="text-[10px] font-semibold py-0.5 px-2 gap-1 rounded-full shadow-2xs"
                >
                  <Pin className="w-2.5 h-2.5 fill-amber-700" />
                  Pinned
                </Badge>
              )}
              {formattedDate && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-400">
                  <Calendar className="w-3 h-3 text-zinc-400" />
                  {formattedDate}
                </span>
              )}
            </div>

            <h3 className="text-base font-semibold text-zinc-900 tracking-tight line-clamp-1 group-hover:text-indigo-600 transition-colors">
              {note.title}
            </h3>
          </div>

          {onTogglePin && (
            <button
              type="button"
              onClick={() => onTogglePin(note)}
              title={note.pinned ? "Unpin note" : "Pin note"}
              className={cn(
                "rounded-lg p-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-zinc-950 shrink-0",
                note.pinned
                  ? "text-amber-600 bg-amber-100/70 hover:bg-amber-200/80 shadow-2xs"
                  : "text-zinc-300 opacity-0 group-hover:opacity-100 hover:text-zinc-600 hover:bg-zinc-100"
              )}
            >
              <Pin
                className={cn(
                  "h-4 w-4 transition-transform",
                  note.pinned ? "fill-current rotate-12" : "group-hover:scale-110"
                )}
              />
              <span className="sr-only">Toggle Pin</span>
            </button>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="px-5 pb-4 flex-1">
        <p className="text-sm text-zinc-600 leading-relaxed line-clamp-4 whitespace-pre-wrap font-normal">
          {note.content}
        </p>
      </div>

      {/* Card Footer */}
      <div className="px-5 py-3 border-t border-zinc-100/90 bg-zinc-50/40 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-zinc-400" />
            {readTime}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3 text-zinc-400" />
            {note.content.length} chars
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-zinc-600 hover:text-zinc-900 hover:bg-white shadow-2xs transition-all"
            onClick={() => onEdit(note)}
          >
            <Pencil className="w-3 h-3 mr-1" />
            Edit
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-all"
            onClick={() => onDelete(note)}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
