import { Suspense } from "react";
import { Metadata } from "next";
import { ForgotPasswordView } from "@/components/auth/forgot-password-view";

export const metadata: Metadata = {
	title: "Reset Password - Notes IAM Demo",
	description: "Reset your account password with email OTP verification.",
};

export default function ForgotPasswordPage() {
	return (
		<div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-zinc-50/70">
			<Suspense
				fallback={
					<div className="w-full max-w-md mx-auto h-96 rounded-2xl bg-white border border-zinc-200 animate-pulse" />
				}
			>
				<ForgotPasswordView />
			</Suspense>
		</div>
	);
}
