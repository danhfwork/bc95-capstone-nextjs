"use client";

import { ChevronDown, LogOut, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { clearSession, getSession } from "@/app/lib/session";
import { useAuthStore } from "@/app/store/useAuthStore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function getUserInitial(displayName: string): string {
  return Array.from(displayName.trim())[0]?.toLocaleUpperCase("vi-VN") ?? "U";
}

export default function HeaderAuthActions() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  useEffect(() => {
    if (isHydrated) {
      return;
    }

    setUser(getSession());
  }, [isHydrated, setUser]);

  const handleLogout = () => {
    clearSession();
    clearUser();
    router.replace("/login");
  };

  if (!isHydrated) {
    return (
      <div aria-hidden="true" className="ml-auto h-10 w-36 shrink-0 sm:ml-0" />
    );
  }

  if (!user) {
    return (
      <div className="ml-auto flex h-10 w-36 shrink-0 items-center justify-end gap-2 sm:ml-0">
        <Button
          render={<Link href="/login" />}
          nativeButton={false}
          variant="ghost"
          size="sm"
          className="h-10 px-1 text-xs text-blue-700 hover:bg-blue-50 hover:text-blue-700 focus-visible:border-transparent focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          Đăng nhập
        </Button>
        <Button
          render={<Link href="/register" />}
          nativeButton={false}
          size="sm"
          className="h-10 bg-blue-700 px-3 text-xs font-semibold text-white shadow-sm hover:bg-blue-800 focus-visible:border-blue-700 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          Đăng ký
        </Button>
      </div>
    );
  }

  const displayName = user.hoTen.trim() || user.taiKhoan;
  const isInstructor = user.maLoaiNguoiDung === "GV";

  return (
    <div className="ml-auto flex h-10 min-w-36 shrink-0 items-center justify-end sm:ml-0">
      <DropdownMenu>
        <DropdownMenuTrigger
          openOnHover
          delay={100}
          closeDelay={150}
          title={displayName}
          className="flex min-h-10 min-w-0 cursor-pointer items-center gap-2 rounded-lg px-1 text-slate-900 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 data-popup-open:bg-blue-50"
        >
          <span className="sr-only">Mở menu tài khoản của {displayName}</span>
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-700 text-sm font-bold text-white"
          >
            {getUserInitial(displayName)}
          </span>
          <span
            aria-hidden="true"
            className="hidden max-w-24 truncate text-xs font-semibold lg:block"
          >
            {displayName}
          </span>
          <ChevronDown
            aria-hidden="true"
            className="hidden size-3.5 shrink-0 text-slate-500 lg:block"
          />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-56 border border-slate-200 bg-white p-2 text-slate-900 shadow-lg"
        >
          <DropdownMenuItem
            render={<Link href="/profile" />}
            className="min-h-10 cursor-pointer gap-2 px-2.5 py-2 text-sm text-slate-700 focus:bg-blue-50 focus:text-blue-700"
          >
            <UserRound aria-hidden="true" className="size-4" />
            Hồ sơ
          </DropdownMenuItem>

          {isInstructor ? (
            <DropdownMenuItem
              render={<Link href="/admin" />}
              className="min-h-10 cursor-pointer gap-2 px-2.5 py-2 text-sm text-slate-700 focus:bg-blue-50 focus:text-blue-700"
            >
              <ShieldCheck aria-hidden="true" className="size-4" />
              Trang quản trị
            </DropdownMenuItem>
          ) : null}

          <DropdownMenuSeparator className="bg-slate-200" />

          <DropdownMenuItem
            variant="destructive"
            onClick={handleLogout}
            className="min-h-10 cursor-pointer gap-2 px-2.5 py-2 text-sm focus:bg-red-50 focus:text-red-700"
          >
            <LogOut aria-hidden="true" className="size-4" />
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
