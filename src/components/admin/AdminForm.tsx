import { ArrowLeft, LoaderCircle, Save } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";

export const adminInputClassName =
  "h-12 border-slate-300 bg-slate-50 text-base text-slate-950 placeholder:text-slate-400 focus-visible:border-blue-600 focus-visible:bg-white focus-visible:ring-blue-100 aria-invalid:border-red-500 aria-invalid:ring-red-100 md:text-sm";

export const adminLabelClassName = "mb-2 text-sm font-semibold text-slate-900";

export const adminSelectClassName =
  "h-12 w-full border-slate-300 bg-slate-50 px-3 text-base focus-visible:border-blue-600 focus-visible:ring-blue-100 aria-invalid:border-red-500 aria-invalid:ring-red-100 md:text-sm";

type AdminFormFieldErrorProps = {
  id: string;
  message?: string;
};

export function AdminFormFieldError({ id, message }: AdminFormFieldErrorProps) {
  return (
    <div className="min-h-5 pt-1">
      <FieldError
        id={id}
        errors={[message ? { message } : undefined]}
        className="text-xs leading-4 text-red-700"
      />
    </div>
  );
}

export function AdminFormLoading({ message }: { message: string }) {
  return (
    <div className="grid min-h-80 place-items-center rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <LoaderCircle
          aria-hidden="true"
          className="size-5 animate-spin motion-reduce:animate-none"
        />
        {message}
      </div>
    </div>
  );
}

type AdminFormActionsProps = {
  cancelHref: string;
  isPending: boolean;
  pendingLabel?: string;
  saveLabel: string;
};

export function AdminFormActions({
  cancelHref,
  isPending,
  pendingLabel = "Đang lưu...",
  saveLabel,
}: AdminFormActionsProps) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:justify-end md:px-8">
      <Button
        render={<Link href={cancelHref} />}
        nativeButton={false}
        variant="ghost"
        className="min-h-11 text-slate-700"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Hủy
      </Button>
      <Button
        type="submit"
        disabled={isPending}
        className="min-h-11 bg-blue-600 px-5 text-white shadow-sm hover:bg-blue-700"
      >
        {isPending ? (
          <LoaderCircle
            aria-hidden="true"
            className="size-4 animate-spin motion-reduce:animate-none"
          />
        ) : (
          <Save aria-hidden="true" className="size-4" />
        )}
        {isPending ? pendingLabel : saveLabel}
      </Button>
    </div>
  );
}
