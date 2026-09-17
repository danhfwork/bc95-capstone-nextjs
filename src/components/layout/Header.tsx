import { Search } from "lucide-react";
import Link from "next/link";

import type { ApiCourseCategory } from "@/app/lib/api";
import HeaderAuthActions from "@/components/layout/HeaderAuthActions";
import CourseNavMenu from "@/components/layout/CourseNavMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

        <form
          action="/"
          role="search"
          className="relative order-4 h-10 w-full sm:order-none sm:ml-auto sm:w-36 md:w-48 lg:w-64"
        >
          <Label htmlFor="header-course-search" className="sr-only">
            Tìm kiếm khóa học
          </Label>
          <Input
            id="header-course-search"
            name="q"
            type="search"
            autoComplete="off"
            defaultValue={searchQuery}
            placeholder="Tìm khóa học..."
            className="h-10 rounded-full border-blue-200 bg-blue-50 pr-3 pl-10 text-base text-slate-900 placeholder:text-slate-500 focus-visible:border-blue-600 focus-visible:bg-white focus-visible:ring-blue-100 sm:text-xs"
          />
          {selectedCategoryId ? (
            <input type="hidden" name="category" value={selectedCategoryId} />
          ) : null}
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            aria-label="Tìm kiếm"
            className="absolute inset-y-1 left-1 size-8 cursor-pointer rounded-full text-slate-500 hover:bg-white hover:text-blue-700 focus-visible:border-transparent focus-visible:ring-blue-600"
          >
            <Search aria-hidden="true" className="size-4" />
          </Button>
        </form>

        <HeaderAuthActions />
      </div>
    </header>
  );
}
