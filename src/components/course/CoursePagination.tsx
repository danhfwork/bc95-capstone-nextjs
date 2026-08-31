import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";

type CoursePaginationProps = {
  categoryId?: string;
  currentPage: number;
  totalPages: number;
  searchQuery: string;
};

type PageItem = number | "start-ellipsis" | "end-ellipsis";

function getPageItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "end-ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "start-ellipsis",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "start-ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "end-ellipsis",
    totalPages,
  ];
}

function getPageHref(
  page: number,
  searchQuery: string,
  categoryId?: string,
): string {
  const params = new URLSearchParams();

  if (categoryId) {
    params.set("category", categoryId);
  }

  if (searchQuery) {
    params.set("q", searchQuery);
  }

  if (page > 1) {
    params.set("page", page.toString());
  }

  const queryString = params.toString();
  return queryString ? `/?${queryString}` : "/";
}

export default function CoursePagination({
  categoryId,
  currentPage,
  totalPages,
  searchQuery,
}: CoursePaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pageItems = getPageItems(currentPage, totalPages);
  const previousHref = getPageHref(currentPage - 1, searchQuery, categoryId);
  const nextHref = getPageHref(currentPage + 1, searchQuery, categoryId);

  return (
    <Pagination className="mt-10 sm:mt-12">
      <div className="flex items-center justify-center gap-2 sm:hidden">
        <Button
          render={currentPage > 1 ? <Link href={previousHref} /> : undefined}
          nativeButton={currentPage <= 1}
          type={currentPage > 1 ? undefined : "button"}
          variant="outline"
          size="icon"
          disabled={currentPage <= 1}
          aria-label="Đến trang trước"
          className="size-10 cursor-pointer border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-blue-600 disabled:cursor-not-allowed"
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
        </Button>
        <span className="min-w-16 text-center text-sm font-medium tabular-nums text-slate-700">
          Trang {currentPage}/{totalPages}
        </span>
        <Button
          render={
            currentPage < totalPages ? <Link href={nextHref} /> : undefined
          }
          nativeButton={currentPage >= totalPages}
          type={currentPage < totalPages ? undefined : "button"}
          variant="outline"
          size="icon"
          disabled={currentPage >= totalPages}
          aria-label="Đến trang sau"
          className="size-10 cursor-pointer border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-blue-600 disabled:cursor-not-allowed"
        >
          <ChevronRight aria-hidden="true" className="size-4" />
        </Button>
      </div>

      <PaginationContent className="hidden gap-1.5 sm:flex">
        <PaginationItem>
          <Button
            render={currentPage > 1 ? <Link href={previousHref} /> : undefined}
            nativeButton={currentPage <= 1}
            type={currentPage > 1 ? undefined : "button"}
            variant="outline"
            size="icon"
            disabled={currentPage <= 1}
            aria-label="Đến trang trước"
            className="size-10 cursor-pointer border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-blue-600 disabled:cursor-not-allowed"
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
          </Button>
        </PaginationItem>

        {pageItems.map((pageItem) => {
          if (typeof pageItem !== "number") {
            return (
              <PaginationItem key={pageItem}>
                <PaginationEllipsis className="size-10 text-slate-500" />
              </PaginationItem>
            );
          }

          const isCurrentPage = pageItem === currentPage;

          return (
            <PaginationItem key={pageItem}>
              <Button
                render={
                  <Link
                    href={getPageHref(pageItem, searchQuery, categoryId)}
                    scroll
                  />
                }
                nativeButton={false}
                variant={isCurrentPage ? "default" : "outline"}
                size="icon"
                aria-label={`Đến trang ${pageItem}`}
                aria-current={isCurrentPage ? "page" : undefined}
                className={
                  isCurrentPage
                    ? "size-10 cursor-pointer bg-blue-700 text-white hover:bg-blue-800 focus-visible:ring-blue-600"
                    : "size-10 cursor-pointer border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-blue-600"
                }
              >
                <span className="tabular-nums">{pageItem}</span>
              </Button>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <Button
            render={
              currentPage < totalPages ? <Link href={nextHref} /> : undefined
            }
            nativeButton={currentPage >= totalPages}
            type={currentPage < totalPages ? undefined : "button"}
            variant="outline"
            size="icon"
            disabled={currentPage >= totalPages}
            aria-label="Đến trang sau"
            className="size-10 cursor-pointer border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-blue-600 disabled:cursor-not-allowed"
          >
            <ChevronRight aria-hidden="true" className="size-4" />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
