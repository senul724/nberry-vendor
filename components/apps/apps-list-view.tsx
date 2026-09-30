"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
	Plus,
	Search,
	RefreshCw,
	LayoutGrid,
	List as ListIcon,
	X,
	Layers,
} from "lucide-react";
import { toast } from "sonner";
import { appsApi, authApi, VendorApp } from "@/lib/api";
import { useToken } from "@/hooks/use-token";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppCard } from "@/components/apps/app-card";
import { CreateAppDialog } from "@/components/apps/create-app-dialog";
import { SendNotificationModal } from "@/components/apps/send-notification-modal";
import { DashboardNav } from "@/components/apps/dashboard-nav";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "list";

export function AppsListView() {
	const router = useRouter();
	const { getValidAccessToken, setAccessToken } = useToken();

	const [apps, setApps] = useState<VendorApp[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [viewMode, setViewMode] = useState<ViewMode>("grid");

	// Modals
	const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
	const [selectedAppForNotification, setSelectedAppForNotification] =
		useState<VendorApp | null>(null);

	const fetchApps = useCallback(async () => {
		setIsLoading(true);
		try {
			const token = await getValidAccessToken();
			if (!token) {
				toast.error("Fetch failed:No token");
				return;
			}

			const data = await appsApi.getAll(token);
			setApps(data.apps || []);
		} catch (err: any) {
			console.error("Failed to load apps:", err);
			// Attempt refresh if 401
			try {
				const refreshRes = await authApi.refresh();
				if (refreshRes.access_token) {
					setAccessToken(refreshRes.access_token);
					const data = await appsApi.getAll(refreshRes.access_token);
					setApps(data.apps || []);
					return;
				}
			} catch {
				toast.error(err.message || "Failed to load vendor applications");
			}
		} finally {
			setIsLoading(false);
		}
	}, [getValidAccessToken, setAccessToken, router]);

	useEffect(() => {
		fetchApps();
	}, [fetchApps]);

	const handleAppCreated = (newApp: VendorApp) => {
		setApps((prev) => [newApp, ...prev.filter((a) => a.id !== newApp.id)]);
	};

	const filteredApps = useMemo(() => {
		const q = searchQuery.trim().toLowerCase();
		if (!q) return apps;
		return apps.filter(
			(app) =>
				app.name?.toLowerCase().includes(q) ||
				app.description?.toLowerCase().includes(q) ||
				app.unicast_callback_url?.toLowerCase().includes(q),
		);
	}, [apps, searchQuery]);

	return (
		<div className="min-h-screen bg-[#fafafa] flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
			{/* Navigation */}
			<DashboardNav />

			{/* Main Content */}
			<main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
				{/* Page Header */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200/70">
					<div>
						<h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
							Vendor Applications
						</h1>
						<p className="text-sm text-zinc-500 mt-1">
							Configure endpoints, manage secrets, and send push notification
							memos to your subscribers.
						</p>
					</div>

					{/* Primary CTA */}
					<Button
						type="button"
						size="default"
						onClick={() => setIsCreateOpen(true)}
						className="h-10 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] self-start sm:self-auto"
					>
						<Plus className="w-4 h-4 mr-1.5" />
						<span className="font-semibold text-xs sm:text-sm">
							Create New App
						</span>
					</Button>
				</div>

				{/* Toolbar: Search, View Mode, Refresh */}
				<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
					{/* Search */}
					<div className="relative flex-1 max-w-md">
						<Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400 pointer-events-none" />
						<Input
							type="text"
							placeholder="Search apps by name, description, webhook..."
							className="pl-10 pr-9 h-10 bg-white border-zinc-200/90 shadow-2xs rounded-xl"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
						{searchQuery && (
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 p-0.5 rounded-md"
							>
								<X className="w-3.5 h-3.5" />
							</button>
						)}
					</div>

					<div className="flex items-center justify-between sm:justify-end gap-2.5">
						{/* View Mode Toggle */}
						<div className="flex items-center p-1 bg-zinc-100 rounded-xl border border-zinc-200/70 shadow-2xs">
							<button
								type="button"
								onClick={() => setViewMode("grid")}
								title="Grid View"
								className={cn(
									"p-1.5 rounded-lg transition-all cursor-pointer",
									viewMode === "grid"
										? "bg-white text-zinc-900 shadow-xs"
										: "text-zinc-500 hover:text-zinc-900",
								)}
							>
								<LayoutGrid className="w-4 h-4" />
							</button>
							<button
								type="button"
								onClick={() => setViewMode("list")}
								title="List View"
								className={cn(
									"p-1.5 rounded-lg transition-all cursor-pointer",
									viewMode === "list"
										? "bg-white text-zinc-900 shadow-xs"
										: "text-zinc-500 hover:text-zinc-900",
								)}
							>
								<ListIcon className="w-4 h-4" />
							</button>
						</div>

						{/* Refresh */}
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={fetchApps}
							disabled={isLoading}
							title="Refresh apps"
							className="h-10 px-3 bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-2xs rounded-xl"
						>
							<RefreshCw
								className={cn("w-4 h-4", isLoading && "animate-spin")}
							/>
							<span className="sr-only">Refresh</span>
						</Button>
					</div>
				</div>

				{/* Filter Info */}
				{searchQuery && (
					<div className="flex items-center justify-between text-xs text-zinc-500 bg-zinc-100/70 px-4 py-2 rounded-xl border border-zinc-200/60">
						<span>
							Found <strong>{filteredApps.length}</strong>{" "}
							{filteredApps.length === 1 ? "app" : "apps"} matching &ldquo;
							<strong>{searchQuery}</strong>&rdquo;
						</span>
						<button
							type="button"
							onClick={() => setSearchQuery("")}
							className="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
						>
							Clear filter
						</button>
					</div>
				)}

				{/* Apps Grid / List or Empty State */}
				{isLoading ? (
					/* Skeletons */
					<div
						className={cn(
							viewMode === "grid"
								? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
								: "flex flex-col gap-3",
						)}
					>
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<div
								key={i}
								className="h-56 rounded-2xl border border-zinc-200/80 bg-white p-6 space-y-4 animate-pulse shadow-2xs"
							>
								<div className="flex items-center justify-between">
									<div className="w-12 h-12 bg-zinc-200 rounded-xl" />
									<div className="w-20 h-5 bg-zinc-200 rounded-full" />
								</div>
								<div className="space-y-2">
									<div className="h-5 w-2/3 bg-zinc-200 rounded" />
									<div className="h-3 w-full bg-zinc-100 rounded" />
									<div className="h-3 w-4/5 bg-zinc-100 rounded" />
								</div>
								<div className="pt-4 flex gap-2">
									<div className="h-9 flex-1 bg-zinc-100 rounded-xl" />
									<div className="h-9 flex-1 bg-zinc-200 rounded-xl" />
								</div>
							</div>
						))}
					</div>
				) : filteredApps.length > 0 ? (
					/* Display Apps */
					<div
						className={cn(
							viewMode === "grid"
								? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
								: "flex flex-col gap-3",
						)}
					>
						{filteredApps.map((app) => (
							<AppCard
								key={app.id}
								app={app}
								viewMode={viewMode}
								onSendNotification={(app) => setSelectedAppForNotification(app)}
							/>
						))}
					</div>
				) : (
					/* Empty State */
					<div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border border-dashed border-zinc-200 bg-white shadow-2xs">
						<div className="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-200/80 text-zinc-400 flex items-center justify-center mb-4">
							<Layers className="w-8 h-8 text-zinc-400" />
						</div>

						<h3 className="text-lg font-bold text-zinc-900 mb-1">
							{searchQuery
								? "No applications found"
								: "No vendor applications yet"}
						</h3>

						<p className="text-sm text-zinc-500 max-w-sm mb-6 leading-relaxed">
							{searchQuery
								? `No apps match "${searchQuery}". Try searching with a different name or keyword.`
								: "Create your first vendor application to get an API secret key, configure webhooks, and start broadcasting push notifications."}
						</p>

						{searchQuery ? (
							<Button
								variant="outline"
								size="sm"
								onClick={() => setSearchQuery("")}
								className="rounded-xl"
							>
								Clear Search Query
							</Button>
						) : (
							<Button
								size="default"
								onClick={() => setIsCreateOpen(true)}
								className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl shadow-md px-5"
							>
								<Plus className="w-4 h-4 mr-1.5" />
								Create First App
							</Button>
						)}
					</div>
				)}
			</main>

			{/* Create App Dialog */}
			<CreateAppDialog
				open={isCreateOpen}
				onOpenChange={setIsCreateOpen}
				onAppCreated={handleAppCreated}
			/>

			{/* Send Notification Modal */}
			<SendNotificationModal
				open={Boolean(selectedAppForNotification)}
				onOpenChange={(open) => !open && setSelectedAppForNotification(null)}
				app={selectedAppForNotification}
			/>
		</div>
	);
}
