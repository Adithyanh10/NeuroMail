/**
 * Axios instance pre-configured with the backend base URL and JWT auth header.
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

const TOKEN_KEY = "access_token";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

// ── Request interceptor: attach JWT token ────────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 globally ────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      Cookies.remove(TOKEN_KEY);
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ── Token helpers ─────────────────────────────────────────────────────────────

export function saveToken(token: string, expiresInSeconds: number): void {
  Cookies.set(TOKEN_KEY, token, {
    expires: expiresInSeconds / 86400, // convert seconds → days
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
}

export function clearToken(): void {
  Cookies.remove(TOKEN_KEY);
}

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY);
}
