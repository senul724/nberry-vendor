"use client";

import { useState } from "react";
import { useFormik } from "formik";
import { Send, Radio, User, RadioTower, Sparkles, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { sendNotificationSchema } from "@/lib/schemas";
import { validateWithZod } from "@/lib/zod-formik";
import { appsApi, VendorApp, SendNotificationInput } from "@/lib/api";
import { useToken } from "@/hooks/use-token";
import { cn } from "@/lib/utils";

interface SendNotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  app: VendorApp | null;
}

export function SendNotificationModal({
  open,
  onOpenChange,
  app,
}: SendNotificationModalProps) {
  const { getValidAccessToken } = useToken();

  const formik = useFormik<SendNotificationInput>({
    initialValues: {
      type: "broadcast",
      title: "",
      message: "",
      recipient_id: "",
    },
    validate: validateWithZod(sendNotificationSchema),
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      if (!app) return;
      try {
        const token = await getValidAccessToken();
        if (!token) {
          toast.error("Authentication required to send notification");
          return;
        }

        await appsApi.sendNotification(
          app.id,
          {
            type: values.type,
            title: values.title.trim(),
            message: values.message.trim(),
            recipient_id: values.type === "unicast" ? values.recipient_id?.trim() : undefined,
          },
          token
        );

        toast.success(
          values.type === "broadcast"
            ? `Broadcast memo sent to all subscribers of ${app.name}!`
            : `Direct memo dispatched to recipient!`
        );
        resetForm();
        onOpenChange(false);
      } catch (err: any) {
        toast.error(err.message || "Failed to dispatch notification");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleClose = () => {
    if (formik.isSubmitting) return;
    formik.resetForm();
    onOpenChange(false);
  };

  if (!app) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent onClose={handleClose} className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle>Send Notification Memo</DialogTitle>
              <DialogDescription>
                Dispatch an instant push memo via <span className="font-semibold text-zinc-800">{app.name}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-4 pt-1">
          {/* Notification Mode Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-zinc-800">Delivery Channel</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  formik.setFieldValue("type", "broadcast");
                }}
                className={cn(
                  "p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer",
                  formik.values.type === "broadcast"
                    ? "border-zinc-900 bg-zinc-900 text-white shadow-xs"
                    : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800"
                )}
              >
                <RadioTower className={cn("w-4 h-4 mt-0.5 shrink-0", formik.values.type === "broadcast" ? "text-indigo-400" : "text-zinc-500")} />
                <div>
                  <p className="text-xs font-bold leading-tight">Broadcast</p>
                  <p className={cn("text-[10px] mt-0.5", formik.values.type === "broadcast" ? "text-zinc-300" : "text-zinc-500")}>
                    All subscribers receive this memo
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  formik.setFieldValue("type", "unicast");
                }}
                className={cn(
                  "p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer",
                  formik.values.type === "unicast"
                    ? "border-zinc-900 bg-zinc-900 text-white shadow-xs"
                    : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800"
                )}
              >
                <User className={cn("w-4 h-4 mt-0.5 shrink-0", formik.values.type === "unicast" ? "text-violet-400" : "text-zinc-500")} />
                <div>
                  <p className="text-xs font-bold leading-tight">Unicast</p>
                  <p className={cn("text-[10px] mt-0.5", formik.values.type === "unicast" ? "text-zinc-300" : "text-zinc-500")}>
                    Target single specific user
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Recipient User ID (Unicast only) */}
          {formik.values.type === "unicast" && (
            <div className="space-y-1.5 animate-in fade-in-50 duration-150">
              <div className="flex items-center justify-between">
                <Label htmlFor="recipient_id" className="text-xs font-semibold text-zinc-800">
                  Recipient User ID <span className="text-rose-500">*</span>
                </Label>
                <span className="text-[11px] text-zinc-400">Subscriber UUID</span>
              </div>
              <Input
                id="recipient_id"
                name="recipient_id"
                type="text"
                placeholder="e.g. usr_8f3a9c72e4b1"
                value={formik.values.recipient_id}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={formik.isSubmitting}
                className={formik.touched.recipient_id && formik.errors.recipient_id ? "border-rose-400" : ""}
                autoFocus
              />
              {formik.touched.recipient_id && formik.errors.recipient_id && (
                <p className="text-xs text-rose-500 font-medium">{formik.errors.recipient_id}</p>
              )}
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-semibold text-zinc-800">
              Memo Title <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="e.g. Security Alert, Payment Processed"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={formik.isSubmitting}
              className={formik.touched.title && formik.errors.title ? "border-rose-400" : ""}
            />
            {formik.touched.title && formik.errors.title && (
              <p className="text-xs text-rose-500 font-medium">{formik.errors.title}</p>
            )}
          </div>

          {/* Message Content */}
          <div className="space-y-1.5">
            <Label htmlFor="message" className="text-xs font-semibold text-zinc-800">
              Message Content <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Enter the notification body..."
              value={formik.values.message}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={formik.isSubmitting}
              className="min-h-[100px] text-sm"
            />
            {formik.touched.message && formik.errors.message && (
              <p className="text-xs text-rose-500 font-medium">{formik.errors.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={formik.isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={formik.isSubmitting}
              className="bg-zinc-900 hover:bg-zinc-800 text-white min-w-[120px]"
            >
              {formik.isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Send Memo
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
