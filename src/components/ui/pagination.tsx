import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex items-center gap-0.5", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">;

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <Button
      variant={isActive ? "outline" : "ghost"}
      size={size}
      className={cn(className)}
      nativeButton={false}
      render={
        <a
          aria-current={isActive ? "page" : undefined}
          data-slot="pagination-link"
          data-active={isActive}
          {...props}
        />
      }
    />
  );
}

function PaginationPrevious({
  className,
  text = "Previous",
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("pl-1.5!", className)}
      {...props}
    >
      <ChevronLeftIcon data-icon="inline-start" />
      <span className="hidden sm:block">{text}</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  text = "Next",
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("pr-1.5!", className)}
      {...props}
    >
      <span className="hidden sm:block">{text}</span>
      <ChevronRightIcon data-icon="inline-end" />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-8 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <MoreHorizontalIcon />
      <span className="sr-only">More pages</span>
    </span>
  );
}

type PaginationPageItem = number | "start-ellipsis" | "end-ellipsis";

type PaginationControlsProps = {
  className?: string;
  currentPage: number;
  getPageHref?: (page: number) => string;
  isPending?: boolean;
  onPageChange?: (page: number) => void;
  totalPages: number;
};

type PaginationButtonsProps = {
  className?: string;
  currentPage: number;
  getPageHref?: (page: number) => string;
  isPending?: boolean;
  nextAriaLabel?: string;
  onPageChange?: (page: number) => void;
  previousAriaLabel?: string;
  summary?: React.ReactNode;
  totalPages: number;
};

type PaginationControlButtonProps = {
  ariaLabel: string;
  children: React.ReactNode;
  className: string;
  disabled?: boolean;
  href?: string;
  isCurrentPage?: boolean;
  isPending?: boolean;
  onPageChange?: (page: number) => void;
  page: number;
};

function getPaginationPageItems(
  currentPage: number,
  totalPages: number,
): PaginationPageItem[] {
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

function PaginationControlButton({
  ariaLabel,
  children,
  className,
  disabled = false,
  href,
  isCurrentPage = false,
  isPending = false,
  onPageChange,
  page,
}: PaginationControlButtonProps) {
  const isLink = Boolean(href);

  return (
    <Button
      render={href ? <Link href={href} /> : undefined}
      nativeButton={!isLink}
      type={isLink ? undefined : "button"}
      variant={isCurrentPage ? "default" : "outline"}
      size="icon"
      disabled={disabled || isPending}
      onClick={!isLink && onPageChange ? () => onPageChange(page) : undefined}
      aria-label={ariaLabel}
      aria-current={isCurrentPage ? "page" : undefined}
      className={className}
    >
      {children}
    </Button>
  );
}

function PaginationButtons({
  className,
  currentPage,
  getPageHref,
  isPending = false,
  nextAriaLabel = "Đến trang sau",
  onPageChange,
  previousAriaLabel = "Đến trang trước",
  summary,
  totalPages,
}: PaginationButtonsProps) {
  const previousPage = currentPage - 1;
  const nextPage = currentPage + 1;
  const navigationButtonClass =
    "size-10 cursor-pointer border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-blue-600 disabled:cursor-not-allowed";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <PaginationControlButton
        page={previousPage}
        href={currentPage > 1 ? getPageHref?.(previousPage) : undefined}
        onPageChange={onPageChange}
        disabled={currentPage <= 1}
        isPending={isPending}
        ariaLabel={previousAriaLabel}
        className={navigationButtonClass}
      >
        <ChevronLeftIcon aria-hidden="true" className="size-4" />
      </PaginationControlButton>
      {summary}
      <PaginationControlButton
        page={nextPage}
        href={currentPage < totalPages ? getPageHref?.(nextPage) : undefined}
        onPageChange={onPageChange}
        disabled={currentPage >= totalPages}
        isPending={isPending}
        ariaLabel={nextAriaLabel}
        className={navigationButtonClass}
      >
        <ChevronRightIcon aria-hidden="true" className="size-4" />
      </PaginationControlButton>
    </div>
  );
}

function PaginationControls({
  className,
  currentPage,
  getPageHref,
  isPending = false,
  onPageChange,
  totalPages,
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pageItems = getPaginationPageItems(currentPage, totalPages);
  const previousPage = currentPage - 1;
  const nextPage = currentPage + 1;
  const navigationButtonClass =
    "size-10 cursor-pointer border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-blue-600 disabled:cursor-not-allowed";

  return (
    <Pagination className={className}>
      <PaginationButtons
        className="justify-center sm:hidden"
        currentPage={currentPage}
        totalPages={totalPages}
        getPageHref={getPageHref}
        isPending={isPending}
        onPageChange={onPageChange}
        summary={
          <span className="min-w-16 text-center text-sm font-medium tabular-nums text-slate-700">
            Trang {currentPage}/{totalPages}
          </span>
        }
      />

      <PaginationContent className="hidden gap-1.5 sm:flex">
        <PaginationItem>
          <PaginationControlButton
            page={previousPage}
            href={currentPage > 1 ? getPageHref?.(previousPage) : undefined}
            onPageChange={onPageChange}
            disabled={currentPage <= 1}
            isPending={isPending}
            ariaLabel="Đến trang trước"
            className={navigationButtonClass}
          >
            <ChevronLeftIcon aria-hidden="true" className="size-4" />
          </PaginationControlButton>
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
              <PaginationControlButton
                page={pageItem}
                href={getPageHref?.(pageItem)}
                onPageChange={onPageChange}
                isCurrentPage={isCurrentPage}
                isPending={isPending}
                ariaLabel={`Đến trang ${pageItem}`}
                className={
                  isCurrentPage
                    ? "size-10 cursor-pointer bg-blue-700 text-white hover:bg-blue-800 focus-visible:ring-blue-600"
                    : navigationButtonClass
                }
              >
                <span className="tabular-nums">{pageItem}</span>
              </PaginationControlButton>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <PaginationControlButton
            page={nextPage}
            href={
              currentPage < totalPages ? getPageHref?.(nextPage) : undefined
            }
            onPageChange={onPageChange}
            disabled={currentPage >= totalPages}
            isPending={isPending}
            ariaLabel="Đến trang sau"
            className={navigationButtonClass}
          >
            <ChevronRightIcon aria-hidden="true" className="size-4" />
          </PaginationControlButton>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationButtons,
  PaginationControls,
  PaginationPrevious,
};
