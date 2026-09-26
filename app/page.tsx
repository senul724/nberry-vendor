import Link from "next/link";
import { BookOpenText, ShieldCheck, ArrowRight, Lock, Sparkles, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-zinc-50 via-white to-zinc-50 flex flex-col justify-between">
      {/* Navigation */}
      <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-bold text-zinc-900">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-xs">
              <BookOpenText className="w-4 h-4 text-zinc-200" />
            </div>
            <span>Notes IAM Demo</span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button size="sm">Continue to App</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 text-zinc-800 text-xs font-medium border border-zinc-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Go Gin IAM Backend Integration</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 leading-tight">
            Secure Notes with Modern Identity & Access Management
          </h1>

          <p className="text-base sm:text-lg text-zinc-600 max-w-xl mx-auto leading-relaxed">
            A production-ready demo featuring passwordless OTP, password authentication,
            in-memory token rotation, silent token refresh, and HTTP-only session cookies.
          </p>

          <div className="flex items-center justify-center pt-4">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                Enter Email to Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12 text-left">
            <div className="p-5 rounded-2xl border border-zinc-200 bg-white shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800">
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <h3 className="font-semibold text-sm text-zinc-900">Smart Auth</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Adaptive flow checking email existence, offering OTP or password based on user credentials.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-zinc-200 bg-white shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800">
                <Lock className="w-4 h-4 text-indigo-500" />
              </div>
              <h3 className="font-semibold text-sm text-zinc-900">Silent Refresh</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                In-memory access token rotation with automatic 401 interceptor and retry queue.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-zinc-200 bg-white shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800">
                <KeyRound className="w-4 h-4 text-emerald-500" />
              </div>
              <h3 className="font-semibold text-sm text-zinc-900">Same-Origin Proxy</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Next.js rewrites proxying requests seamlessly to Go backend without cookie domain conflicts.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200/80 py-6 text-center text-xs text-zinc-500">
        <p>Next.js App Router &bull; Go IAM Backend &bull; Tailwind CSS &bull; Shadcn UI</p>
      </footer>
    </div>
  );
}
