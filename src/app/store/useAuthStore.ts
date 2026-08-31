"use client";

import { create } from "zustand";

import type { ApiSignInResponse } from "../lib/api";

type AuthState = {
  user: ApiSignInResponse | null;
  isHydrated: boolean;
  setUser: (user: ApiSignInResponse | null) => void;
  clearUser: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isHydrated: false,
  setUser: (user) => set({ user, isHydrated: true }),
  clearUser: () => set({ user: null, isHydrated: true }),
}));
