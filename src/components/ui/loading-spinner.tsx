import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

type LoadingSpinnerProps = {
  className?: string;
  fullPage?: boolean;
  label?: string;
};

export default function LoadingSpinner({
  className,
  fullPage = false,
  label = "Đang tải...",
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center justify-center gap-2 text-sm font-medium text-slate-600",
        fullPage && "min-h-[50vh] w-full flex-col text-base",
        className,
      )}
    >
      <LoaderCircle
        aria-hidden="true"
        className="size-5 animate-spin text-blue-700 motion-reduce:animate-none"
      />
      <span>{label}</span>
    </div>
  );
}
