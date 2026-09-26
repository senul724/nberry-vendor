"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth/auth-card";
import { SmartLoginView } from "@/components/auth/smart-login-view";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="20" height="20">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email");
  const [showEmailLogin, setShowEmailLogin] = useState<boolean>(Boolean(initialEmail));

  if (showEmailLogin) {
    return <SmartLoginView onBack={() => setShowEmailLogin(false)} />;
  }

  const handleGoogleLogin = () => {
    // Navigate to /login/google, which is intercepted by proxy and redirected to the backend Google OAuth endpoint
    router.push("/login/google");
  };

  return (
    <AuthCard
      title="Welcome to Notes"
      description="Choose your preferred sign-in method to continue"
      footer={
        <div className="flex flex-col items-center gap-2 text-xs text-zinc-400">
          <div className="flex items-center gap-1.5 text-zinc-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Protected by Go OAuth2 & Triple-Token IAM</span>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Google Sign In Option */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 flex items-center justify-center gap-3 border-zinc-200/90 bg-white hover:bg-zinc-50 text-zinc-800 font-medium text-sm shadow-sm transition-all hover:border-zinc-300 active:scale-[0.99] cursor-pointer"
          onClick={handleGoogleLogin}
        >
          <GoogleIcon className="w-5 h-5 shrink-0" />
          <span>Continue with Google</span>
        </Button>

        {/* Divider */}
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200/80" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-zinc-400 font-medium tracking-wider">
              Or
            </span>
          </div>
        </div>

        {/* Continue with Email Option */}
        <Button
          type="button"
          className="w-full h-12 flex items-center justify-between px-4 bg-zinc-900 text-white hover:bg-zinc-800 font-medium text-sm shadow-sm transition-all active:scale-[0.99] cursor-pointer"
          onClick={() => setShowEmailLogin(true)}
        >
          <span className="flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-zinc-300" />
            <span>Continue with Email</span>
          </span>
          <ArrowRight className="w-4 h-4 text-zinc-400" />
        </Button>
      </div>
    </AuthCard>
  );
}
