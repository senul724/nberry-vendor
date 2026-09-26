import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { env } from "@/env";

export function GET(request: NextRequest) {
  const targetUrl = new URL(`${env.NEXT_PUBLIC_API_URL}/auth/google/login`);
  if (request.nextUrl.search) {
    targetUrl.search = request.nextUrl.search;
  }
  return NextResponse.redirect(targetUrl);
}
