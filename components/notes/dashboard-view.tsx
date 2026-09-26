"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
	Plus,
	Search,
	BookOpenText,
	LogOut,
	User as UserIcon,
	Pin,
	FileText,
	Loader2,
	RefreshCw,
	FolderOpen,
	ShieldCheck,
	LayoutGrid,
	List as ListIcon,
	X,
	Clock,
	Sparkles,
} from "lucide-react";
import { notesApi, authApi, Note } from "@/lib/api";
import { useToken } from "@/hooks/use-token";
import { useUser } from "@/hooks/use-user";
import type { User } from "@/lib/atoms";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NoteCard } from "@/components/notes/note-card";
import { NoteDialog } from "@/components/notes/note-dialog";
import { DeleteConfirmDialog } from "@/components/notes/delete-confirm-dialog";

type FilterTab = "all" | "pinned" | "recent";
type ViewMode = "grid" | "list";

export function DashboardView() {
	const router = useRouter();
	const { getUser } = useUser();
	const { getValidAccessToken, accessToken, setAccessToken } = useToken();

	const [user, setUser] = useState<User | null>(null);
	const [notes, setNotes] = useState<Note[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [activeTab, setActiveTab] = useState<FilterTab>("all");
	const [viewMode, setViewMode] = useState<ViewMode>("grid");

	// Dialog states
	const [isNoteDialogOpen, setIsNoteDialogOpen] = useState<boolean>(false);
	const [editingNote, setEditingNote] = useState<Note | null>(null);

	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
	const [deletingNote, setDeletingNote] = useState<Note | null>(null);
	const [isDeleting, setIsDeleting] = useState<boolean>(false);

	// Fetch notes from backend using token passed as argument
	const fetchNotes = useCallback(async () => {
		setIsLoading(true);
		try {
			const activeToken = await getValidAccessToken();
			if (!activeToken) {
				toast.error("Failed to load notes");
				return;
			}
			const data = await notesApi.getAll(activeToken);
			setNotes(data.notes || []);
		} catch (err: any) {
			console.error("Failed to load notes:", err);
			// If token expired, attempt one refresh
			try {
				const refreshRes = await authApi.refresh();
				if (refreshRes.access_token) {
					setAccessToken(refreshRes.access_token);
					const data = await notesApi.getAll(refreshRes.access_token);
					setNotes(data.notes || []);
					return;
				}
			} catch {
				router.push("/login");
			}
			toast.error(err.message || "Failed to load notes");
		} finally {
			setIsLoading(false);
		}
	}, [setAccessToken, router]);

	useEffect(() => {
		setUser(getUser());
	}, []);

	useEffect(() => {
		fetchNotes();
	}, [fetchNotes]);

	// Handle Logout
	const handleLogout = async () => {
		setIsLoggingOut(true);
		try {
			await authApi.logout();
			setAccessToken(null);
			setUser(null);
			toast.success("Signed out successfully");
			router.push("/login");
		} catch (err: any) {
			toast.error(err.message || "Failed to sign out");
		} finally {
			setIsLoggingOut(false);
		}
	};

	// Open Create Dialog
	const handleOpenCreate = () => {
		setEditingNote(null);
		setIsNoteDialogOpen(true);
	};

	// Open Edit Dialog
	const handleOpenEdit = (note: Note) => {
		setEditingNote(note);
		setIsNoteDialogOpen(true);
	};

	// Open Delete Confirmation
	const handleOpenDelete = (note: Note) => {
		setDeletingNote(note);
		setIsDeleteDialogOpen(true);
	};

	// Submit Note (Create or Edit)
	const handleNoteSubmit = async (values: {
		title: string;
		content: string;
	}) => {
		try {
			const activeToken = await getValidAccessToken();
			if (!activeToken) {
				toast.error("Failed to update note");
				return;
			}
			if (editingNote) {
				// Update existing note
				const res = await notesApi.update(editingNote.id, values, activeToken);
				setNotes((prev) =>
					prev.map((n) =>
						n.id === editingNote.id ? { ...n, ...res.note } : n,
					),
				);
				toast.success("Note updated successfully!");
			} else {
				// Create new note
				const res = await notesApi.create(values, activeToken);
				if (res.note) {
					setNotes((prev) => [res.note, ...prev]);
				} else {
					await fetchNotes();
				}
				toast.success("Note created successfully!");
			}
		} catch (err: any) {
			toast.error(err.message || "Failed to save note");
		}
	};

	// Confirm Delete
	const handleConfirmDelete = async () => {
		if (!deletingNote) return;
		setIsDeleting(true);
		try {
			const activeToken = await getValidAccessToken();
			if (!activeToken) {
				toast.error("Failed to delete note");
				return;
			}
			await notesApi.delete(deletingNote.id, activeToken);
			setNotes((prev) => prev.filter((n) => n.id !== deletingNote.id));
			toast.success("Note deleted successfully!");
			setIsDeleteDialogOpen(false);
			setDeletingNote(null);
		} catch (err: any) {
			toast.error(err.message || "Failed to delete note");
		} finally {
			setIsDeleting(false);
		}
	};

	// Toggle Pin Note
	const handleTogglePin = async (note: Note) => {
		const newPinned = !note.pinned;
		// Optimistic update
		setNotes((prev) =>
			prev.map((n) => (n.id === note.id ? { ...n, pinned: newPinned } : n)),
		);

		try {
			const activeToken = await getValidAccessToken();
			if (!activeToken) {
				toast.error("Failed to pin note");
				return;
			}
			await notesApi.update(note.id, { pinned: newPinned }, activeToken);
			toast.success(newPinned ? "Note pinned" : "Note unpinned");
		} catch (err: any) {
			// Revert on error
			setNotes((prev) =>
				prev.map((n) => (n.id === note.id ? { ...n, pinned: !newPinned } : n)),
			);
			toast.error(err.message || "Failed to update pin status");
		}
	};

	// Filter and sort notes
	const filteredNotes = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();
		let result = notes.filter((note) => {
			if (!query) return true;
			return (
				note.title?.toLowerCase().includes(query) ||
				note.content?.toLowerCase().includes(query)
			);
		});

		if (activeTab === "pinned") {
			result = result.filter((note) => note.pinned);
		}

		// Sort order
		return result.sort((a, b) => {
			if (activeTab !== "recent") {
				if (a.pinned && !b.pinned) return -1;
				if (!a.pinned && b.pinned) return 1;
			}
			const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
			const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
			return dateB - dateA;
		});
	}, [notes, searchQuery, activeTab]);

	const pinnedCount = useMemo(
		() => notes.filter((n) => n.pinned).length,
		[notes],
	);

	return (
		<div className="min-h-screen bg-[#fafafa] flex flex-col relative selection:bg-indigo-100 selection:text-indigo-900">
			{/* Ambient background glow decoration */}
			<div className="pointer-events-none fixed inset-x-0 top-0 h-96 bg-gradient-to-b from-indigo-50/40 via-violet-50/20 to-transparent -z-10" />

			{/* Top Navigation Header */}
			<header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl shadow-2xs">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
					{/* Brand Logo */}
					<div className="flex items-center gap-3">
						<div className="flex items-center gap-2.5 font-bold text-zinc-900 text-lg tracking-tight">
							<div className="w-9 h-9 rounded-xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 text-white flex items-center justify-center shadow-xs ring-1 ring-zinc-800">
								<BookOpenText className="w-5 h-5 text-zinc-200" />
							</div>
							<div className="flex items-baseline gap-1.5">
								<span className="font-bold text-zinc-900 tracking-tight">
									NotesVault
								</span>
								<span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded">
									Pro
								</span>
							</div>
						</div>

						<div className="hidden md:flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200/60 shadow-2xs">
							<ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
							<span>IAM Encrypted</span>
						</div>
					</div>

					{/* User profile & actions */}
					<div className="flex items-center gap-3">
						{/* User capsule */}
						<div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-zinc-100/90 hover:bg-zinc-100 border border-zinc-200/70 text-xs text-zinc-700 shadow-2xs transition-colors">
							<div className="relative">
								<div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-[11px] shadow-2xs">
									{user?.name ? (
										user.name.slice(0, 2).toUpperCase()
									) : (
										<UserIcon className="w-3.5 h-3.5" />
									)}
								</div>
								<span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
							</div>
							<div className="text-left hidden sm:block">
								<p className="font-semibold text-zinc-900 leading-tight text-xs">
									{user?.name || "User"}
								</p>
								<p className="text-[10px] text-zinc-500 leading-tight truncate max-w-[150px]">
									{user?.email || "user@example.com"}
								</p>
							</div>
						</div>

						{/* Logout button */}
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={handleLogout}
							disabled={isLoggingOut}
							className="h-9 text-zinc-600 hover:text-rose-600 hover:bg-rose-50/50 hover:border-rose-200 shadow-2xs transition-all"
						>
							{isLoggingOut ? (
								<Loader2 className="w-3.5 h-3.5 animate-spin" />
							) : (
								<>
									<LogOut className="w-3.5 h-3.5 mr-1" />
									<span className="hidden sm:inline font-medium text-xs">
										Logout
									</span>
								</>
							)}
						</Button>
					</div>
				</div>
			</header>

			{/* Main Content Area */}
			<main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
				{/* Welcome & Overview Banner */}
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-200/60">
					<div>
						<h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
							<span>
								Welcome back, {user?.name ? user.name.split(" ")[0] : "there"}
							</span>
							<span className="text-xl">👋</span>
						</h1>
						<p className="text-sm text-zinc-500 mt-1">
							Capture your thoughts, code snippets, and ideas in a secure vault.
						</p>
					</div>

					{/* Quick Metrics Cards */}
					<div className="flex items-center gap-3">
						<div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white border border-zinc-200/80 shadow-2xs">
							<div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700">
								<FileText className="w-4 h-4" />
							</div>
							<div>
								<p className="text-xs text-zinc-400 font-medium">Total Notes</p>
								<p className="text-sm font-bold text-zinc-900 leading-tight">
									{notes.length}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white border border-zinc-200/80 shadow-2xs">
							<div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
								<Pin className="w-4 h-4 fill-amber-500" />
							</div>
							<div>
								<p className="text-xs text-zinc-400 font-medium">Pinned</p>
								<p className="text-sm font-bold text-zinc-900 leading-tight">
									{pinnedCount}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Controls Toolbar: Search, Filters, View Modes & Actions */}
				<div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
					{/* Search Bar */}
					<div className="relative flex-1 max-w-md">
						<Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400 pointer-events-none" />
						<Input
							type="text"
							placeholder="Search notes by title, keywords..."
							className="pl-10 pr-9 h-10 bg-white border-zinc-200/90 shadow-2xs focus-visible:ring-indigo-500 rounded-xl"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
						{searchQuery && (
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 p-0.5 rounded-md focus:outline-none"
							>
								<X className="w-3.5 h-3.5" />
							</button>
						)}
					</div>

					{/* Right Toolbar Controls */}
					<div className="flex flex-wrap items-center justify-between lg:justify-end gap-2.5">
						{/* Filter Tabs */}
						<div className="flex items-center p-1 bg-zinc-100/90 rounded-xl border border-zinc-200/70 shadow-2xs">
							<button
								type="button"
								onClick={() => setActiveTab("all")}
								className={cn(
									"px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
									activeTab === "all"
										? "bg-white text-zinc-900 shadow-xs font-semibold"
										: "text-zinc-600 hover:text-zinc-900",
								)}
							>
								All ({notes.length})
							</button>

							<button
								type="button"
								onClick={() => setActiveTab("pinned")}
								className={cn(
									"px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5",
									activeTab === "pinned"
										? "bg-white text-zinc-900 shadow-xs font-semibold"
										: "text-zinc-600 hover:text-zinc-900",
								)}
							>
								<Pin className="w-3 h-3 text-amber-500" />
								Pinned ({pinnedCount})
							</button>

							<button
								type="button"
								onClick={() => setActiveTab("recent")}
								className={cn(
									"px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5",
									activeTab === "recent"
										? "bg-white text-zinc-900 shadow-xs font-semibold"
										: "text-zinc-600 hover:text-zinc-900",
								)}
							>
								<Clock className="w-3 h-3 text-zinc-500" />
								Recent
							</button>
						</div>

						{/* Layout Toggle: Grid / List */}
						<div className="flex items-center p-1 bg-zinc-100/90 rounded-xl border border-zinc-200/70 shadow-2xs">
							<button
								type="button"
								onClick={() => setViewMode("grid")}
								title="Grid View"
								className={cn(
									"p-1.5 rounded-lg transition-all",
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
									"p-1.5 rounded-lg transition-all",
									viewMode === "list"
										? "bg-white text-zinc-900 shadow-xs"
										: "text-zinc-500 hover:text-zinc-900",
								)}
							>
								<ListIcon className="w-4 h-4" />
							</button>
						</div>

						{/* Refresh Button */}
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={fetchNotes}
							disabled={isLoading}
							title="Refresh notes"
							className="h-10 px-3 bg-white border-zinc-200/90 text-zinc-700 hover:bg-zinc-50 shadow-2xs rounded-xl"
						>
							<RefreshCw
								className={cn("w-4 h-4", isLoading && "animate-spin")}
							/>
							<span className="sr-only">Refresh</span>
						</Button>

						{/* Create New Note CTA */}
						<Button
							type="button"
							size="default"
							onClick={handleOpenCreate}
							className="h-10 px-4 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 hover:from-zinc-800 hover:to-zinc-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
						>
							<Plus className="w-4 h-4 mr-1.5" />
							<span className="font-semibold">New Note</span>
						</Button>
					</div>
				</div>

				{/* Results Info Banner (shown when filtered or searched) */}
				{(searchQuery || activeTab !== "all") && (
					<div className="flex items-center justify-between text-xs text-zinc-500 bg-zinc-100/60 px-4 py-2 rounded-xl border border-zinc-200/60">
						<div className="flex items-center gap-2">
							<Sparkles className="w-3.5 h-3.5 text-indigo-500" />
							<span>
								Showing <strong>{filteredNotes.length}</strong>{" "}
								{filteredNotes.length === 1 ? "note" : "notes"}
								{searchQuery && (
									<>
										{" "}
										matching &ldquo;<strong>{searchQuery}</strong>&rdquo;
									</>
								)}
								{activeTab === "pinned" && " in Pinned"}
								{activeTab === "recent" && " sorted by Recent"}
							</span>
						</div>

						{searchQuery && (
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
							>
								Clear filter
							</button>
						)}
					</div>
				)}

				{/* Notes Grid, List, or Empty States */}
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
								className="h-48 rounded-2xl border border-zinc-200/80 bg-white p-5 space-y-4 animate-pulse shadow-2xs"
							>
								<div className="h-5 w-2/3 bg-zinc-200/80 rounded-md" />
								<div className="space-y-2">
									<div className="h-3 w-full bg-zinc-100 rounded-md" />
									<div className="h-3 w-5/6 bg-zinc-100 rounded-md" />
									<div className="h-3 w-4/6 bg-zinc-100 rounded-md" />
								</div>
							</div>
						))}
					</div>
				) : filteredNotes.length > 0 ? (
					/* Active Notes Display */
					<div
						className={cn(
							viewMode === "grid"
								? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
								: "flex flex-col gap-3",
						)}
					>
						{filteredNotes.map((note) => (
							<NoteCard
								key={note.id}
								note={note}
								viewMode={viewMode}
								onEdit={handleOpenEdit}
								onDelete={handleOpenDelete}
								onTogglePin={handleTogglePin}
							/>
						))}
					</div>
				) : (
					/* Empty State */
					<div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border border-dashed border-zinc-200 bg-white shadow-2xs">
						<div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-zinc-100 to-zinc-50 border border-zinc-200/60 text-zinc-400 flex items-center justify-center mb-4 shadow-2xs">
							<FolderOpen className="w-8 h-8 stroke-[1.4] text-zinc-500" />
						</div>

						<h3 className="text-lg font-bold text-zinc-900 mb-1">
							{searchQuery
								? "No matching notes found"
								: activeTab === "pinned"
									? "No pinned notes yet"
									: "Your vault is empty"}
						</h3>

						<p className="text-sm text-zinc-500 max-w-sm mb-6 leading-relaxed">
							{searchQuery
								? `We couldn't find any notes matching "${searchQuery}". Try a different keyword.`
								: activeTab === "pinned"
									? "Pin your most important notes using the pin button to keep them readily accessible here."
									: "Create your first note to start organizing thoughts, snippets, and project plans securely."}
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
								onClick={handleOpenCreate}
								className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl shadow-md px-5"
							>
								<Plus className="w-4 h-4 mr-1.5" />
								Create First Note
							</Button>
						)}
					</div>
				)}
			</main>

			{/* Note Create/Edit Dialog */}
			<NoteDialog
				open={isNoteDialogOpen}
				onOpenChange={setIsNoteDialogOpen}
				noteToEdit={editingNote}
				onSubmit={handleNoteSubmit}
			/>

			{/* Delete Confirmation Dialog */}
			<DeleteConfirmDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
				note={deletingNote}
				onConfirm={handleConfirmDelete}
				isDeleting={isDeleting}
			/>
		</div>
	);
}
