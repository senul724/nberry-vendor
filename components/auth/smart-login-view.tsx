"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useFormik } from "formik";
import { toast } from "sonner";
import {
	Mail,
	Lock,
	User as UserIcon,
	ArrowRight,
	ArrowLeft,
	Sparkles,
	Loader2,
	AlertCircle,
	CheckCircle2,
	RefreshCw,
} from "lucide-react";
import { authApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { validateWithZod } from "@/lib/zod-formik";
import {
	emailSchema,
	passwordLoginSchema,
	otpLoginSchema,
	registerSchema,
} from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OtpInput } from "@/components/auth/otp-input";
import { AuthCard } from "@/components/auth/auth-card";
import { useToken } from "@/hooks/use-token";

type AuthStep =
	| "EMAIL_INPUT"
	| "REGISTER_INPUT"
	| "CHOOSE_AUTH_METHOD"
	| "PASSWORD_LOGIN"
	| "OTP_LOGIN";
interface SmartLoginViewProps {
	onBack?: () => void;
}

export function SmartLoginView({ onBack }: SmartLoginViewProps = {}) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const initialEmail = searchParams.get("email") || "";

	const { setAccessToken } = useToken();

	const [step, setStep] = useState<AuthStep>("EMAIL_INPUT");
	const [checkedEmail, setCheckedEmail] = useState<string>(initialEmail);
	const [hasPassword, setHasPassword] = useState<boolean>(false);
	const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
	const [otpSentMessage, setOtpSentMessage] = useState<string | null>(null);
	const [countdown, setCountdown] = useState<number>(0);

	// Countdown timer for OTP resend
	useEffect(() => {
		if (countdown > 0) {
			const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
			return () => clearTimeout(timer);
		}
	}, [countdown]);

	// Helper to send OTP and start countdown
	const triggerSendOtp = async (email: string, targetStep?: AuthStep) => {
		setIsSendingOtp(true);
		try {
			const msg = await authApi.sendLoginOtp(email);
			setOtpSentMessage(msg.message || `We sent a 6-digit code to ${email}`);
			toast.success("Verification code sent to your email!");
			setCountdown(60);
			if (targetStep) {
				setStep(targetStep);
			}
		} catch (err: any) {
			toast.error(err.message || "Failed to send verification code");
			throw err;
		} finally {
			setIsSendingOtp(false);
		}
	};

	// 1. Email Step Formik
	const emailFormik = useFormik({
		initialValues: { email: initialEmail },
		validate: validateWithZod(emailSchema),
		onSubmit: async (values, { setSubmitting, setFieldError }) => {
			try {
				const check = await authApi.checkEmail(values.email);
				setCheckedEmail(values.email);
				setHasPassword(check.password_available);

				if (!check.user_available) {
					// USER NOT REGISTERED: Send OTP directly and prompt for name + OTP to register
					await triggerSendOtp(values.email);
					registerFormik.setFieldValue("email", values.email);
					setStep("REGISTER_INPUT");
				} else if (check.password_available) {
					// USER REGISTERED & HAS PASSWORD: Ask if they want password or OTP login
					setStep("CHOOSE_AUTH_METHOD");
				} else {
					// USER REGISTERED & NO PASSWORD: Send OTP directly and ask for OTP to login
					await triggerSendOtp(values.email, "OTP_LOGIN");
					otpFormik.setFieldValue("email", values.email);
				}
			} catch (err: any) {
				setFieldError("email", err.message || "Unable to check email");
				toast.error(err.message || "Error checking email");
			} finally {
				setSubmitting(false);
			}
		},
	});

	// 2. New User Registration Formik (Name + OTP)
	const registerFormik = useFormik({
		initialValues: {
			name: "",
			email: checkedEmail,
			otp: "",
		},
		enableReinitialize: true,
		validate: validateWithZod(registerSchema),
		onSubmit: async (values, { setSubmitting, setStatus }) => {
			try {
				const res = await authApi.register(
					values.name,
					values.email,
					values.otp,
				);
				setAccessToken(res.access_token);
				toast.success("Account created successfully!");
				router.push("/dashboard");
			} catch (err: any) {
				setStatus(
					err.message || "Registration failed. Invalid or expired OTP.",
				);
				toast.error(err.message || "Registration failed");
			} finally {
				setSubmitting(false);
			}
		},
	});

	// 3. Password Login Formik
	const passwordFormik = useFormik({
		initialValues: { email: checkedEmail, password: "" },
		enableReinitialize: true,
		validate: validateWithZod(passwordLoginSchema),
		onSubmit: async (values, { setSubmitting, setStatus }) => {
			try {
				const res = await authApi.loginWithPassword(
					values.email,
					values.password,
				);
				setAccessToken(res.access_token);
				toast.success("Logged in successfully!");
				router.push("/dashboard");
			} catch (err: any) {
				setStatus(err.message || "Invalid password");
				toast.error(err.message || "Authentication failed");
			} finally {
				setSubmitting(false);
			}
		},
	});

	// 4. OTP Login Formik
	const otpFormik = useFormik({
		initialValues: { email: checkedEmail, otp: "" },
		enableReinitialize: true,
		validate: validateWithZod(otpLoginSchema),
		onSubmit: async (values, { setSubmitting, setStatus }) => {
			try {
				const res = await authApi.loginWithOtp(values.email, values.otp);
				setAccessToken(res.access_token);
				toast.success("Logged in successfully!");
				router.push("/dashboard");
			} catch (err: any) {
				setStatus(err.message || "Invalid or expired OTP");
				toast.error(err.message || "OTP verification failed");
			} finally {
				setSubmitting(false);
			}
		},
	});

	const handleBackToEmail = () => {
		setStep("EMAIL_INPUT");
		registerFormik.resetForm();
		passwordFormik.resetForm();
		otpFormik.resetForm();
		setOtpSentMessage(null);
	};

	return (
		<AuthCard
			title={
				step === "EMAIL_INPUT"
					? "Welcome"
					: step === "REGISTER_INPUT"
						? "Create Your Account"
						: step === "CHOOSE_AUTH_METHOD"
							? "Choose Sign In Method"
							: step === "OTP_LOGIN"
								? "Enter One-Time Code"
								: "Enter Your Password"
			}
			description={
				step === "EMAIL_INPUT"
					? "Enter your email address to continue"
					: step === "REGISTER_INPUT"
						? `We sent a code to ${checkedEmail}. Enter your name and the code to complete registration.`
						: step === "CHOOSE_AUTH_METHOD"
							? `Welcome back! How would you like to sign in as ${checkedEmail}?`
							: step === "OTP_LOGIN"
								? `We sent a 6-digit code to ${checkedEmail}`
								: `Signing in as ${checkedEmail}`
			}
			footer={
				step !== "EMAIL_INPUT" ? (
					<button
						type="button"
						onClick={handleBackToEmail}
						className="inline-flex items-center justify-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 transition-colors py-1 cursor-pointer"
					>
						<ArrowLeft className="w-3.5 h-3.5" />
						Use a different email address
					</button>
				) : onBack ? (
					<button
						type="button"
						onClick={onBack}
						className="inline-flex items-center justify-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 transition-colors py-1 cursor-pointer"
					>
						<ArrowLeft className="w-3.5 h-3.5" />
						Back to sign in options
					</button>
				) : undefined
			}
		>
			{/* STEP 1: EMAIL INPUT */}
			{step === "EMAIL_INPUT" && (
				<form onSubmit={emailFormik.handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="email">Email address</Label>
						<div className="relative">
							<Mail className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
							<Input
								id="email"
								name="email"
								type="email"
								placeholder="you@example.com"
								autoComplete="email"
								autoFocus
								className="pl-10"
								value={emailFormik.values.email}
								onChange={emailFormik.handleChange}
								onBlur={emailFormik.handleBlur}
								disabled={emailFormik.isSubmitting}
							/>
						</div>
						{emailFormik.touched.email && emailFormik.errors.email && (
							<p className="text-xs text-rose-600 font-medium">
								{emailFormik.errors.email}
							</p>
						)}
					</div>

					<Button
						type="submit"
						className="w-full"
						disabled={emailFormik.isSubmitting}
					>
						{emailFormik.isSubmitting ? (
							<>
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								Checking account...
							</>
						) : (
							<>
								Continue
								<ArrowRight className="w-4 h-4 ml-2" />
							</>
						)}
					</Button>
				</form>
			)}

			{/* STEP 2: NOT REGISTERED -> NAME + OTP REGISTRATION */}
			{step === "REGISTER_INPUT" && (
				<form onSubmit={registerFormik.handleSubmit} className="space-y-4">
					{otpSentMessage && (
						<Alert variant="success">
							<CheckCircle2 className="h-4 w-4" />
							<AlertDescription>{otpSentMessage}</AlertDescription>
						</Alert>
					)}

					{registerFormik.status && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{registerFormik.status}</AlertDescription>
						</Alert>
					)}

					<div className="space-y-2">
						<Label htmlFor="name">Your Full Name</Label>
						<div className="relative">
							<UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
							<Input
								id="name"
								name="name"
								type="text"
								placeholder="e.g. Senul"
								autoFocus
								className="pl-10"
								value={registerFormik.values.name}
								onChange={registerFormik.handleChange}
								onBlur={registerFormik.handleBlur}
								disabled={registerFormik.isSubmitting}
							/>
						</div>
						{registerFormik.touched.name && registerFormik.errors.name && (
							<p className="text-xs text-rose-600 font-medium">
								{registerFormik.errors.name}
							</p>
						)}
					</div>

					<div className="space-y-2 pt-1">
						<Label className="block text-center text-xs text-zinc-500">
							6-Digit Verification Code
						</Label>
						<OtpInput
							value={registerFormik.values.otp}
							onChange={(val) => registerFormik.setFieldValue("otp", val)}
							error={
								registerFormik.touched.otp
									? registerFormik.errors.otp
									: undefined
							}
							disabled={registerFormik.isSubmitting}
						/>
					</div>

					<Button
						type="submit"
						className="w-full mt-2"
						disabled={
							registerFormik.isSubmitting ||
							registerFormik.values.otp.length !== 6 ||
							!registerFormik.values.name.trim()
						}
					>
						{registerFormik.isSubmitting ? (
							<>
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								Registering...
							</>
						) : (
							"Complete Registration"
						)}
					</Button>

					<div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
						{countdown > 0 ? (
							<span>Resend code in {countdown}s</span>
						) : (
							<button
								type="button"
								onClick={() => triggerSendOtp(checkedEmail)}
								disabled={isSendingOtp}
								className="text-zinc-900 font-medium hover:underline inline-flex items-center gap-1"
							>
								<RefreshCw
									className={cn("w-3 h-3", isSendingOtp && "animate-spin")}
								/>
								Resend code
							</button>
						)}
					</div>
				</form>
			)}

			{/* STEP 3: REGISTERED & PASSWORD SET -> CHOOSE METHOD */}
			{step === "CHOOSE_AUTH_METHOD" && (
				<div className="space-y-3">
					<p className="text-xs text-zinc-500 mb-2">
						Password is set for this account. Choose how you want to proceed:
					</p>

					<Button
						type="button"
						variant="default"
						className="w-full justify-between h-12 px-4"
						onClick={() => setStep("PASSWORD_LOGIN")}
					>
						<span className="flex items-center gap-2">
							<Lock className="w-4 h-4 text-zinc-400" />
							<span>Continue with Password</span>
						</span>
						<ArrowRight className="w-4 h-4 text-zinc-400" />
					</Button>

					<Button
						type="button"
						variant="outline"
						className="w-full justify-between h-12 px-4"
						disabled={isSendingOtp}
						onClick={() => triggerSendOtp(checkedEmail, "OTP_LOGIN")}
					>
						<span className="flex items-center gap-2">
							<Sparkles className="w-4 h-4 text-amber-500" />
							<span>Send One-Time Code (OTP)</span>
						</span>
						{isSendingOtp ? (
							<Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
						) : (
							<ArrowRight className="w-4 h-4 text-zinc-400" />
						)}
					</Button>
				</div>
			)}

			{/* STEP 4: PASSWORD LOGIN */}
			{step === "PASSWORD_LOGIN" && (
				<form onSubmit={passwordFormik.handleSubmit} className="space-y-4">
					{passwordFormik.status && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{passwordFormik.status}</AlertDescription>
						</Alert>
					)}

					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="password">Password</Label>
							<Link
								href={`/forgot-password?email=${encodeURIComponent(checkedEmail)}`}
								className="text-xs text-zinc-500 hover:text-zinc-900 underline underline-offset-2"
							>
								Forgot password?
							</Link>
						</div>
						<div className="relative">
							<Lock className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
							<Input
								id="password"
								name="password"
								type="password"
								placeholder="••••••••"
								autoFocus
								className="pl-10"
								value={passwordFormik.values.password}
								onChange={passwordFormik.handleChange}
								onBlur={passwordFormik.handleBlur}
								disabled={passwordFormik.isSubmitting}
							/>
						</div>
						{passwordFormik.touched.password &&
							passwordFormik.errors.password && (
								<p className="text-xs text-rose-600 font-medium">
									{passwordFormik.errors.password}
								</p>
							)}
					</div>

					<Button
						type="submit"
						className="w-full"
						disabled={passwordFormik.isSubmitting}
					>
						{passwordFormik.isSubmitting ? (
							<>
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								Signing in...
							</>
						) : (
							"Sign In with Password"
						)}
					</Button>

					<div className="pt-2 text-center">
						<button
							type="button"
							onClick={() => triggerSendOtp(checkedEmail, "OTP_LOGIN")}
							disabled={isSendingOtp}
							className="text-xs text-zinc-600 hover:text-zinc-900 inline-flex items-center gap-1.5"
						>
							<Sparkles className="w-3.5 h-3.5 text-amber-500" />
							Or sign in with a single-use code instead
						</button>
					</div>
				</form>
			)}

			{/* STEP 5: OTP LOGIN (For users without password or choosing OTP) */}
			{step === "OTP_LOGIN" && (
				<form onSubmit={otpFormik.handleSubmit} className="space-y-4">
					{otpSentMessage && (
						<Alert variant="success">
							<CheckCircle2 className="h-4 w-4" />
							<AlertDescription>{otpSentMessage}</AlertDescription>
						</Alert>
					)}

					{otpFormik.status && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{otpFormik.status}</AlertDescription>
						</Alert>
					)}

					<div className="space-y-3">
						<Label className="block text-center text-xs text-zinc-500">
							Enter the 6-digit code
						</Label>
						<OtpInput
							value={otpFormik.values.otp}
							onChange={(val) => otpFormik.setFieldValue("otp", val)}
							error={otpFormik.touched.otp ? otpFormik.errors.otp : undefined}
							disabled={otpFormik.isSubmitting}
						/>
					</div>

					<Button
						type="submit"
						className="w-full mt-2"
						disabled={
							otpFormik.isSubmitting || otpFormik.values.otp.length !== 6
						}
					>
						{otpFormik.isSubmitting ? (
							<>
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								Verifying code...
							</>
						) : (
							"Verify & Sign In"
						)}
					</Button>

					<div className="flex items-center justify-between pt-2 text-xs text-zinc-500">
						{countdown > 0 ? (
							<span>Resend code in {countdown}s</span>
						) : (
							<button
								type="button"
								onClick={() => triggerSendOtp(checkedEmail)}
								disabled={isSendingOtp}
								className="text-zinc-900 font-medium hover:underline inline-flex items-center gap-1"
							>
								<RefreshCw
									className={cn("w-3 h-3", isSendingOtp && "animate-spin")}
								/>
								Resend code
							</button>
						)}

						{hasPassword && (
							<button
								type="button"
								onClick={() => setStep("PASSWORD_LOGIN")}
								className="hover:text-zinc-900 underline"
							>
								Use password instead
							</button>
						)}
					</div>
				</form>
			)}
		</AuthCard>
	);
}
