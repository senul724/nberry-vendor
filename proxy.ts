import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { env } from "./env";

export function proxy(request: NextRequest) {
	const sessionToken = request.cookies.get("session_token")?.value;
	const { pathname } = request.nextUrl;

	// Redirect /login/google directly to the backend Google OAuth flow
	if (pathname === "/login/google" || pathname === "/login/google/") {
		const targetUrl = new URL(`${env.NEXT_PUBLIC_API_URL}/auth/google/login`);
		if (request.nextUrl.search) {
			targetUrl.search = request.nextUrl.search;
		}
		return NextResponse.redirect(targetUrl);
	}

	const isDashboardRoute = pathname.startsWith("/dashboard");

	// Protect /dashboard - unauthenticated users are redirected to /login
	if (isDashboardRoute && !sessionToken) {
		const loginUrl = new URL("/login", request.url);
		return NextResponse.redirect(loginUrl);
	}

	// Redirect authenticated users visiting /login to /dashboard
	if (pathname === "/login" && sessionToken) {
		const dashboardUrl = new URL("/dashboard", request.url);
		return NextResponse.redirect(dashboardUrl);
	}

	// Root path redirect
	if (pathname === "/") {
		if (sessionToken) {
			return NextResponse.redirect(new URL("/dashboard", request.url));
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/",
		"/dashboard/:path*",
		"/login",
		"/login/:path*",
		"/register",
		"/forgot-password",
	],
};
