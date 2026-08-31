"use client";

import {
  BookOpen,
  ExternalLink,
  GraduationCap,
  LogOut,
  Menu,
  ShieldCheck,
  UserRoundCog,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { clearSession, getSession } from "@/app/lib/session";
import { useAuthStore } from "@/app/store/useAuthStore";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAVIGATION = [
  { href: "/admin/users", label: "Quản lý người dùng", icon: UsersRound },
  { href: "/admin/courses", label: "Quản lý khóa học", icon: BookOpen },
  {
    href: "/admin/enrollments",
    label: "Quản lý ghi danh",
    icon: GraduationCap,
  },
];

function isActiveRoute(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function AdminNavigation({
  pathname,
  closeOnNavigate = false,
}: {
  pathname: string;
  closeOnNavigate?: boolean;
}) {
  return (
    <nav aria-label="Điều hướng quản trị" className="space-y-1 px-3">
      {NAVIGATION.map(({ href, label, icon: Icon }) => {
        const isActive = isActiveRoute(pathname, href);

        const className = cn(
          "flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
          isActive
            ? "bg-blue-600 text-white shadow-sm"
            : "text-slate-600 hover:bg-blue-50 hover:text-blue-700",
        );
        const content = (
          <>
            <Icon aria-hidden="true" className="size-5 shrink-0" />
            {label}
          </>
        );

        return closeOnNavigate ? (
          <SheetClose
            key={href}
            nativeButton={false}
            render={
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={className}
              />
            }
          >
            {content}
          </SheetClose>
        ) : (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={className}
          >
            {content}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link
      href="/admin/users"
      className="flex min-h-16 items-center gap-3 rounded-xl px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
    >
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-600 text-white"
      >
        <ShieldCheck className="size-6" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-base font-bold text-slate-950">
          CyberLearn Admin
        </span>
        <span className="block text-xs text-slate-500">Hệ thống quản trị</span>
      </span>
    </Link>
  );
}

export default function AdminShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
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

  const handleLogout = () => {
    clearSession();
    clearUser();
    router.replace("/login");
  };

  if (!isHydrated) {
    return (
      <div className="grid min-h-dvh place-items-center bg-slate-50 px-4">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
          <span className="size-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 motion-reduce:animate-none" />
          Đang kiểm tra quyền truy cập...
        </div>
      </div>
    );
  }

  if (!user || user.maLoaiNguoiDung !== "GV") {
    return (
      <main className="grid min-h-dvh place-items-center bg-slate-50 px-4 py-12">
        <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-blue-50 text-blue-700">
            <UserRoundCog aria-hidden="true" className="size-7" />
          </span>
          <h1 className="mt-5 text-2xl font-bold text-slate-950">
            Khu vực dành cho Giáo vụ
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Chỉ tài khoản Giáo vụ mới có thể truy cập khu vực này. Vui lòng đăng
            nhập bằng tài khoản phù hợp.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              render={<Link href={user ? "/" : "/login"} />}
              nativeButton={false}
              className="min-h-11 bg-blue-600 text-white hover:bg-blue-700"
            >
              {user ? "Về trang chủ" : "Đăng nhập"}
            </Button>
            <Button
              render={<Link href="/" />}
              nativeButton={false}
              variant="outline"
              className="min-h-11 border-slate-300"
            >
              Xem khóa học
            </Button>
          </div>
        </section>
      </main>
    );
  }

  const displayName = user.hoTen.trim() || user.taiKhoan;

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-950">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-lg focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
      >
        Bỏ qua menu, đến nội dung chính
      </a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="border-b border-slate-200 px-4 py-2">
          <Brand />
        </div>
        <div className="flex-1 py-6">
          <AdminNavigation pathname={pathname} />
        </div>
        <div className="border-t border-slate-200 p-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              render={<Link href="/" />}
              nativeButton={false}
              variant="outline"
              size="sm"
              className="min-h-10 border-slate-300"
            >
              <ExternalLink aria-hidden="true" className="size-4" />
              Website
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="min-h-10 text-slate-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleLogout}
            >
              <LogOut aria-hidden="true" className="size-4" />
              Thoát
            </Button>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:ml-72 lg:px-8">
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Mở menu quản trị"
                  className="size-11 text-slate-700"
                />
              }
            >
              <Menu aria-hidden="true" className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 gap-0 bg-white p-0">
              <SheetHeader className="border-b border-slate-200 px-4 py-2 text-left">
                <SheetTitle className="sr-only">Menu quản trị</SheetTitle>
                <SheetDescription className="sr-only">
                  Điều hướng các chức năng quản trị.
                </SheetDescription>
                <Brand />
              </SheetHeader>
              <div className="py-6">
                <AdminNavigation pathname={pathname} closeOnNavigate />
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <div className="hidden lg:block">
          <p className="text-sm text-slate-500">Quản trị hệ thống</p>
        </div>
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-100 text-sm font-bold text-blue-700"
          >
            {Array.from(displayName)[0]?.toLocaleUpperCase("vi-VN") ?? "G"}
          </span>
          <span className="hidden min-w-0 sm:block">
            <span className="block max-w-40 truncate text-sm font-semibold">
              {displayName}
            </span>
            <span className="block text-xs text-slate-500">Giáo vụ</span>
          </span>
        </div>
      </header>

      <main id="main-content" className="lg:ml-72">
        {children}
      </main>
    </div>
  );
}
