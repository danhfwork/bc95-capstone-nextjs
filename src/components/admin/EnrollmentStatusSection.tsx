"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
  X,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

const PAGE_SIZE = 10;

type EnrollmentStatusSectionProps<Item> = {
  title: string;
  description: string;
  items: Item[];
  emptyMessage: string;
  actionLabel: string;
  isDestructive?: boolean;
  isPending: boolean;
  icon: LucideIcon;
  itemIcon?: LucideIcon;
  secondaryStyle?: "default" | "code";
  getItemKey: (item: Item) => string;
  getPrimaryText: (item: Item) => string;
  getSecondaryText: (item: Item) => string;
  onAction: (item: Item) => void;
};

export default function EnrollmentStatusSection<Item>({
  title,
  description,
  items,
  emptyMessage,
  actionLabel,
  isDestructive = false,
  isPending,
  icon: Icon,
  itemIcon: ItemIcon,
  secondaryStyle = "default",
  getItemKey,
  getPrimaryText,
  getSecondaryText,
  onAction,
}: EnrollmentStatusSectionProps<Item>) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(Math.ceil(items.length / PAGE_SIZE), 1);
  const currentPage = Math.min(page, totalPages);
  const firstItemIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleItems = items.slice(firstItemIndex, firstItemIndex + PAGE_SIZE);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-700">
            <Icon aria-hidden="true" className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-950">{title}</h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-slate-600">
                {items.length.toLocaleString("vi-VN")}
              </span>
            </div>
            <p className="mt-0.5 text-xs leading-5 text-slate-500">
              {description}
            </p>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="p-6 text-center text-sm text-slate-500">{emptyMessage}</p>
      ) : (
        <>
          <ul className="divide-y divide-slate-100">
            {visibleItems.map((item) => {
              const primaryText = getPrimaryText(item);
              const secondaryText = getSecondaryText(item);

              return (
                <li
                  key={getItemKey(item)}
                  className="flex items-center gap-3 p-4"
                >
                  {ItemIcon ? (
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600">
                      <ItemIcon aria-hidden="true" className="size-4" />
                    </span>
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <p
                      title={primaryText}
                      className="truncate text-sm font-semibold text-slate-900"
                    >
                      {primaryText}
                    </p>
                    <p
                      title={secondaryText}
                      className={`truncate text-xs text-slate-500 ${secondaryStyle === "code" ? "font-mono" : ""}`}
                    >
                      {secondaryText}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant={isDestructive ? "outline" : "default"}
                    size="sm"
                    aria-label={`${actionLabel} ${primaryText}`}
                    disabled={isPending}
                    className={
                      isDestructive
                        ? "min-h-10 border-red-200 text-red-700 hover:bg-red-50"
                        : "min-h-10 bg-blue-600 text-white hover:bg-blue-700"
                    }
                    onClick={() => onAction(item)}
                  >
                    {isDestructive ? (
                      <X aria-hidden="true" className="size-4" />
                    ) : (
                      <Check aria-hidden="true" className="size-4" />
                    )}
                    {actionLabel}
                  </Button>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
            <p
              aria-live="polite"
              className="text-xs tabular-nums text-slate-500"
            >
              Trang {currentPage}/{totalPages} · {firstItemIndex + 1}–
              {Math.min(firstItemIndex + PAGE_SIZE, items.length)} /{" "}
              {items.length.toLocaleString("vi-VN")}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={`Trang trước của ${title}`}
                disabled={currentPage <= 1 || isPending}
                onClick={() => setPage(Math.max(currentPage - 1, 1))}
                className="size-10 border-slate-300"
              >
                <ChevronLeft aria-hidden="true" className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={`Trang sau của ${title}`}
                disabled={currentPage >= totalPages || isPending}
                onClick={() => setPage(Math.min(currentPage + 1, totalPages))}
                className="size-10 border-slate-300"
              >
                <ChevronRight aria-hidden="true" className="size-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
