import React from "react";
import Link from "next/link";
import { BookOpenText, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div className="w-full max-w-md mx-auto px-4">
      {/* Brand logo & header */}
      <div className="flex flex-col items-center mb-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-zinc-900 text-white shadow-sm hover:bg-zinc-800 transition-colors mb-4"
        >
          <BookOpenText className="w-4 h-4 text-zinc-300" />
          <span className="font-semibold text-sm tracking-tight">Notes IAM Demo</span>
          <span className="flex items-center gap-1 text-[11px] font-medium bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full border border-zinc-700">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Go Auth
          </span>
        </Link>
      </div>

      <Card className="border-zinc-200/80 shadow-lg shadow-zinc-950/5">
        <CardHeader className="space-y-1.5 pb-4">
          <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900 text-center">
            {title}
          </CardTitle>
          <CardDescription className="text-center text-zinc-500 text-sm">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">{children}</CardContent>
      </Card>

      {footer && <div className="mt-6 text-center text-sm text-zinc-500">{footer}</div>}
    </div>
  );
}
