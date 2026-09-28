"use client";

import { useState } from "react";
import { Check, Copy, AlertTriangle, Key, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface SecretRevealModalProps {
  open: boolean;
  appName?: string;
  secretKey: string;
  onConfirmClose: () => void;
  title?: string;
  description?: string;
}

export function SecretRevealModal({
  open,
  appName,
  secretKey,
  onConfirmClose,
  title = "Save Your Secret Key",
  description,
}: SecretRevealModalProps) {
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(true);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);

  if (!open) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(secretKey);
      setCopied(true);
      toast.success("Secret key copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy secret key");
    }
  };

  const handleClose = () => {
    if (!hasAcknowledged && !copied) {
      toast.error("Please copy and acknowledge that you have stored your key safely.");
      return;
    }
    setHasAcknowledged(false);
    onConfirmClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Non-clickable Backdrop so user cannot accidentally lose key */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
        aria-hidden="true"
      />

      <div className="relative z-50 w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl transition-all animate-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center">
            <Key className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 leading-tight">
              {title}
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              {description || (appName ? `Generated for ${appName}` : "Authentication token for your vendor app")}
            </p>
          </div>
        </div>

        {/* Warning Alert */}
        <div className="mt-4">
          <Alert variant="warning" className="border-amber-300 bg-amber-50/80 text-amber-950 py-3">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-xs font-bold text-amber-900 tracking-wide uppercase">
              Important Security Notice
            </AlertTitle>
            <AlertDescription className="text-xs text-amber-800 leading-relaxed mt-1">
              Copy this key now. It will never be shown again. Store it securely in your backend environment variables.
            </AlertDescription>
          </Alert>
        </div>

        {/* Secret Key Display Box */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-600">
            <span className="font-semibold text-zinc-700">App Secret Key:</span>
            <button
              type="button"
              onClick={() => setRevealed(!revealed)}
              className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-800 text-[11px] font-medium transition-colors"
            >
              {revealed ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" /> Hide
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" /> Reveal
                </>
              )}
            </button>
          </div>

          <div className="relative flex items-center rounded-xl border border-zinc-200 bg-zinc-900 text-zinc-100 p-3 shadow-inner">
            <span className="font-mono text-xs sm:text-sm tracking-wide break-all select-all flex-1 pr-10">
              {revealed ? secretKey : "nb_sec_••••••••••••••••••••••••••••••••"}
            </span>

            <button
              type="button"
              onClick={handleCopy}
              title="Copy to clipboard"
              className={cn(
                "absolute right-2.5 top-2.5 p-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1",
                copied
                  ? "bg-emerald-600 border-emerald-500 text-white"
                  : "bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700 hover:text-white"
              )}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-semibold pr-1">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[11px] pr-1">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Safe Storage Acknowledgment Checkbox */}
        <div className="mt-5 rounded-xl bg-zinc-50 border border-zinc-200/80 p-3">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasAcknowledged}
              onChange={(e) => setHasAcknowledged(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
            />
            <span className="text-xs text-zinc-700 leading-snug">
              I have copied and safely stored this secret key. I understand it cannot be retrieved later and will need to be regenerated if lost.
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={handleCopy}
            className="border-zinc-300 hover:bg-zinc-100 text-xs font-semibold"
          >
            <Copy className="w-4 h-4 mr-1.5" />
            Copy Key Again
          </Button>

          <Button
            type="button"
            disabled={!hasAcknowledged && !copied}
            onClick={handleClose}
            className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-400" />
            I have safely stored my key
          </Button>
        </div>
      </div>
    </div>
  );
}
