import { authAPI } from "@/API/auth.api";
import { axiosPublic } from "@/API/axiosInstance";
import { User } from "@/types";
import { create } from "zustand";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, accessToken: string | null) => void;
  setUser: (user: User) => void;
  handleRefreshToken: () => Promise<string>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,

  setAuth: (user, accessToken: string | null) => {
    set({ user, accessToken });
  },

  handleRefreshToken: async () => {
    const api = authAPI(axiosPublic);
    const { data } = await api.refreshToken();
    get().setAuth(data.user, data.accessToken);
    return data.accessToken;
  },

  logout: async () => {
    set({ user: null, accessToken: null });
    const api = authAPI(axiosPublic);
    await api.logout();
    window.location.href = "/";
  },

  setUser: (user) => {
    set({ user });
  },
}));
