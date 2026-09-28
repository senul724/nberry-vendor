"use client";

import { useState } from "react";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { appsApi, TestCallbackResult } from "@/lib/api";
import { useToken } from "@/hooks/use-token";
import { cn } from "@/lib/utils";

interface CallbackDiagnosticsProps {
  appId: string;
  callbackUrl?: string | null;
  disabled?: boolean;
}

export function CallbackDiagnostics({
  appId,
  callbackUrl,
  disabled,
}: CallbackDiagnosticsProps) {
  const { getValidAccessToken } = useToken();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestCallbackResult | null>(null);
  const [showPayload, setShowPayload] = useState(false);

  const handleTestCallback = async () => {
    if (!callbackUrl || !callbackUrl.trim()) {
      toast.error("Please configure and save an HTTPS callback URL before testing.");
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const token = await getValidAccessToken();
      if (!token) {
        toast.error("Authentication required to test webhook callback");
        return;
      }

      const result = await appsApi.testCallback(appId, token);
      setTestResult(result);

      if (result.success) {
        toast.success(`Webhook test passed (${result.status_code} in ${result.latency_ms}ms)`);
      } else {
        toast.error(`Webhook test failed: ${result.message || result.status}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to trigger webhook test");
      setTestResult({
        status_code: 500,
        status: "500 Error",
        latency_ms: 0,
        message: err.message,
        success: false,
      });
    } finally {
      setTesting(false);
    }
  };

  const hasCallback = Boolean(callbackUrl && callbackUrl.trim());

  return (
    <div className="space-y-3">
      {/* Test Webhook Button */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={testing || disabled || !hasCallback}
          onClick={handleTestCallback}
          className={cn(
            "h-10 px-4 rounded-xl border-zinc-200 text-xs font-semibold shadow-2xs transition-all",
            hasCallback
              ? "bg-white hover:bg-zinc-50 text-zinc-900 border-zinc-300"
              : "opacity-60 cursor-not-allowed bg-zinc-50 text-zinc-400"
          )}
          title={!hasCallback ? "Enter and save an HTTPS callback URL first" : "Send test webhook ping"}
        >
          {testing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-zinc-600" />
              Testing Webhook...
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-500 fill-amber-500" />
              Test Webhook
            </>
          )}
        </Button>

        {!hasCallback && (
          <span className="text-xs text-zinc-400 italic">
            Save a callback URL to enable diagnostics
          </span>
        )}
      </div>

      {/* Diagnostics Live Feedback Result Badge */}
      {testResult && (
        <div
          className={cn(
            "rounded-xl border p-3.5 text-xs transition-all animate-in fade-in-50 duration-200 shadow-2xs space-y-2",
            testResult.success
              ? "bg-emerald-50/70 border-emerald-200/90 text-emerald-950"
              : "bg-rose-50/70 border-rose-200/90 text-rose-950"
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Status & Latency Badges */}
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <div className="flex items-center gap-1.5 font-bold text-emerald-700 bg-white/80 border border-emerald-300 px-2.5 py-1 rounded-lg shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{testResult.status_code} {testResult.status.replace(/^\d+\s*/, "") || "OK"}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 font-bold text-rose-700 bg-white/80 border border-rose-300 px-2.5 py-1 rounded-lg shadow-2xs">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>{testResult.status_code || "ERR"} {testResult.status}</span>
                </div>
              )}

              {/* Latency badge */}
              <div className="flex items-center gap-1 text-zinc-700 bg-white/80 border border-zinc-200 px-2 py-1 rounded-lg shadow-2xs font-mono text-[11px]">
                <Clock className="w-3 h-3 text-zinc-500" />
                <span>{testResult.latency_ms}ms</span>
              </div>
            </div>

            {/* Payload toggle if details exist */}
            {Boolean(testResult.payload) && (
              <button
                type="button"
                onClick={() => setShowPayload(!showPayload)}
                className="text-[11px] font-semibold text-zinc-600 hover:text-zinc-900 flex items-center gap-1 cursor-pointer"
              >
                <span>{showPayload ? "Hide Response" : "View Response"}</span>
                {showPayload ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>

          {/* Feedback message */}
          <p className="text-xs leading-relaxed text-zinc-700">
            {testResult.message || (testResult.success ? "Callback verified successfully." : "Webhook callback returned an error.")}
          </p>

          {/* Collapsible Response Payload */}
          {showPayload && Boolean(testResult.payload) && (
            <div className="pt-2 border-t border-zinc-200/60">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                Webhook Response Payload:
              </p>
              <pre className="font-mono text-[11px] bg-zinc-900 text-zinc-100 p-2.5 rounded-lg overflow-x-auto max-h-40 selection:bg-zinc-800">
                {typeof testResult.payload === "string"
                  ? testResult.payload
                  : JSON.stringify(testResult.payload, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
