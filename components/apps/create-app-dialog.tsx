"use client";

import { useState } from "react";
import { useFormik } from "formik";
import { Loader2, Sparkles, Globe, Link2, Image as ImageIcon, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createAppSchema } from "@/lib/schemas";
import { validateWithZod } from "@/lib/zod-formik";
import { appsApi, VendorApp, CreateAppInput } from "@/lib/api";
import { useToken } from "@/hooks/use-token";
import { SecretRevealModal } from "./secret-reveal-modal";

interface CreateAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAppCreated: (app: VendorApp) => void;
}

export function CreateAppDialog({
  open,
  onOpenChange,
  onAppCreated,
}: CreateAppDialogProps) {
  const { getValidAccessToken } = useToken();
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [createdAppName, setCreatedAppName] = useState<string>("");
  const [newAppRef, setNewAppRef] = useState<VendorApp | null>(null);

  const formik = useFormik<CreateAppInput>({
    initialValues: {
      name: "",
      description: "",
      logo: "",
      unicast_callback_url: "",
    },
    validate: validateWithZod(createAppSchema),
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const token = await getValidAccessToken();
        if (!token) {
          toast.error("You must be authenticated to create an app");
          return;
        }

        const payload: CreateAppInput = {
          name: values.name.trim(),
          description: values.description?.trim() || undefined,
          logo: values.logo?.trim() || undefined,
          unicast_callback_url: values.unicast_callback_url?.trim() || undefined,
        };

        const res = await appsApi.create(payload, token);
        toast.success(`App "${res.app.name}" created successfully!`);

        // Save reference to new app
        setNewAppRef(res.app);
        setCreatedAppName(res.app.name);

        // Store secret key to show in reveal dialog
        if (res.secret_key) {
          setCreatedSecret(res.secret_key);
        } else {
          // If no secret key returned in response, notify and finish
          onAppCreated(res.app);
          onOpenChange(false);
          resetForm();
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to create vendor app");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleRevealModalClose = () => {
    if (newAppRef) {
      onAppCreated(newAppRef);
    }
    setCreatedSecret(null);
    setNewAppRef(null);
    formik.resetForm();
    onOpenChange(false);
  };

  const handleClose = () => {
    if (formik.isSubmitting) return;
    formik.resetForm();
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open && !createdSecret} onOpenChange={handleClose}>
        <DialogContent onClose={handleClose} className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle>Create New Vendor App</DialogTitle>
                <DialogDescription>
                  Register an application to broadcast memos and deliver direct notifications.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={formik.handleSubmit} className="space-y-4 pt-1">
            {/* App Name */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="name" className="text-xs font-semibold text-zinc-800">
                  App Name <span className="text-rose-500">*</span>
                </Label>
                <span className="text-[11px] text-zinc-400">Required</span>
              </div>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. Acme Billing, Orders Hub"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={formik.isSubmitting}
                className={formik.touched.name && formik.errors.name ? "border-rose-400" : ""}
                autoFocus
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-xs text-rose-500 font-medium">{formik.errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold text-zinc-800">
                Description <span className="text-zinc-400 font-normal">(Optional)</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Briefly describe what notifications this app sends..."
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={formik.isSubmitting}
                className="min-h-[80px] text-sm"
              />
              {formik.touched.description && formik.errors.description && (
                <p className="text-xs text-rose-500 font-medium">{formik.errors.description}</p>
              )}
            </div>

            {/* App Logo URL */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="logo" className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                  Logo URL <span className="text-zinc-400 font-normal">(Optional)</span>
                </Label>
              </div>
              <Input
                id="logo"
                name="logo"
                type="url"
                placeholder="https://example.com/logo.png"
                value={formik.values.logo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={formik.isSubmitting}
                className={formik.touched.logo && formik.errors.logo ? "border-rose-400" : ""}
              />
              {formik.touched.logo && formik.errors.logo && (
                <p className="text-xs text-rose-500 font-medium">{formik.errors.logo}</p>
              )}
            </div>

            {/* Unicast Callback URL */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="unicast_callback_url" className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-zinc-400" />
                  Unicast Callback URL <span className="text-zinc-400 font-normal">(HTTPS Webhook)</span>
                </Label>
              </div>
              <Input
                id="unicast_callback_url"
                name="unicast_callback_url"
                type="url"
                placeholder="https://api.yourdomain.com/webhooks/notifyberry"
                value={formik.values.unicast_callback_url}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={formik.isSubmitting}
                className={formik.touched.unicast_callback_url && formik.errors.unicast_callback_url ? "border-rose-400" : ""}
              />
              <p className="text-[11px] text-zinc-500">
                Receives user events, memo deliveries, and confirmation hooks for direct subscribers.
              </p>
              {formik.touched.unicast_callback_url && formik.errors.unicast_callback_url && (
                <p className="text-xs text-rose-500 font-medium">{formik.errors.unicast_callback_url}</p>
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
                className="bg-zinc-900 hover:bg-zinc-800 text-white min-w-[110px]"
              >
                {formik.isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create App"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* One-Time Secret Key Reveal Dialog */}
      {createdSecret && (
        <SecretRevealModal
          open={Boolean(createdSecret)}
          appName={createdAppName}
          secretKey={createdSecret}
          onConfirmClose={handleRevealModalClose}
        />
      )}
    </>
  );
}
