"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useFormik } from "formik";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  KeyRound,
} from "lucide-react";
import { authApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { validateWithZod } from "@/lib/zod-formik";
import { forgotPasswordRequestSchema, resetPasswordSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OtpInput } from "@/components/auth/otp-input";
import { AuthCard } from "@/components/auth/auth-card";

export function ForgotPasswordView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);

  // Countdown timer for OTP resend
  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Step 1: Request OTP Formik
  const requestFormik = useFormik({
    initialValues: { email: initialEmail },
    validate: validateWithZod(forgotPasswordRequestSchema),
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setIsSendingOtp(true);
      try {
        await authApi.forgotPassword(values.email);
        setOtpSent(true);
        resetFormik.setFieldValue("email", values.email);
        setCountdown(60);
        toast.success("Password reset code sent to your email!");
      } catch (err: any) {
        setFieldError("email", err.message || "Failed to send reset code");
        toast.error(err.message || "Failed to send reset code");
      } finally {
        setIsSendingOtp(false);
        setSubmitting(false);
      }
    },
  });

  // Step 2: Reset Password Formik
  const resetFormik = useFormik({
    initialValues: {
      email: initialEmail,
      otp: "",
      new_password: "",
      confirm_password: "",
    },
    validate: validateWithZod(resetPasswordSchema),
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        await authApi.resetPassword(values.email, values.otp, values.new_password);
        setResetSuccess(true);
        toast.success("Password reset successfully!");
      } catch (err: any) {
        setStatus(err.message || "Failed to reset password. Check your code.");
        toast.error(err.message || "Reset failed");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <AuthCard
      title={resetSuccess ? "Password Updated" : "Reset your password"}
      description={
        resetSuccess
          ? "Your password has been changed successfully"
          : otpSent
          ? `Enter the 6-digit code sent to ${requestFormik.values.email}`
          : "Enter your email address and we will send you a reset code"
      }
      footer={
        <p>
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-700"
          >
            Back to login
          </Link>
        </p>
      }
    >
      {/* SUCCESS STATE */}
      {resetSuccess ? (
        <div className="space-y-4">
          <Alert variant="success">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Your password has been reset. You can now log in with your new password.
            </AlertDescription>
          </Alert>

          <Button
            type="button"
            className="w-full"
            onClick={() => router.push(`/login?email=${encodeURIComponent(requestFormik.values.email)}`)}
          >
            Go to Sign In
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      ) : !otpSent ? (
        /* STEP 1: REQUEST RESET OTP */
        <form onSubmit={requestFormik.handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoFocus
                className="pl-10"
                value={requestFormik.values.email}
                onChange={requestFormik.handleChange}
                onBlur={requestFormik.handleBlur}
                disabled={requestFormik.isSubmitting}
              />
            </div>
            {requestFormik.touched.email && requestFormik.errors.email && (
              <p className="text-xs text-rose-600 font-medium">
                {requestFormik.errors.email}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={requestFormik.isSubmitting}
          >
            {requestFormik.isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending reset code...
              </>
            ) : (
              <>
                Send Reset Code
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>
      ) : (
        /* STEP 2: VERIFY OTP AND SET NEW PASSWORD */
        <form onSubmit={resetFormik.handleSubmit} className="space-y-4">
          {resetFormik.status && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{resetFormik.status}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label className="block text-center text-xs text-zinc-500">
              6-Digit Reset Code
            </Label>
            <OtpInput
              value={resetFormik.values.otp}
              onChange={(val) => resetFormik.setFieldValue("otp", val)}
              error={resetFormik.touched.otp ? resetFormik.errors.otp : undefined}
              disabled={resetFormik.isSubmitting}
            />
          </div>

          <div className="space-y-2 pt-2">
            <Label htmlFor="new_password">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
              <Input
                id="new_password"
                name="new_password"
                type="password"
                placeholder="At least 6 characters"
                className="pl-10"
                value={resetFormik.values.new_password}
                onChange={resetFormik.handleChange}
                onBlur={resetFormik.handleBlur}
                disabled={resetFormik.isSubmitting}
              />
            </div>
            {resetFormik.touched.new_password && resetFormik.errors.new_password && (
              <p className="text-xs text-rose-600 font-medium">
                {resetFormik.errors.new_password}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm New Password</Label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
              <Input
                id="confirm_password"
                name="confirm_password"
                type="password"
                placeholder="Re-enter password"
                className="pl-10"
                value={resetFormik.values.confirm_password}
                onChange={resetFormik.handleChange}
                onBlur={resetFormik.handleBlur}
                disabled={resetFormik.isSubmitting}
              />
            </div>
            {resetFormik.touched.confirm_password && resetFormik.errors.confirm_password && (
              <p className="text-xs text-rose-600 font-medium">
                {resetFormik.errors.confirm_password}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full mt-2"
            disabled={
              resetFormik.isSubmitting ||
              resetFormik.values.otp.length !== 6 ||
              !resetFormik.values.new_password
            }
          >
            {resetFormik.isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Resetting password...
              </>
            ) : (
              "Save New Password"
            )}
          </Button>

          <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                resetFormik.resetForm();
              }}
              className="hover:text-zinc-900 inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              Change email
            </button>

            {countdown > 0 ? (
              <span>Resend in {countdown}s</span>
            ) : (
              <button
                type="button"
                onClick={() => requestFormik.handleSubmit()}
                disabled={isSendingOtp}
                className="text-zinc-900 font-medium hover:underline inline-flex items-center gap-1"
              >
                <RefreshCw className={cn("w-3 h-3", isSendingOtp && "animate-spin")} />
                Resend code
              </button>
            )}
          </div>
        </form>
      )}
    </AuthCard>
  );
}
