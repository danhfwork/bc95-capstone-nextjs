import { isAxiosError } from "axios";
import {
  CalendarDays,
  ChevronRight,
  Eye,
  UserRound,
  UsersRound,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

import {
  getCourseById,
  getCourseCategories,
  type ApiCourseCategory,
} from "@/app/lib/api";
import CourseEnrollmentButton from "@/components/course/CourseEnrollmentButton";
import CourseImage from "@/components/course/CourseImage";
import {
  getCourseImageUrl,
  getCoursePlainText,
  getCreatorInitial,
} from "@/components/course/courseContent";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type CourseDetailPageProps = {
  params: Promise<{ courseId: string }>;
};

const defaultMetadata: Metadata = {
  title: "Chi tiết khóa học | CyberSoft",
  description: "Thông tin chi tiết khóa học tại CyberSoft Academy.",
};

const getCourse = cache((courseId: string) => getCourseById(courseId));

export async function generateMetadata({
  params,
}: CourseDetailPageProps): Promise<Metadata> {
  const { courseId } = await params;

  if (!courseId.trim()) {
    return {
      title: "Không tìm thấy khóa học | CyberSoft",
      robots: { index: false },
    };
  }

  try {
    const course = await getCourse(courseId);

    return {
      title: `${course.tenKhoaHoc} | CyberSoft`,
      description: getCoursePlainText(course.moTa).slice(0, 160),
    };
  } catch (error: unknown) {
    if (isMissingCourseError(error)) {
      return {
        title: "Không tìm thấy khóa học | CyberSoft",
        robots: { index: false },
      };
    }

    return defaultMetadata;
  }
}

function isMissingCourseError(error: unknown): boolean {
  return (
    isAxiosError(error) &&
    (error.response?.status === 400 || error.response?.status === 404)
  );
}

function CourseLoadError({
  categories,
  retryHref,
}: {
  categories: ApiCourseCategory[];
  retryHref: string;
}) {
  return (
    <>
      <Header activeItem="courses" categories={categories} />
      <main
        id="main-content"
        className="grid flex-1 place-items-center bg-slate-50 px-4 py-16"
      >
        <section className="w-full max-w-xl rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-slate-950">
            Không thể tải khóa học
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Hệ thống đang tạm thời không phản hồi. Vui lòng thử lại sau ít phút.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              render={<Link href={retryHref} />}
              nativeButton={false}
              size="lg"
              className="h-11 bg-blue-700 px-5 text-white hover:bg-blue-800 focus-visible:border-blue-700 focus-visible:ring-blue-600"
            >
              Thử lại
            </Button>
            <Button
              render={<Link href="/" />}
              nativeButton={false}
              variant="outline"
              size="lg"
              className="h-11 px-5"
            >
              Về danh sách khóa học
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const { courseId } = await params;

  if (!courseId.trim()) {
    notFound();
  }

  const [courseResult, categoriesResult] = await Promise.allSettled([
    getCourse(courseId),
    getCourseCategories(),
  ]);
  const categories =
    categoriesResult.status === "fulfilled" ? categoriesResult.value : [];

  if (courseResult.status === "rejected") {
    if (isMissingCourseError(courseResult.reason)) {
      notFound();
    }

    return (
      <CourseLoadError
        categories={categories}
        retryHref={`/courses/${encodeURIComponent(courseId)}`}
      />
    );
  }

  const course = courseResult.value;
  const categoryId = course.danhMucKhoaHoc.maDanhMucKhoahoc;
  const categoryName = course.danhMucKhoaHoc.tenDanhMucKhoaHoc;
  const categoryHref = `/?category=${encodeURIComponent(categoryId)}`;
  const creatorName = course.nguoiTao.hoTen.trim();
  const description = getCoursePlainText(course.moTa);
  const imageUrl = getCourseImageUrl(course.hinhAnh);

  return (
    <>
      <Header
        activeItem="courses"
        categories={categories}
        selectedCategoryId={categoryId}
      />

      <main id="main-content" className="flex-1 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <nav aria-label="Đường dẫn trang" className="mb-6">
            <ol className="flex flex-wrap items-center gap-2 text-sm leading-6 text-slate-600">
              <li>
                <Link
                  href="/"
                  className="rounded-sm hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  Trang chủ
                </Link>
              </li>
              <li aria-hidden="true" className="text-slate-400">
                <ChevronRight className="size-4" />
              </li>
              <li>
                <Link
                  href={categoryHref}
                  className="rounded-sm hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  {categoryName}
                </Link>
              </li>
              <li aria-hidden="true" className="text-slate-400">
                <ChevronRight className="size-4" />
              </li>
              <li
                aria-current="page"
                className="min-w-0 break-words font-semibold text-slate-900"
              >
                {course.tenKhoaHoc}
              </li>
            </ol>
          </nav>

          <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
            <article className="min-w-0 lg:col-span-2">
              <p className="w-fit rounded-full bg-blue-600 px-3 py-1 text-sm font-semibold text-white">
                {categoryName}
              </p>
              <h1 className="mt-5 break-words text-3xl leading-tight font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                {course.tenKhoaHoc}
              </h1>

              <dl className="mt-8 grid gap-4 border-y border-slate-200 py-6 sm:grid-cols-2 xl:grid-cols-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="grid size-11 shrink-0 place-items-center rounded-full bg-slate-800 text-sm font-bold text-white"
                  >
                    {getCreatorInitial(creatorName)}
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs font-medium text-slate-500">
                      Người tạo
                    </dt>
                    <dd className="truncate text-sm font-semibold text-slate-950">
                      {creatorName}
                    </dd>
                    <dd className="truncate text-xs leading-5 text-slate-500">
                      {course.nguoiTao.tenLoaiNguoiDung}
                    </dd>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Eye aria-hidden="true" className="size-5 text-blue-700" />
                  <div>
                    <dt className="text-xs font-medium text-slate-500">
                      Lượt xem
                    </dt>
                    <dd className="text-sm font-semibold tabular-nums text-slate-950">
                      {course.luotXem.toLocaleString("vi-VN")}
                    </dd>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <UsersRound
                    aria-hidden="true"
                    className="size-5 text-blue-700"
                  />
                  <div>
                    <dt className="text-xs font-medium text-slate-500">
                      Học viên
                    </dt>
                    <dd className="text-sm font-semibold tabular-nums text-slate-950">
                      {course.soLuongHocVien.toLocaleString("vi-VN")}
                    </dd>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CalendarDays
                    aria-hidden="true"
                    className="size-5 text-blue-700"
                  />
                  <div>
                    <dt className="text-xs font-medium text-slate-500">
                      Ngày tạo
                    </dt>
                    <dd className="text-sm font-semibold tabular-nums text-slate-950">
                      {course.ngayTao}
                    </dd>
                  </div>
                </div>
              </dl>

              {description ? (
                <section
                  aria-labelledby="course-description-title"
                  className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                >
                  <h2
                    id="course-description-title"
                    className="text-2xl font-bold text-slate-950"
                  >
                    Mô tả khóa học
                  </h2>
                  <p className="mt-4 max-w-3xl whitespace-pre-line break-words text-base leading-7 text-slate-700">
                    {description}
                  </p>
                </section>
              ) : null}
            </article>

            <aside aria-label="Đăng ký khóa học" className="lg:sticky lg:top-6">
              <Card className="gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white py-0 shadow-lg ring-0">
                <div className="relative aspect-video overflow-hidden bg-blue-50">
                  <CourseImage
                    courseName={course.tenKhoaHoc}
                    imageUrl={imageUrl}
                    preload
                    sizes="(max-width: 1023px) calc(100vw - 32px), 32vw"
                  />
                </div>
                <CardContent className="p-5 sm:p-6">
                  <div className="mb-5 flex items-start gap-3 rounded-xl bg-blue-50 p-4">
                    <UserRound
                      aria-hidden="true"
                      className="mt-0.5 size-5 shrink-0 text-blue-700"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-500">
                        Khóa học được tạo bởi
                      </p>
                      <p className="mt-1 break-words text-sm font-semibold text-slate-950">
                        {creatorName}
                      </p>
                    </div>
                  </div>
                  <CourseEnrollmentButton courseId={course.maKhoaHoc} />
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
