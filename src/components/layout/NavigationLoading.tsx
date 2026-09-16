"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";

const SHOW_DELAY_MS = 120;
const SAFETY_TIMEOUT_MS = 15_000;

function isSameDocumentUrl(href: string): boolean {
  const destination = new URL(href, window.location.href);
  const current = new URL(window.location.href);

  return (
    destination.origin === current.origin &&
    destination.pathname === current.pathname &&
    destination.search === current.search
  );
}

function shouldIgnoreAnchor(anchor: HTMLAnchorElement, event: MouseEvent) {
  return (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    anchor.target === "_blank" ||
    anchor.target === "_parent" ||
    anchor.target === "_top" ||
    anchor.hasAttribute("download") ||
    anchor.hasAttribute("data-no-navigation-loading")
  );
}

export default function NavigationLoading() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const [isVisible, setIsVisible] = useState(false);
  const showTimerRef = useRef<number | null>(null);
  const safetyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (showTimerRef.current !== null) {
      window.clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }

    if (safetyTimerRef.current !== null) {
      window.clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }

    const hideTimer = window.setTimeout(() => {
      setIsVisible(false);
    }, 0);

    return () => window.clearTimeout(hideTimer);
  }, [pathname, searchParamsKey]);

  useEffect(() => {
    const beginNavigation = (href: string) => {
      if (isSameDocumentUrl(href)) {
        return;
      }

      if (showTimerRef.current !== null) {
        window.clearTimeout(showTimerRef.current);
      }

      if (safetyTimerRef.current !== null) {
        window.clearTimeout(safetyTimerRef.current);
      }

      showTimerRef.current = window.setTimeout(() => {
        setIsVisible(true);
        showTimerRef.current = null;
      }, SHOW_DELAY_MS);
      safetyTimerRef.current = window.setTimeout(() => {
        setIsVisible(false);
        safetyTimerRef.current = null;
      }, SAFETY_TIMEOUT_MS);
    };

    const handleClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      const anchor = event.target.closest("a[href]");

      if (
        !(anchor instanceof HTMLAnchorElement) ||
        shouldIgnoreAnchor(anchor, event)
      ) {
        return;
      }

      beginNavigation(anchor.href);
    };

    const handleSubmit = (event: SubmitEvent) => {
      if (!(event.target instanceof HTMLFormElement)) {
        return;
      }

      const form = event.target;
      const method = (form.method || "get").toLowerCase();

      if (method !== "get" || form.target && form.target !== "_self") {
        return;
      }

      const destination = new URL(
        form.action || window.location.href,
        window.location.href,
      );
      const formData = new FormData(form);

      formData.forEach((value, key) => {
        if (typeof value === "string") {
          destination.searchParams.set(key, value);
        }
      });

      beginNavigation(destination.toString());
    };

    document.addEventListener("click", handleClick, true);
    document.addEventListener("submit", handleSubmit, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("submit", handleSubmit, true);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100] grid place-items-center bg-slate-950/10 px-4"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        role="status"
        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-lg"
      >
        <LoaderCircle
          aria-hidden="true"
          className="size-5 animate-spin text-blue-700 motion-reduce:animate-none"
        />
        Đang chuyển trang...
      </div>
    </div>
  );
}
