"use client";

import { useState } from "react";
import { AlertTriangle, Key, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { appsApi, VendorApp } from "@/lib/api";
import { useToken } from "@/hooks/use-token";
import { SecretRevealModal } from "./secret-reveal-modal";

interface RotateSecretModalProps {
  app: VendorApp;
  onSecretRotated?: (newSecretKey: string) => void;
}

export function RotateSecretSection({
  app,
  onSecretRotated,
}: RotateSecretModalProps) {
  const { getValidAccessToken } = useToken();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  const handleConfirmRotate = async () => {
    setIsRotating(true);
    try {
      const token = await getValidAccessToken();
      if (!token) {
        toast.error("Authentication required to rotate secret key");
        return;
      }

      const res = await appsApi.regenerateSecret(app.id, token);
      const secret = res.secret_key;

      if (!secret) {
        throw new Error("No secret key returned in rotation response");
      }

      toast.success("Secret key regenerated successfully!");
      setIsConfirmOpen(false);
      setNewKey(secret);
      if (onSecretRotated) {
        onSecretRotated(secret);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to rotate secret key");
    } finally {
      setIsRotating(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
            <Key className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900">App Secret Key</h3>
            <p className="text-xs text-zinc-500">
              Used to authenticate server-to-server webhook deliveries and REST calls.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setIsConfirmOpen(true)}
          className="border-amber-300 text-amber-900 hover:bg-amber-50/60 font-semibold text-xs h-9 px-3.5 rounded-xl shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
          Rotate Secret Key
        </Button>
      </div>

      {/* Masked Secret Key Display */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-700">Current Key Token</label>
        <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-zinc-500">
          <span className="font-mono text-sm tracking-widest select-none text-zinc-700">
            nb_sec_••••••••••••••••••••••••
          </span>
          <span className="text-[11px] font-medium bg-zinc-200/60 text-zinc-600 px-2.5 py-0.5 rounded-md">
            Hidden for security
          </span>
        </div>
        <p className="text-[11px] text-zinc-400">
          For your protection, existing keys cannot be shown after creation. If lost, generate a replacement above.
        </p>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent onClose={() => setIsConfirmOpen(false)} className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2.5 text-amber-600">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <DialogTitle className="text-zinc-900">Rotate Secret Key?</DialogTitle>
            </div>
            <DialogDescription className="pt-2 text-zinc-600">
              Rotating this key will immediately invalidate the previous key. Are you sure?
            </DialogDescription>
          </DialogHeader>

          <Alert variant="warning" className="border-amber-300 bg-amber-50/70 text-amber-950 text-xs py-3">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <AlertTitle className="text-xs font-bold text-amber-900">Active Integrations Will Break</AlertTitle>
            <AlertDescription className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
              Any servers using the old key will get 401 Unauthorized errors until updated with the new secret key.
            </AlertDescription>
          </Alert>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isRotating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmRotate}
              disabled={isRotating}
              className="bg-amber-600 hover:bg-amber-700 text-white min-w-[130px]"
            >
              {isRotating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Rotating...
                </>
              ) : (
                "Yes, Rotate Key"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* One-Time Secret Key Reveal Modal upon rotation */}
      {newKey && (
        <SecretRevealModal
          open={Boolean(newKey)}
          appName={app.name}
          secretKey={newKey}
          title="New Secret Key Generated"
          description="Your previous secret key has been permanently invalidated. Copy and deploy this new key immediately."
          onConfirmClose={() => setNewKey(null)}
        />
      )}
    </div>
  );
}
