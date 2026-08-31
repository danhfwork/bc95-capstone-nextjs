import type { Metadata } from "next";
import Link from "next/link";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Không tìm thấy khóa học | CyberSoft",
  robots: { index: false },
};

export default function CourseNotFound() {
  return (
    <>
      <Header activeItem="courses" />
      <main
        id="main-content"
        className="grid flex-1 place-items-center bg-slate-50 px-4 py-16"
      >
        <section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
          <p className="text-sm font-semibold tracking-wide text-blue-700 uppercase">
            Không tìm thấy
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Khóa học không tồn tại
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Khóa học có thể đã được xóa hoặc đường dẫn chưa chính xác.
          </p>
          <Button
            render={<Link href="/" />}
            nativeButton={false}
            size="lg"
            className="mt-6 h-11 bg-blue-700 px-5 text-white hover:bg-blue-800 focus-visible:border-blue-700 focus-visible:ring-blue-600"
          >
            Xem danh sách khóa học
          </Button>
        </section>
      </main>
      <Footer />
    </>
  );
}
