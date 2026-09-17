"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

import { clearSession, getSession } from "@/app/lib/session";
import { useAuthStore } from "@/app/store/useAuthStore";

export function useAuthSession() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  useEffect(() => {
    if (!isHydrated) {
      setUser(getSession());
    }
  }, [isHydrated, setUser]);

  const logout = useCallback(() => {
    clearSession();
    clearUser();
    router.replace("/login");
  }, [clearUser, router]);

  return { isHydrated, logout, user };
}
