"use client";

import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Note } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: Note | null;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  note,
  onConfirm,
  isDeleting,
}: DeleteConfirmDialogProps) {
  if (!note) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="sm:max-w-md rounded-2xl">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <DialogHeader className="mb-1 p-0">
              <DialogTitle className="text-base font-bold text-zinc-900">Delete Note</DialogTitle>
            </DialogHeader>
            <DialogDescription className="mt-0 text-xs text-zinc-500 leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-zinc-900">&ldquo;{note.title}&rdquo;</span>? This
              action cannot be undone.
            </DialogDescription>
          </div>
        </div>

        <DialogFooter className="mt-6 gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-xl shadow-xs"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Note"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
