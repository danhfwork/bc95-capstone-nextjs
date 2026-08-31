"use client";

import { X, type LucideIcon } from "lucide-react";
import { useState, type ReactElement, type ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type ConfirmationDialogProps = {
  actionLabel: ReactNode;
  description: ReactNode;
  icon: LucideIcon;
  isPending: boolean;
  itemIcon?: LucideIcon;
  itemLabel: ReactNode;
  itemName: ReactNode;
  onConfirm: () => void | Promise<void>;
  pendingLabel: ReactNode;
  title: ReactNode;
  trigger: ReactElement;
};

export default function ConfirmationDialog({
  actionLabel,
  description,
  icon: HeaderIcon,
  isPending,
  itemIcon: ItemIcon = HeaderIcon,
  itemLabel,
  itemName,
  onConfirm,
  pendingLabel,
  title,
  trigger,
}: ConfirmationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger render={trigger} />

      <AlertDialogContent
        onBackdropClick={() => setIsOpen(false)}
        className="w-[calc(100%-2rem)] max-w-lg gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl ring-0 sm:max-w-lg"
      >
        <AlertDialogHeader className="relative flex flex-row items-start gap-3 border-b border-slate-100 p-6 pr-16 text-left">
          <AlertDialogMedia className="mb-0 size-11 shrink-0 rounded-full bg-red-50 text-red-600">
            <HeaderIcon aria-hidden="true" className="size-5" />
          </AlertDialogMedia>
          <div className="min-w-0">
            <AlertDialogTitle className="text-lg leading-7 font-bold text-slate-950">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-2 text-sm leading-6 text-slate-600">
              {description}
            </AlertDialogDescription>
          </div>
          <AlertDialogCancel
            aria-label="Đóng hộp thoại"
            title="Đóng"
            size="icon"
            variant="ghost"
            className="absolute top-3 right-3 size-11 cursor-pointer rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:border-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900/30 focus-visible:ring-offset-2"
          >
            <X aria-hidden="true" className="size-5" />
          </AlertDialogCancel>
        </AlertDialogHeader>

        <div className="px-6 py-5">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            {itemLabel}
          </p>
          <div className="mt-2 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50/60 px-4 py-3">
            <ItemIcon
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-red-600"
            />
            <p className="min-w-0 break-words text-sm leading-5 font-semibold text-slate-900">
              {itemName}
            </p>
          </div>
        </div>

        <AlertDialogFooter className="m-0 flex-col-reverse gap-3 rounded-b-2xl border-t border-slate-100 bg-slate-50 p-4 sm:flex-row sm:justify-end">
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            className="h-11 w-full cursor-pointer border-red-600 bg-red-600 px-4 font-semibold text-white hover:bg-red-700 focus-visible:border-red-700 focus-visible:ring-2 focus-visible:ring-red-600/30 focus-visible:ring-offset-2 sm:w-auto"
            onClick={() => {
              void onConfirm();
            }}
          >
            <HeaderIcon aria-hidden="true" className="size-4" />
            {isPending ? pendingLabel : actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
