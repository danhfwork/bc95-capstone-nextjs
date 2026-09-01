"use client";

import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const authInputClassName =
  "h-12 bg-slate-50 pl-11 text-base text-slate-900 placeholder:text-slate-500 focus-visible:border-blue-600 focus-visible:bg-white focus-visible:ring-blue-100 aria-invalid:border-red-500 aria-invalid:ring-red-100 md:text-base";

export const authFieldLabelClassName =
  "mb-2 text-sm leading-5 font-semibold text-slate-900";

type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, "type"> & {
  hidePasswordLabel?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  showPasswordLabel?: string;
  toggleClassName?: string;
};

export default function PasswordInput({
  className,
  hidePasswordLabel = "Ẩn mật khẩu",
  icon: Icon,
  iconClassName,
  showPasswordLabel = "Hiện mật khẩu",
  toggleClassName,
  ...props
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      {Icon ? (
        <Icon
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute top-1/2 left-3 z-10 size-5 -translate-y-1/2 text-slate-500",
            iconClassName,
          )}
        />
      ) : null}
      <Input
        {...props}
        type={isVisible ? "text" : "password"}
        className={cn(Icon && "pl-11", "pr-12", className)}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={isVisible ? hidePasswordLabel : showPasswordLabel}
        aria-pressed={isVisible}
        className={cn(
          "absolute inset-y-1 right-1 h-auto w-10 cursor-pointer text-slate-500 hover:bg-slate-100 hover:text-slate-900",
          toggleClassName,
        )}
        onClick={() => setIsVisible((current) => !current)}
      >
        {isVisible ? (
          <EyeOff aria-hidden="true" className="size-5" />
        ) : (
          <Eye aria-hidden="true" className="size-5" />
        )}
      </Button>
    </div>
  );
}
