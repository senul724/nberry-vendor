import { env } from "@/env";
import { access } from "fs";

const baseUrl = env.NEXT_PUBLIC_API_URL;

export interface User {
	id: string;
	name: string;
	email: string;
}

export interface Note {
	id: string;
	title: string;
	content: string;
	pinned?: boolean;
	created_at?: string;
	updated_at?: string;
}

// Auth API client
export const authApi = {
	async checkEmail(email: string) {
		const res = await fetch(`${baseUrl}/auth/check-email`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ email }),
		});
		const data = await res.json();
		if (!res.ok) throw new Error(data.message || "Failed to check email");
		return data as { user_available: boolean; password_available: boolean };
	},

	async sendLoginOtp(email: string) {
		const res = await fetch(`${baseUrl}/auth/send-login-otp`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ email }),
		});
		const data = await res.json();
		if (!res.ok) throw new Error(data.message || "Failed to send OTP");
		return data as { message: string };
	},

	async loginWithOtp(email: string, otp: string) {
		const res = await fetch(`${baseUrl}/auth/login-otp`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ email, otp }),
		});
		const data = await res.json();
		if (!res.ok) throw new Error(data.message || "Failed to log in with OTP");
		return data as { message: string; access_token: string; user: User };
	},

	async loginWithPassword(email: string, password: string) {
		const res = await fetch(`${baseUrl}/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ email, password }),
		});
		const data = await res.json();
		if (!res.ok) throw new Error(data.message || "Failed to log in");
		return data as { message: string; access_token: string; user: User };
	},

	async register(name: string, email: string, otp: string) {
		const res = await fetch(`${baseUrl}/auth/register`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ name, email, otp }),
		});
		const data = await res.json();
		if (!res.ok) throw new Error(data.message || "Failed to register");
		return data as { message: string; access_token: string; user: User };
	},

	async refresh(token?: string) {
		console.log("in refresh", `${baseUrl}/auth/refresh`);
		const res = await fetch(`${baseUrl}/auth/refresh`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...(token ? { Authorization: `Bearer ${token}` } : {}),
			},
			credentials: "include",
		});
		const data = await res.json();
		if (!res.ok) throw new Error(data.message || "Failed to refresh token");
		return data as { access_token: string };
	},

	async forgotPassword(email: string) {
		const res = await fetch(`${baseUrl}/auth/forgot-password`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ email }),
		});
		const data = await res.json();
		if (!res.ok) throw new Error(data.message || "Failed to send reset code");
		return data as { message: string };
	},

	async resetPassword(email: string, otp: string, new_password: string) {
		const res = await fetch(`${baseUrl}/auth/reset-password`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ email, otp, new_password }),
		});
		const data = await res.json();
		if (!res.ok) throw new Error(data.message || "Failed to reset password");
		return data as { message: string };
	},

	async logout() {
		const res = await fetch(`${baseUrl}/auth/logout`, {
			method: "POST",
			credentials: "include",
		});
		const data = await res.json();
		if (!res.ok) throw new Error(data.message || "Failed to logout");
		return data as { message: string };
	},
};

// Notes API client - requires token as an explicit argument
export const notesApi = {
	async getAll(token: string) {
		const res = await fetch(`${baseUrl}/notes`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			credentials: "include",
		});
		const data = await res.json();
		if (!res.ok) throw new Error(data.message || "Failed to fetch notes");
		return data as { notes: Note[] };
	},

	async getById(id: string, token: string) {
		const res = await fetch(`${baseUrl}/notes/${id}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			credentials: "include",
		});
		const data = await res.json();
		if (!res.ok) throw new Error(data.message || "Failed to fetch note");
		return data as { note: Note };
	},

	async create(data: { title: string; content: string }, token: string) {
		const res = await fetch(`${baseUrl}/notes`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			credentials: "include",
			body: JSON.stringify(data),
		});
		const resData = await res.json();
		if (!res.ok) throw new Error(resData.message || "Failed to create note");
		return resData as { message: string; note: Note };
	},

	async update(
		id: string,
		data: { title?: string; content?: string; pinned?: boolean },
		token: string,
	) {
		const res = await fetch(`${baseUrl}/notes/${id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			credentials: "include",
			body: JSON.stringify(data),
		});
		const resData = await res.json();
		if (!res.ok) throw new Error(resData.message || "Failed to update note");
		return resData as { message: string; note: Note };
	},

	async delete(id: string, token: string) {
		const res = await fetch(`${baseUrl}/notes/${id}`, {
			method: "DELETE",
			headers: {
				Authorization: `Bearer ${token}`,
			},
			credentials: "include",
		});
		const data = await res.json();
		if (!res.ok) throw new Error(data.message || "Failed to delete note");
		return data as { message: string };
	},
};

export interface VendorApp {
	id: string;
	name: string;
	description?: string | null;
	logo?: string | null;
	unicast_callback_url?: string | null;
	secret_key?: string | null;
	created_at?: string;
	createdAt?: string;
	updated_at?: string;
	updatedAt?: string;
	vendor_id?: string;
}

export interface AppStats {
	broadcast_subscribers_count: number;
	unicast_subscribers_count: number;
	total_broadcast_memos_sent: number;
	total_direct_memos_sent: number;
}

export interface TestCallbackResult {
	status_code: number;
	status: string;
	latency_ms: number;
	message?: string;
	error?: string;
	payload?: unknown;
	success: boolean;
}

export interface CreateAppInput {
	name: string;
	description?: string;
	logo?: string;
	unicast_callback_url?: string;
}

export interface UpdateAppInput {
	name: string;
	description?: string;
	logo?: string;
	unicast_callback_url?: string;
}

export interface SendNotificationInput {
	type: "broadcast" | "unicast";
	title: string;
	message: string;
	recipient_id?: string;
}

export const appsApi = {
	async getAll(token: string) {
		const res = await fetch(`${baseUrl}/apps`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			credentials: "include",
		});
		const data = await res.json().catch(() => ({}));
		if (!res.ok) {
			throw new Error(
				data.message || data.error || `Failed to fetch apps (${res.status})`,
			);
		}
		const apps: VendorApp[] = Array.isArray(data)
			? data
			: Array.isArray(data.apps)
				? data.apps
				: Array.isArray(data.data)
					? data.data
					: [];
		return { apps };
	},

	async getById(id: string, token: string) {
		const res = await fetch(`${baseUrl}/apps/${id}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			credentials: "include",
		});
		const data = await res.json().catch(() => ({}));
		if (!res.ok) {
			throw new Error(
				data.message || data.error || `Failed to fetch app (${res.status})`,
			);
		}
		const app: VendorApp = data.app || data.data || data;
		return { app };
	},

	async create(input: CreateAppInput, token: string) {
		const res = await fetch(`${baseUrl}/apps`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			credentials: "include",
			body: JSON.stringify(input),
		});
		const data = await res.json().catch(() => ({}));
		if (!res.ok) {
			throw new Error(
				data.message || data.error || `Failed to create app (${res.status})`,
			);
		}
		const app: VendorApp = data.app || data.data || data;
		const secret_key: string =
			data.secret_key ||
			data.secretKey ||
			app.secret_key ||
			(typeof app === "object" && app !== null && "secretKey" in app
				? String((app as Record<string, unknown>).secretKey)
				: "");
		return { ...data, app, secret_key };
	},

	async update(id: string, input: UpdateAppInput, token: string) {
		const res = await fetch(`${baseUrl}/apps/${id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			credentials: "include",
			body: JSON.stringify(input),
		});
		const data = await res.json().catch(() => ({}));
		if (!res.ok) {
			throw new Error(
				data.message || data.error || `Failed to update app (${res.status})`,
			);
		}
		const app: VendorApp = data.app || data.data || data;
		return { ...data, app };
	},

	async delete(id: string, token: string) {
		const res = await fetch(`${baseUrl}/apps/${id}`, {
			method: "DELETE",
			headers: {
				Authorization: `Bearer ${token}`,
			},
			credentials: "include",
		});
		const data = await res.json().catch(() => ({}));
		if (!res.ok) {
			throw new Error(
				data.message || data.error || `Failed to delete app (${res.status})`,
			);
		}
		return data as { message?: string };
	},

	async getStats(id: string, token: string): Promise<AppStats> {
		const res = await fetch(`${baseUrl}/apps/${id}/stats`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			credentials: "include",
		});
		const data = await res.json().catch(() => ({}));
		if (!res.ok) {
			throw new Error(
				data.message ||
					data.error ||
					`Failed to fetch app stats (${res.status})`,
			);
		}
		return data as AppStats;
	},

	async testCallback(id: string, token: string): Promise<TestCallbackResult> {
		const startTime = performance.now();
		try {
			const res = await fetch(`${baseUrl}/apps/${id}/test-callback`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				credentials: "include",
			});
			const clientLatency = Math.round(performance.now() - startTime);
			const data = await res.json().catch(() => ({}));

			const statusCode = data.status_code || data.statusCode || res.status;
			const isSuccess = res.ok && statusCode >= 200 && statusCode < 300;

			return {
				status_code: statusCode,
				status:
					data.status ||
					(isSuccess ? `${statusCode} OK` : `${statusCode} Error`),
				latency_ms: data.latency_ms ?? data.latency ?? clientLatency,
				message:
					data.message ||
					(isSuccess
						? "Webhook delivered successfully"
						: data.error || "Callback test returned an error"),
				error: data.error,
				payload: data.payload || data,
				success: isSuccess,
			};
		} catch (err: unknown) {
			const clientLatency = Math.round(performance.now() - startTime);
			const errorMessage =
				err instanceof Error ? err.message : "Failed to reach backend endpoint";
			return {
				status_code: 500,
				status: "500 Request Failed",
				latency_ms: clientLatency,
				message: errorMessage,
				error: errorMessage,
				success: false,
			};
		}
	},

	async regenerateSecret(id: string, token: string) {
		const res = await fetch(`${baseUrl}/apps/${id}/regenerate-secret`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			credentials: "include",
		});
		const data = await res.json().catch(() => ({}));
		if (!res.ok) {
			throw new Error(
				data.message ||
					data.error ||
					`Failed to rotate secret key (${res.status})`,
			);
		}
		return { secret_key: data.secret_key };
	},

	async sendNotification(
		id: string,
		input: SendNotificationInput,
		token: string,
	) {
		const res = await fetch(`${baseUrl}/apps/${id}/send-notification`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			credentials: "include",
			body: JSON.stringify(input),
		});
		const data = await res.json().catch(() => ({}));
		if (!res.ok) {
			throw new Error(
				data.message ||
					data.error ||
					`Failed to send notification (${res.status})`,
			);
		}
		return data;
	},
};
