/**
 * Zustand store for authentication state — stores token + user info.
 */

import { create } from "zustand";
import { clearToken, getToken } from "@/lib/apiClient";

interface AuthState {
  isAuthenticated: boolean;
  token: string | undefined;
  username: string;
  email: string;
  userId: string;
  login: (token: string, username?: string, email?: string, userId?: string) => void;
  logout: () => void;
  hydrate: () => void;
}

const USER_KEY = "ai_email_user";

function saveUser(username: string, email: string, userId: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify({ username, email, userId }));
  }
}

function loadUser(): { username: string; email: string; userId: string } {
  if (typeof window === "undefined") return { username: "", email: "", userId: "" };
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : { username: "", email: "", userId: "" };
  } catch {
    return { username: "", email: "", userId: "" };
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  token: undefined,
  username: "",
  email: "",
  userId: "",

  login: (token, username = "", email = "", userId = "") => {
    saveUser(username, email, userId);
    set({ isAuthenticated: true, token, username, email, userId });
  },

  logout: () => {
    clearToken();
    if (typeof window !== "undefined") localStorage.removeItem(USER_KEY);
    set({ isAuthenticated: false, token: undefined, username: "", email: "", userId: "" });
  },

  hydrate: () => {
    const token = getToken();
    const user  = loadUser();
    set({
      isAuthenticated: !!token,
      token,
      username: user.username,
      email:    user.email,
      userId:   user.userId,
    });
  },
}));
