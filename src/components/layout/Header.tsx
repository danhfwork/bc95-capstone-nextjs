import Link from "next/link";

import type { ApiCourseCategory } from "@/app/lib/api";
import HeaderAuthActions from "@/components/layout/HeaderAuthActions";
import CourseNavMenu from "@/components/layout/CourseNavMenu";
import HeaderSearch from "@/components/layout/HeaderSearch";
import { cn } from "@/lib/utils";

export type HeaderProps = {
  activeItem?: "courses" | null;
  categories?: ApiCourseCategory[];
  searchQuery?: string;
  selectedCategoryId?: string;
};

const focusClassName =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2";

export default function Header({
  activeItem = "courses",
  categories = [],
  searchQuery = "",
  selectedCategoryId,
}: HeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 sm:flex-nowrap sm:gap-x-3 sm:px-6 lg:gap-x-6 lg:px-8">
        <Link
          href="/"
          className={cn(
            "inline-flex min-h-10 shrink-0 items-center rounded-sm text-sm font-bold tracking-wide text-blue-700",
            focusClassName,
          )}
        >
          CYBERSOFT
        </Link>

        <nav
          aria-label="Điều hướng chính"
          className="order-3 flex w-full items-center gap-1 sm:order-none sm:w-auto sm:gap-2 md:gap-3"
        >
          <CourseNavMenu
            categories={categories}
            isActive={activeItem === "courses"}
            selectedCategoryId={selectedCategoryId}
          />
        </nav>

        <HeaderSearch
          key={searchQuery}
          searchQuery={searchQuery}
          selectedCategoryId={selectedCategoryId}
        />

        <HeaderAuthActions />
      </div>
    </header>
  );
}
