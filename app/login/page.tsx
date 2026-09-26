import React, { Suspense } from "react";
import { Metadata } from "next";
import { LoginView } from "@/components/auth/login-view";

export const metadata: Metadata = {
  title: "Sign In - Notes IAM Demo",
  description: "Sign in to access your protected notes.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-zinc-50/70">
      <Suspense
        fallback={
          <div className="w-full max-w-md mx-auto h-96 rounded-2xl bg-white border border-zinc-200 animate-pulse" />
        }
      >
        <LoginView />
      </Suspense>
    </div>
  );
}
