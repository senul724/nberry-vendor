import { env } from "@/env";

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
    token: string
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
