import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import FeedbackAlert, {
  type FeedbackType,
} from "@/components/ui/feedback-alert";
import { cn } from "@/lib/utils";

type SelectableEntityCardProps = {
  icon: LucideIcon;
  iconShape?: "circle" | "rounded";
  isSelected: boolean;
  onSelect: () => void;
  primaryText: string;
  secondaryClassName?: string;
  secondaryText: string;
};

export function SelectableEntityCard({
  icon: Icon,
  iconShape = "circle",
  isSelected,
  onSelect,
  primaryText,
  secondaryClassName,
  secondaryText,
}: SelectableEntityCardProps) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onSelect}
      className={cn(
        "flex min-h-16 w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
        isSelected
          ? "border-blue-600 bg-blue-50"
          : "border-slate-200 hover:border-blue-300 hover:bg-slate-50",
      )}
    >
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center bg-slate-100 text-slate-600",
          iconShape === "circle" ? "rounded-full" : "rounded-xl",
        )}
      >
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-slate-900">
          {primaryText}
        </span>
        <span
          className={cn(
            "block truncate text-xs text-slate-500",
            secondaryClassName,
          )}
        >
          {secondaryText}
        </span>
      </span>
    </button>
  );
}

type EnrollmentWorkspaceProps = {
  badge: string;
  children: ReactNode;
  emptyDescription: string;
  emptyIcon: LucideIcon;
  emptyTitle: string;
  errorMessage: string;
  feedback?: { message: string; type: FeedbackType } | null;
  hasError: boolean;
  isLoading: boolean;
  loadingMessage: string;
  selected: boolean;
  summary: string;
  title: string;
  titleId: string;
};

export default function EnrollmentWorkspace({
  badge,
  children,
  emptyDescription,
  emptyIcon: EmptyIcon,
  emptyTitle,
  errorMessage,
  feedback,
  hasError,
  isLoading,
  loadingMessage,
  selected,
  summary,
  title,
  titleId,
}: EnrollmentWorkspaceProps) {
  if (!selected) {
    return (
      <div className="mt-6 grid min-h-64 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
        <div>
          <EmptyIcon
            aria-hidden="true"
            className="mx-auto size-12 text-slate-300"
          />
          <p className="mt-3 font-semibold text-slate-800">{emptyTitle}</p>
          <p className="mt-1 text-sm text-slate-500">{emptyDescription}</p>
        </div>
      </div>
    );
  }

  return (
    <section aria-labelledby={titleId} className="mt-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id={titleId} className="text-xl font-bold text-slate-950">
            {title}
          </h2>
          <p className="mt-1 text-sm text-slate-600">{summary}</p>
        </div>
        <span className="w-fit rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
          {badge}
        </span>
      </div>

      {feedback ? (
        <FeedbackAlert type={feedback.type} className="mb-4">
          {feedback.message}
        </FeedbackAlert>
      ) : null}
      {hasError ? (
        <FeedbackAlert type="error" className="mb-4">
          {errorMessage}
        </FeedbackAlert>
      ) : null}

      {isLoading ? (
        <div className="grid min-h-64 place-items-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-500">
          {loadingMessage}
        </div>
      ) : (
        children
      )}
    </section>
  );
}
