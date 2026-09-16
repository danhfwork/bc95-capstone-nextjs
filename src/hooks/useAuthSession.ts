"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

import {
  AUTH_EXPIRED_EVENT,
  getCurrentUserSession,
  logoutSession,
} from "@/app/lib/api";
import { useAuthStore } from "@/app/store/useAuthStore";

export function useAuthSession() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  useEffect(() => {
    if (isHydrated) {
      return;
    }

    let isActive = true;

    void getCurrentUserSession()
      .catch(() => null)
      .then((currentUser) => {
        if (isActive) {
          setUser(currentUser);
        }
      });

    return () => {
      isActive = false;
    };
  }, [isHydrated, setUser]);

  useEffect(() => {
    const handleAuthExpired = () => {
      clearUser();

      if (window.location.pathname === "/login") {
        return;
      }

      const nextPath = `${window.location.pathname}${window.location.search}`;
      router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);

    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    };
  }, [clearUser, router]);

  const logout = useCallback(async () => {
    try {
      await logoutSession();
    } finally {
      clearUser();
      router.replace("/login");
    }
  }, [clearUser, router]);

  return { isHydrated, logout, user };
}
