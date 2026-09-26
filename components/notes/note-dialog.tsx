"use client";

import React, { useEffect } from "react";
import { useFormik } from "formik";
import { Loader2, Sparkles, PenLine } from "lucide-react";
import { Note } from "@/lib/api";
import { validateWithZod } from "@/lib/zod-formik";
import { noteSchema } from "@/lib/schemas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface NoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteToEdit: Note | null;
  onSubmit: (values: { title: string; content: string }) => Promise<void>;
}

export function NoteDialog({
  open,
  onOpenChange,
  noteToEdit,
  onSubmit,
}: NoteDialogProps) {
  const isEditing = Boolean(noteToEdit);

  const formik = useFormik({
    initialValues: {
      title: "",
      content: "",
    },
    enableReinitialize: true,
    validate: validateWithZod(noteSchema),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await onSubmit(values);
        resetForm();
        onOpenChange(false);
      } catch (error) {
        console.error("Failed to save note:", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // When dialog opens or noteToEdit changes, synchronize form values
  useEffect(() => {
    if (open) {
      if (noteToEdit) {
        formik.setValues({
          title: noteToEdit.title,
          content: noteToEdit.content,
        });
      } else {
        formik.resetForm();
      }
    }
  }, [open, noteToEdit]);

  // Handle Ctrl/Cmd + Enter to submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      formik.handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-800">
              <PenLine className="w-4 h-4" />
            </div>
            <DialogTitle className="text-lg font-bold text-zinc-900">
              {isEditing ? "Edit Note" : "Create New Note"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-zinc-500">
            {isEditing
              ? "Modify your note details and save changes to your secure vault."
              : "Capture your ideas, memos, or task lists securely in your vault."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} onKeyDown={handleKeyDown} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="title" className="text-xs font-semibold text-zinc-700">
                Title
              </Label>
              <span className="text-[11px] text-zinc-400">
                {formik.values.title.length}/120
              </span>
            </div>
            <Input
              id="title"
              name="title"
              placeholder="e.g. System Architecture Roadmap"
              className="rounded-xl border-zinc-200/90 focus-visible:ring-indigo-500"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={formik.isSubmitting}
              autoFocus
            />
            {formik.touched.title && formik.errors.title && (
              <p className="text-xs font-medium text-rose-600">{formik.errors.title}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="content" className="text-xs font-semibold text-zinc-700">
                Content
              </Label>
              <span className="text-[11px] text-zinc-400">
                {formik.values.content.length} characters
              </span>
            </div>
            <Textarea
              id="content"
              name="content"
              rows={7}
              placeholder="Type your notes, ideas, or markdown here..."
              className="rounded-xl border-zinc-200/90 focus-visible:ring-indigo-500 font-normal leading-relaxed resize-none"
              value={formik.values.content}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={formik.isSubmitting}
            />
            {formik.touched.content && formik.errors.content && (
              <p className="text-xs font-medium text-rose-600">{formik.errors.content}</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-zinc-400 hidden sm:inline">
              Tip: Press <kbd className="px-1.5 py-0.5 text-[10px] bg-zinc-100 border border-zinc-200 rounded text-zinc-600 font-mono">⌘ + Enter</kbd> to save
            </span>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={formik.isSubmitting}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={formik.isSubmitting}
                className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl shadow-xs"
              >
                {formik.isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : isEditing ? (
                  "Save Changes"
                ) : (
                  "Create Note"
                )}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
