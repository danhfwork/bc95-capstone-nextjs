import { Search, type LucideIcon } from "lucide-react";
import type { FormEventHandler, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AdminPageProps = {
  children: ReactNode;
  maxWidth?: "5xl" | "7xl";
};

export function AdminPage({ children, maxWidth = "7xl" }: AdminPageProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-8 sm:px-6 lg:px-8 lg:py-10",
        maxWidth === "5xl" ? "max-w-5xl" : "max-w-7xl",
      )}
    >
      {children}
    </div>
  );
}

type AdminPageHeaderProps = {
  action?: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
  titleClassName?: string;
};

export function AdminPageHeader({
  action,
  eyebrow,
  title,
  titleClassName,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-sm font-semibold text-blue-700">{eyebrow}</p>
        ) : null}
        <h1
          className={cn(
            "mt-1 text-3xl font-bold tracking-tight text-slate-950",
            titleClassName,
          )}
        >
          {title}
        </h1>
      </div>
      {action}
    </div>
  );
}

type AdminSearchFormProps = {
  ariaLabel: string;
  buttonVariant?: "default" | "outline";
  className?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  placeholder: string;
  value: string;
};

export function AdminSearchForm({
  ariaLabel,
  buttonVariant = "default",
  className,
  disabled = false,
  onChange,
  onSubmit,
  placeholder,
  value,
}: AdminSearchFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      role="search"
      className={cn("flex w-full max-w-2xl gap-2", className)}
    >
      <div className="relative flex-1">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
        />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={ariaLabel}
          placeholder={placeholder}
          className="h-11 border-slate-300 bg-slate-50 pl-9 text-base focus-visible:border-blue-600 focus-visible:ring-blue-100 md:text-sm"
        />
      </div>
      <Button
        type="submit"
        variant={buttonVariant}
        disabled={disabled}
        className={cn(
          "min-h-11 px-4",
          buttonVariant === "outline"
            ? "border-slate-300"
            : "bg-blue-600 text-white hover:bg-blue-700",
        )}
      >
        Tìm kiếm
      </Button>
    </form>
  );
}

type AdminCollectionStateProps = {
  children: ReactNode;
  emptyDescription: string;
  emptyIcon: LucideIcon;
  emptyTitle: string;
  errorMessage: string;
  isEmpty: boolean;
  isError: boolean;
  isPending: boolean;
  loadingMessage?: string;
  onRetry: () => void;
};

export function AdminCollectionState({
  children,
  emptyDescription,
  emptyIcon: EmptyIcon,
  emptyTitle,
  errorMessage,
  isEmpty,
  isError,
  isPending,
  loadingMessage = "Đang tải danh sách...",
  onRetry,
}: AdminCollectionStateProps) {
  if (isPending) {
    return (
      <div className="grid min-h-72 place-items-center text-sm text-slate-500">
        {loadingMessage}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="grid min-h-72 place-items-center p-6 text-center text-sm text-red-700"
      >
        <div>
          <p>{errorMessage}</p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={onRetry}
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="grid min-h-72 place-items-center p-6 text-center">
        <div>
          <EmptyIcon
            aria-hidden="true"
            className="mx-auto size-10 text-slate-300"
          />
          <p className="mt-3 font-semibold text-slate-800">{emptyTitle}</p>
          <p className="mt-1 text-sm text-slate-500">{emptyDescription}</p>
        </div>
      </div>
    );
  }

  return children;
}
