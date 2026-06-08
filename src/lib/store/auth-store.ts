import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthUser } from "../types";
import { DEMO_CONFIG } from "../demo-config";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: AuthUser, token?: string | null) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: true,
      setAuth: (user, token = null) => set({ user, token }),
      clearAuth: () => set({ user: null, token: null }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: `${DEMO_CONFIG.localStoragePrefix}-auth`,
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

