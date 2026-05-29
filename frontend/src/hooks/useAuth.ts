/**
 * Custom hook for authentication actions.
 */

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { login as apiLogin, register as apiRegister } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { LoginPayload, RegisterPayload } from "@/types";

export function useAuth() {
  const router = useRouter();
  const { login: storeLogin, logout: storeLogout } = useAuthStore();

  const login = async (payload: LoginPayload) => {
    const response = await apiLogin(payload);
    storeLogin(response.access_token, response.username, response.email, response.user_id);
    toast.success("Welcome back!");
    router.push("/dashboard");
  };

  const register = async (payload: RegisterPayload) => {
    await apiRegister(payload);
    toast.success("Account created! Please sign in.");
    router.push("/login");
  };

  const logout = () => {
    storeLogout();
    router.push("/login");
  };

  return { login, register, logout };
}
