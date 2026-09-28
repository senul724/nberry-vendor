"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { appsApi, VendorApp } from "@/lib/api";
import { useToken } from "@/hooks/use-token";

interface DeleteAppModalProps {
  app: VendorApp;
}

export function DeleteAppSection({ app }: DeleteAppModalProps) {
  const router = useRouter();
  const { getValidAccessToken } = useToken();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const isMatched = confirmName.trim() === app.name.trim();

  const handleDelete = async () => {
    if (!isMatched) {
      toast.error("App name does not match. Please verify.");
      return;
    }

    setIsDeleting(true);
    try {
      const token = await getValidAccessToken();
      if (!token) {
        toast.error("Authentication required to delete app");
        return;
      }

      await appsApi.delete(app.id, token);
      toast.success(`App "${app.name}" was permanently deleted`);
      setIsOpen(false);
      router.push("/dashboard/apps");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete app");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (isDeleting) return;
    setConfirmName("");
    setIsOpen(false);
  };

  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50/30 p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-rose-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-rose-950">Danger Zone</h3>
            <p className="text-xs text-rose-700/80">
              Permanently remove this application, all associated webhook subscriptions, and delivery history.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="destructive"
          onClick={() => setIsOpen(true)}
          className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs h-9 px-4 rounded-xl shadow-xs self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
          Delete App
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent onClose={handleClose} className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2.5 text-rose-600">
              <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <DialogTitle className="text-zinc-900">Delete Application</DialogTitle>
            </div>
            <DialogDescription className="pt-2 text-zinc-600">
              This action <strong className="text-rose-600 font-semibold">cannot</strong> be undone. This will permanently delete the app{" "}
              <strong className="text-zinc-900">&ldquo;{app.name}&rdquo;</strong> and invalidate all existing tokens.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <Label htmlFor="confirm_app_name" className="text-xs font-medium text-zinc-700">
              To confirm, type <strong className="text-zinc-900 font-semibold select-all font-mono">{app.name}</strong> below:
            </Label>
            <Input
              id="confirm_app_name"
              type="text"
              placeholder={app.name}
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              disabled={isDeleting}
              autoFocus
              className="font-mono text-sm"
            />
          </div>

          <DialogFooter className="mt-5">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={!isMatched || isDeleting}
              className="bg-rose-600 hover:bg-rose-700 min-w-[130px]"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete This App"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
