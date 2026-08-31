import { BookOpen, UserRound } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type EnrollmentViewSwitcherProps = {
  activeView: "users" | "courses";
};

const VIEWS = [
  {
    value: "users" as const,
    href: "/admin/enrollments",
    label: "Theo người dùng",
    icon: UserRound,
  },
  {
    value: "courses" as const,
    href: "/admin/enrollments/courses",
    label: "Theo khóa học",
    icon: BookOpen,
  },
];

export default function EnrollmentViewSwitcher({
  activeView,
}: EnrollmentViewSwitcherProps) {
  return (
    <nav
      aria-label="Chế độ quản lý ghi danh"
      className="mt-6 flex w-fit rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
    >
      {VIEWS.map(({ value, href, label, icon: Icon }) => {
        const isActive = value === activeView;

        return (
          <Link
            key={value}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
              isActive
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-blue-50 hover:text-blue-700",
            )}
          >
            <Icon aria-hidden="true" className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
