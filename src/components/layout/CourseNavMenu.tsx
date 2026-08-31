"use client";

import { Check, ChevronDown } from "lucide-react";
import Link from "next/link";

import type { ApiCourseCategory } from "@/app/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type CourseNavMenuProps = {
  categories: ApiCourseCategory[];
  isActive: boolean;
  selectedCategoryId?: string;
};

const focusClassName =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2";

export default function CourseNavMenu({
  categories,
  isActive,
  selectedCategoryId,
}: CourseNavMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        openOnHover
        delay={100}
        closeDelay={150}
        className={cn(
          "inline-flex min-h-10 cursor-pointer items-center gap-1 border-b-2 px-1 text-xs font-medium whitespace-nowrap transition-colors",
          focusClassName,
          isActive
            ? "border-blue-600 font-semibold text-blue-700"
            : "border-transparent text-slate-700 hover:border-blue-200 hover:text-blue-700",
        )}
      >
        Khóa học
        <ChevronDown aria-hidden="true" className="size-3.5" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="w-64 border border-slate-200 bg-white p-2 text-slate-900 shadow-lg"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Danh mục khóa học
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-200" />

          <DropdownMenuItem
            render={
              <Link
                href="/"
                aria-current={!selectedCategoryId ? "page" : undefined}
              />
            }
            className="min-h-10 cursor-pointer justify-between gap-3 px-2.5 py-2 text-sm text-slate-700 focus:bg-blue-50 focus:text-blue-700"
          >
            Tất cả khóa học
            {!selectedCategoryId ? (
              <Check aria-hidden="true" className="size-4 text-blue-700" />
            ) : null}
          </DropdownMenuItem>

          {categories.map((category) => {
            const isSelected = category.maDanhMuc === selectedCategoryId;

            return (
              <DropdownMenuItem
                key={category.maDanhMuc}
                render={
                  <Link
                    href={`/?category=${encodeURIComponent(category.maDanhMuc)}`}
                    aria-current={isSelected ? "page" : undefined}
                  />
                }
                className="min-h-10 cursor-pointer justify-between gap-3 px-2.5 py-2 text-sm text-slate-700 focus:bg-blue-50 focus:text-blue-700"
              >
                {category.tenDanhMuc}
                {isSelected ? (
                  <Check aria-hidden="true" className="size-4 text-blue-700" />
                ) : null}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
