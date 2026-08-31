import { Award, Code2, Rocket } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AuthLayoutProps = {
  children: ReactNode;
  titleId: string;
  isWide?: boolean;
};

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3" aria-label="CyberSoft">
      <span
        className={`grid place-items-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md ${compact ? "size-9" : "size-10"}`}
      >
        <Code2 aria-hidden="true" className={compact ? "size-5" : "size-6"} />
      </span>
      <span
        className={`font-bold tracking-tight ${compact ? "text-base text-slate-800" : "text-xl text-white"}`}
      >
        CYBERSOFT
      </span>
    </div>
  );
}

function LearningVisual() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto w-full max-w-md overflow-hidden rounded-2xl shadow-2xl"
    >
      <Image
        src="/images/e-learning.png"
        alt=""
        width={2048}
        height={2048}
        sizes="(max-width: 1024px) 100vw, 32rem"
        className="block h-auto w-full"
      />
    </div>
  );
}

export default function AuthLayout({
  children,
  titleId,
  isWide = false,
}: AuthLayoutProps) {
  return (
    <main
      className={cn(
        "grid min-h-dvh bg-slate-50",
        isWide ? "lg:grid-cols-12" : "lg:grid-cols-2",
      )}
    >
      <section
        aria-labelledby="hero-title"
        className={cn(
          "relative hidden overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 px-12 py-10 lg:flex",
          isWide && "lg:col-span-4 xl:col-span-5",
        )}
      >
        <div className="m-auto w-full max-w-lg pb-16">
          <LearningVisual />

          <div className="mt-10 text-center">
            <p className="mb-3 text-sm font-semibold tracking-widest text-blue-200 uppercase">
              CyberSoft Academy
            </p>
            <h1
              id="hero-title"
              className="text-3xl font-bold tracking-tight text-white"
            >
              Làm chủ công nghệ
            </h1>
            <p className="mx-auto mt-3 max-w-md text-lg leading-7 text-blue-100/80">
              Hệ thống đào tạo lập trình thực chiến giúp bạn trở thành kỹ sư
              phần mềm chuyên nghiệp.
            </p>
          </div>

          <div className="mt-8 flex items-center justify-center gap-8 text-sm font-semibold text-slate-200">
            <span className="flex items-center gap-2">
              <Award aria-hidden="true" className="size-5 text-blue-200" />
              Chứng chỉ quốc tế
            </span>
            <span className="flex items-center gap-2">
              <Rocket aria-hidden="true" className="size-5 text-blue-200" />
              Việc làm ngay
            </span>
          </div>
        </div>

        <div className="absolute bottom-10 left-10">
          <BrandMark />
        </div>
      </section>

      <section
        aria-labelledby={titleId}
        className={cn(
          "relative flex min-h-dvh min-w-0 items-center justify-center px-5 py-24 sm:px-10 lg:px-12 lg:py-10",
          isWide && "lg:col-span-8 xl:col-span-7",
        )}
      >
        <div className="absolute top-7 left-5 sm:left-10 lg:hidden">
          <BrandMark compact />
        </div>

        <div
          className={cn("w-full min-w-0", isWide ? "max-w-2xl" : "max-w-md")}
        >
          <Card className="gap-0 rounded-2xl border border-slate-200 bg-white py-0 shadow-xl ring-0">
            <CardContent className="p-6 sm:p-8">{children}</CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
