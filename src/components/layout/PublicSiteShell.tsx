import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import Footer from "@/components/layout/Footer";
import Header, { type HeaderProps } from "@/components/layout/Header";
import { cn } from "@/lib/utils";

type PublicSiteShellProps = {
  children: ReactNode;
  headerProps?: HeaderProps;
};

export default function PublicSiteShell({
  children,
  headerProps,
}: PublicSiteShellProps) {
  return (
    <>
      <Header {...headerProps} />
      {children}
      <Footer />
    </>
  );
}

type BreadcrumbItem = {
  href?: string;
  label: string;
};

type BreadcrumbsProps = {
  className?: string;
  items: BreadcrumbItem[];
};

const breadcrumbLinkClassName =
  "rounded-sm hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2";

export function Breadcrumbs({ className, items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Đường dẫn trang" className={className}>
      <ol className="flex flex-wrap items-center gap-2 text-sm leading-6 text-slate-600">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;

          return (
            <li
              key={`${item.href ?? "current"}-${item.label}`}
              className="contents"
            >
              {index > 0 ? (
                <ChevronRight
                  aria-hidden="true"
                  className="size-4 shrink-0 text-slate-400"
                />
              ) : null}
              {item.href && !isCurrent ? (
                <Link href={item.href} className={breadcrumbLinkClassName}>
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isCurrent ? "page" : undefined}
                  className={cn(
                    "min-w-0 break-words",
                    isCurrent && "font-semibold text-slate-900",
                  )}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

type CenteredStatePanelProps = ComponentProps<"section">;

export function CenteredStatePanel({
  children,
  className,
  ...props
}: CenteredStatePanelProps) {
  return (
    <main
      id="main-content"
      className="grid flex-1 place-items-center bg-slate-50 px-4 py-16"
    >
      <section
        className={cn(
          "w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8",
          className,
        )}
        {...props}
      >
        {children}
      </section>
    </main>
  );
}
