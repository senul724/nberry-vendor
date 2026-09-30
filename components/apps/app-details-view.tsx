"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFormik } from "formik";
import {
	ArrowLeft,
	Calendar,
	CheckCircle2,
	ExternalLink,
	Globe,
	Image as ImageIcon,
	Key,
	Layers,
	Link2,
	Loader2,
	Lock,
	RefreshCw,
	Save,
	Send,
	Shield,
	Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
	appsApi,
	authApi,
	VendorApp,
	AppStats,
	UpdateAppInput,
} from "@/lib/api";
import { updateAppSchema } from "@/lib/schemas";
import { validateWithZod } from "@/lib/zod-formik";
import { useToken } from "@/hooks/use-token";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DashboardNav } from "@/components/apps/dashboard-nav";
import { AppMetricsBar } from "@/components/apps/app-metrics-bar";
import { CallbackDiagnostics } from "@/components/apps/callback-diagnostics";
import { RotateSecretSection } from "@/components/apps/rotate-secret-modal";
import { DeleteAppSection } from "@/components/apps/delete-app-modal";
import { SendNotificationModal } from "@/components/apps/send-notification-modal";

interface AppDetailsViewProps {
	appId: string;
}

export function AppDetailsView({ appId }: AppDetailsViewProps) {
	const router = useRouter();
	const { getValidAccessToken, setAccessToken } = useToken();

	const [app, setApp] = useState<VendorApp | null>(null);
	const [stats, setStats] = useState<AppStats | null>(null);
	const [isLoadingApp, setIsLoadingApp] = useState<boolean>(true);
	const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);
	const [logoError, setLogoError] = useState(false);
	const [isSendNotificationOpen, setIsSendNotificationOpen] = useState(false);

	// Form for Edit Settings
	const formik = useFormik<UpdateAppInput>({
		initialValues: {
			name: "",
			description: "",
			logo: "",
			unicast_callback_url: "",
		},
		validate: validateWithZod(updateAppSchema),
		validateOnBlur: true,
		validateOnChange: false,
		onSubmit: async (values, { setSubmitting, resetForm }) => {
			try {
				const token = await getValidAccessToken();
				if (!token) {
					toast.error("Authentication required to update app");
					return;
				}

				const payload: UpdateAppInput = {
					name: values.name.trim(),
					description: values.description?.trim() || undefined,
					logo: values.logo?.trim() || undefined,
					unicast_callback_url:
						values.unicast_callback_url?.trim() || undefined,
				};

				const res = await appsApi.update(appId, payload, token);
				setApp(res.app);
				resetForm({
					values: {
						name: res.app.name,
						description: res.app.description || "",
						logo: res.app.logo || "",
						unicast_callback_url: res.app.unicast_callback_url || "",
					},
				});
				toast.success("App settings updated successfully!");
			} catch (err: any) {
				toast.error(err.message || "Failed to update app settings");
			} finally {
				setSubmitting(false);
			}
		},
	});

	// Fetch App Data
	const fetchAppData = useCallback(async () => {
		setIsLoadingApp(true);
		try {
			const token = await getValidAccessToken();
			if (!token) {
				toast.error("Fetch Failed: No access token");
				return;
			}

			const res = await appsApi.getById(appId, token);
			setApp(res.app);
			formik.resetForm({
				values: {
					name: res.app.name || "",
					description: res.app.description || "",
					logo: res.app.logo || "",
					unicast_callback_url: res.app.unicast_callback_url || "",
				},
			});
		} catch (err: any) {
			console.error("Failed to load app:", err);
			// Attempt silent refresh
			try {
				const refreshRes = await authApi.refresh();
				if (refreshRes.access_token) {
					setAccessToken(refreshRes.access_token);
					const res = await appsApi.getById(appId, refreshRes.access_token);
					setApp(res.app);
					formik.resetForm({
						values: {
							name: res.app.name || "",
							description: res.app.description || "",
							logo: res.app.logo || "",
							unicast_callback_url: res.app.unicast_callback_url || "",
						},
					});
					return;
				}
			} catch {
				router.push("/login");
			}
			toast.error(err.message || "Failed to load application details");
		} finally {
			setIsLoadingApp(false);
		}
	}, [appId, getValidAccessToken, setAccessToken, router]);

	// Fetch Stats Data
	const fetchStats = useCallback(async () => {
		setIsLoadingStats(true);
		try {
			const token = await getValidAccessToken();
			if (!token) return;

			const data = await appsApi.getStats(appId, token);
			setStats(data);
		} catch (err: any) {
			console.error("Failed to fetch stats:", err);
			// Stats may not yet have data or route, fallback silently
			setStats({
				broadcast_subscribers_count: 0,
				unicast_subscribers_count: 0,
				total_broadcast_memos_sent: 0,
				total_direct_memos_sent: 0,
			});
		} finally {
			setIsLoadingStats(false);
		}
	}, [appId, getValidAccessToken]);

	useEffect(() => {
		fetchAppData();
		fetchStats();
	}, [fetchAppData, fetchStats]);

	const initials = app?.name
		? app.name
				.split(" ")
				.slice(0, 2)
				.map((w) => w[0])
				.join("")
				.toUpperCase()
		: "AP";

	const createdDate = app?.created_at || app?.createdAt;
	const formattedDate = createdDate
		? new Date(createdDate).toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric",
			})
		: "";

	return (
		<div className="min-h-screen bg-[#fafafa] flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
			{/* Navigation */}
			<DashboardNav
				breadcrumbs={[
					{ label: "Applications", href: "/dashboard/apps" },
					{ label: app?.name || "App Details" },
				]}
			/>

			<main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
				{/* Back Link & Header */}
				<div className="space-y-4">
					<Link
						href="/dashboard/apps"
						className="inline-flex items-center text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors gap-1"
					>
						<ArrowLeft className="w-3.5 h-3.5" />
						Back to Applications
					</Link>

					{isLoadingApp ? (
						<div className="h-16 w-1/3 bg-zinc-200/80 rounded-xl animate-pulse" />
					) : (
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80">
							<div className="flex items-center gap-4">
								{/* Logo / Fallback */}
								<div className="relative shrink-0">
									{app?.logo && !logoError ? (
										<img
											src={app.logo}
											alt={app.name}
											onError={() => setLogoError(true)}
											className="w-14 h-14 rounded-2xl object-cover border border-zinc-200 bg-white shadow-2xs"
										/>
									) : (
										<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-950 text-white flex items-center justify-center font-bold text-lg shadow-xs ring-1 ring-zinc-700/60">
											{initials}
										</div>
									)}
								</div>

								<div className="space-y-1">
									<div className="flex flex-wrap items-center gap-2.5">
										<h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
											{app?.name}
										</h1>
										{app?.unicast_callback_url ? (
											<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
												<CheckCircle2 className="w-3 h-3 text-emerald-600" />
												Webhook Active
											</span>
										) : (
											<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-500 border border-zinc-200">
												Webhook Not Set
											</span>
										)}
									</div>
									<div className="flex items-center gap-3 text-xs text-zinc-400">
										<span className="font-mono text-zinc-500">
											ID: {app?.id}
										</span>
										{formattedDate && (
											<span className="flex items-center gap-1">
												&bull; Created {formattedDate}
											</span>
										)}
									</div>
								</div>
							</div>

							{/* Action Buttons */}
							<div className="flex items-center gap-2.5 self-start md:self-center">
								<Button
									type="button"
									onClick={() => setIsSendNotificationOpen(true)}
									className="h-10 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl shadow-xs text-xs font-semibold"
								>
									<Send className="w-3.5 h-3.5 mr-1.5" />
									Send Notification
								</Button>
							</div>
						</div>
					)}
				</div>

				{/* 1. Metrics Overview Bar */}
				<AppMetricsBar
					stats={stats}
					loading={isLoadingStats}
					onRefresh={fetchStats}
				/>

				{/* 2. Edit Settings Form & Callback Diagnostics */}
				<div className="rounded-2xl border border-zinc-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-6">
					<div className="pb-4 border-b border-zinc-100 flex items-center justify-between">
						<div>
							<h2 className="text-lg font-bold text-zinc-900">
								Application Settings
							</h2>
							<p className="text-xs text-zinc-500 mt-0.5">
								Update your app profile, display details, and unicast webhook
								endpoint.
							</p>
						</div>
						{formik.dirty && (
							<span className="text-xs text-amber-600 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
								Unsaved changes
							</span>
						)}
					</div>

					<form onSubmit={formik.handleSubmit} className="space-y-5">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
							{/* App Name */}
							<div className="space-y-1.5">
								<Label
									htmlFor="name"
									className="text-xs font-semibold text-zinc-800"
								>
									App Name <span className="text-rose-500">*</span>
								</Label>
								<Input
									id="name"
									name="name"
									type="text"
									placeholder="App name"
									value={formik.values.name}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									disabled={formik.isSubmitting || isLoadingApp}
									className={
										formik.touched.name && formik.errors.name
											? "border-rose-400"
											: ""
									}
								/>
								{formik.touched.name && formik.errors.name && (
									<p className="text-xs text-rose-500 font-medium">
										{formik.errors.name}
									</p>
								)}
							</div>

							{/* Logo URL */}
							<div className="space-y-1.5">
								<Label
									htmlFor="logo"
									className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5"
								>
									<ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
									Logo URL{" "}
									<span className="text-zinc-400 font-normal">(Optional)</span>
								</Label>
								<Input
									id="logo"
									name="logo"
									type="url"
									placeholder="https://example.com/logo.png"
									value={formik.values.logo}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									disabled={formik.isSubmitting || isLoadingApp}
									className={
										formik.touched.logo && formik.errors.logo
											? "border-rose-400"
											: ""
									}
								/>
								{formik.touched.logo && formik.errors.logo && (
									<p className="text-xs text-rose-500 font-medium">
										{formik.errors.logo}
									</p>
								)}
							</div>
						</div>

						{/* Description */}
						<div className="space-y-1.5">
							<Label
								htmlFor="description"
								className="text-xs font-semibold text-zinc-800"
							>
								Description{" "}
								<span className="text-zinc-400 font-normal">(Optional)</span>
							</Label>
							<Textarea
								id="description"
								name="description"
								placeholder="Describe your application..."
								value={formik.values.description}
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								disabled={formik.isSubmitting || isLoadingApp}
								className="min-h-[85px] text-sm"
							/>
							{formik.touched.description && formik.errors.description && (
								<p className="text-xs text-rose-500 font-medium">
									{formik.errors.description}
								</p>
							)}
						</div>

						{/* Unicast Callback URL with Diagnostics */}
						<div className="space-y-3 pt-2 border-t border-zinc-100">
							<div className="space-y-1.5">
								<div className="flex items-center justify-between">
									<Label
										htmlFor="unicast_callback_url"
										className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5"
									>
										<Link2 className="w-3.5 h-3.5 text-zinc-400" />
										Unicast Callback URL{" "}
										<span className="text-zinc-400 font-normal">
											(HTTPS Webhook)
										</span>
									</Label>
								</div>
								<Input
									id="unicast_callback_url"
									name="unicast_callback_url"
									type="url"
									placeholder="https://api.yourdomain.com/webhooks/notifyberry"
									value={formik.values.unicast_callback_url}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									disabled={formik.isSubmitting || isLoadingApp}
									className={
										formik.touched.unicast_callback_url &&
										formik.errors.unicast_callback_url
											? "border-rose-400"
											: ""
									}
								/>
								<p className="text-[11px] text-zinc-500">
									Notify Berry delivers direct unicast messages and subscriber
									events to this HTTPS endpoint.
								</p>
								{formik.touched.unicast_callback_url &&
									formik.errors.unicast_callback_url && (
										<p className="text-xs text-rose-500 font-medium">
											{formik.errors.unicast_callback_url}
										</p>
									)}
							</div>

							{/* Callback URL Diagnostics Section */}
							<div className="pt-1">
								<CallbackDiagnostics
									appId={appId}
									callbackUrl={
										app?.unicast_callback_url ||
										formik.values.unicast_callback_url
									}
									disabled={formik.isSubmitting}
								/>
							</div>
						</div>

						{/* Save Button */}
						<div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-3">
							{formik.dirty && (
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => formik.resetForm()}
									disabled={formik.isSubmitting}
									className="rounded-xl text-xs"
								>
									Discard Changes
								</Button>
							)}
							<Button
								type="submit"
								disabled={formik.isSubmitting || !formik.dirty}
								className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl shadow-xs text-xs font-semibold h-10 px-5 min-w-[120px]"
							>
								{formik.isSubmitting ? (
									<>
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
										Saving...
									</>
								) : (
									<>
										<Save className="w-3.5 h-3.5 mr-1.5" />
										Save Settings
									</>
								)}
							</Button>
						</div>
					</form>
				</div>

				{/* 3. Security & Secret Rotation Section */}
				{app && <RotateSecretSection app={app} />}

				{/* 4. Danger Zone */}
				{app && <DeleteAppSection app={app} />}
			</main>

			{/* Send Notification Modal */}
			{app && (
				<SendNotificationModal
					open={isSendNotificationOpen}
					onOpenChange={setIsSendNotificationOpen}
					app={app}
				/>
			)}
		</div>
	);
}
