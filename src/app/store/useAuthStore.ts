"use client";

import { create } from "zustand";

import type { ApiAccountUser } from "../lib/api";

type AuthState = {
  user: ApiAccountUser | null;
  isHydrated: boolean;
  setUser: (user: ApiAccountUser | null) => void;
  clearUser: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isHydrated: false,
  setUser: (user) => set({ user, isHydrated: true }),
  clearUser: () => set({ user: null, isHydrated: true }),
}));
