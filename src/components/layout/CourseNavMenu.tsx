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
            ? "border-blue-600 font-semibold text-blue-700 data-popup-open:bg-blue-50 data-popup-open:text-blue-800"
            : "border-transparent text-slate-700 hover:border-blue-200 hover:bg-blue-50/70 hover:text-blue-700 data-popup-open:bg-blue-50 data-popup-open:text-blue-800",
        )}
      >
        Khóa học
        <ChevronDown
          aria-hidden="true"
          className="size-3.5 transition-transform duration-200 data-popup-open:rotate-180 motion-reduce:transition-none"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="w-80 max-w-[calc(100vw-2rem)]"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>Danh mục khóa học</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            render={
              <Link
                href="/"
                aria-current={!selectedCategoryId ? "page" : undefined}
              />
            }
            className={
              !selectedCategoryId ? "bg-blue-50 text-blue-800" : undefined
            }
          >
            Tất cả khóa học
            {!selectedCategoryId ? (
              <Check
                aria-hidden="true"
                className="size-4 shrink-0 text-blue-700"
              />
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
                className={isSelected ? "bg-blue-50 text-blue-800" : undefined}
              >
                {category.tenDanhMuc}
                {isSelected ? (
                  <Check
                    aria-hidden="true"
                    className="size-4 shrink-0 text-blue-700"
                  />
                ) : null}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
