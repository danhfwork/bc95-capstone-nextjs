import { cn } from "@/lib/utils";

export type FeedbackType = "error" | "success" | "warning";

const feedbackStyles: Record<FeedbackType, string> = {
  error: "border-red-200 bg-red-50 text-red-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-300 bg-amber-50 text-amber-800",
};

type FeedbackAlertProps = React.ComponentProps<"div"> & {
  type: FeedbackType;
};

export default function FeedbackAlert({
  children,
  className,
  role,
  type,
  ...props
}: FeedbackAlertProps) {
  return (
    <div
      role={role ?? (type === "error" ? "alert" : "status")}
      className={cn(
        "rounded-xl border p-4 text-sm",
        feedbackStyles[type],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
