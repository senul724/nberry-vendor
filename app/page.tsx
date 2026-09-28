import Link from "next/link";
import { Bell, ShieldCheck, ArrowRight, Zap, RadioTower, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-zinc-50 via-white to-zinc-50 flex flex-col justify-between selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-bold text-zinc-900">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-600 text-white flex items-center justify-center shadow-xs">
              <Bell className="w-4 h-4 fill-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight">Notify Berry</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 bg-violet-50 border border-violet-200 px-1.5 py-0.2 rounded-md">
                Vendor Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button size="sm">Go to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-50 text-violet-900 text-xs font-semibold border border-violet-200/80 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-violet-600" />
            <span>Notify Berry Vendor Management Console</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 leading-tight">
            Developer APIs &amp; App Management for Real-Time Push Memos
          </h1>

          <p className="text-base sm:text-lg text-zinc-600 max-w-xl mx-auto leading-relaxed">
            Register vendor apps, manage secure API credentials, monitor broadcast &amp; direct subscriber metrics, and run live webhook diagnostics.
          </p>

          <div className="flex items-center justify-center pt-4">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gap-2 bg-zinc-900 hover:bg-zinc-800 text-white shadow-md">
                Enter Vendor Console
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12 text-left">
            <div className="p-5 rounded-2xl border border-zinc-200 bg-white shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <RadioTower className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-zinc-900">Broadcast &amp; Direct Memos</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Send push memos across wide subscriber channels or deliver direct alerts to targeted users.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-zinc-200 bg-white shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-zinc-900">Webhook Diagnostics</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Test unicast callback URLs with one click, measuring live latency and payload delivery status.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-zinc-200 bg-white shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <KeyRound className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-zinc-900">Secret Key Rotation</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                High-security secret generation with one-time reveal dialogs and zero-downtime key rotation.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200/80 py-6 text-center text-xs text-zinc-500">
        <p>&copy; {new Date().getFullYear()} Notify Berry. All rights reserved.</p>
      </footer>
    </div>
  );
}

