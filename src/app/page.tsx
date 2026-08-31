import { isAxiosError } from "axios";
import { SearchX, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import CourseCard from "@/components/course/CourseCard";
import CoursePagination from "@/components/course/CoursePagination";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import {
  getCourseCategories,
  getCoursesByCategory,
  getCoursesPaged,
  type ApiCourse,
  type ApiCourseCategory,
  type ApiPaginatedResponse,
} from "@/app/lib/api";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 8;

type HomePageProps = {
  searchParams: Promise<{
    category?: string | string[];
    page?: string | string[];
    q?: string | string[];
  }>;
};

export const metadata: Metadata = {
  title: "Danh mục khóa học | CyberSoft",
  description:
    "Khám phá các khóa học lập trình thực chiến tại CyberSoft Academy.",
};

function getFirstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function parsePageNumber(value: string | string[] | undefined): {
  value: number;
  isInvalid: boolean;
} {
  const rawValue = getFirstParam(value).trim();

  if (!rawValue) {
    return { value: 1, isInvalid: false };
  }

  const parsedPage = Number(rawValue);

  if (Number.isSafeInteger(parsedPage) && parsedPage > 0) {
    return { value: parsedPage, isInvalid: false };
  }

  return { value: 1, isInvalid: true };
}

function isNoResultsError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 404;
}

type CatalogHrefOptions = {
  categoryId?: string;
  page?: number;
  searchQuery?: string;
};

function getCatalogHref({
  categoryId,
  page = 1,
  searchQuery,
}: CatalogHrefOptions): string {
  const params = new URLSearchParams();

  if (categoryId) {
    params.set("category", categoryId);
  }

  if (searchQuery) {
    params.set("q", searchQuery);
  }

  if (page > 1) {
    params.set("page", page.toString());
  }

  const queryString = params.toString();
  return queryString ? `/?${queryString}` : "/";
}

function paginateCourses(
  courses: ApiCourse[],
  requestedPage: number,
  searchQuery: string,
): ApiPaginatedResponse<ApiCourse> {
  const normalizedQuery = searchQuery.toLocaleLowerCase("vi-VN");
  const filteredCourses = normalizedQuery
    ? courses.filter((course) =>
        course.tenKhoaHoc.toLocaleLowerCase("vi-VN").includes(normalizedQuery),
      )
    : courses;
  const totalCount = filteredCourses.length;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const startIndex = (requestedPage - 1) * PAGE_SIZE;
  const items = filteredCourses.slice(startIndex, startIndex + PAGE_SIZE);

  return {
    currentPage: requestedPage,
    count: items.length,
    totalPages,
    totalCount,
    items,
  };
}

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const parsedPage = parsePageNumber(params.page);
  const requestedPage = parsedPage.value;
  const searchQuery = getFirstParam(params.q).trim().slice(0, 100);
  const categoryId = getFirstParam(params.category).trim().slice(0, 100);

  if (parsedPage.isInvalid) {
    redirect(getCatalogHref({ categoryId, searchQuery }));
  }

  let categories: ApiCourseCategory[] = [];
  let coursesPage: ApiPaginatedResponse<ApiCourse> | null = null;
  let selectedCategory: ApiCourseCategory | undefined;

  if (categoryId) {
    const [categoriesResult, coursesResult] = await Promise.allSettled([
      getCourseCategories(),
      getCoursesByCategory(categoryId),
    ]);

    if (categoriesResult.status === "fulfilled") {
      categories = categoriesResult.value;
      selectedCategory = categories.find(
        (category) => category.maDanhMuc === categoryId,
      );

      if (!selectedCategory) {
        redirect(getCatalogHref({ searchQuery }));
      }
    }

    if (coursesResult.status === "fulfilled") {
      coursesPage = paginateCourses(
        coursesResult.value,
        requestedPage,
        searchQuery,
      );
    }
  } else {
    const [categoriesResult, coursesResult] = await Promise.allSettled([
      getCourseCategories(),
      getCoursesPaged(requestedPage, PAGE_SIZE, searchQuery),
    ]);

    if (categoriesResult.status === "fulfilled") {
      categories = categoriesResult.value;
    }

    if (coursesResult.status === "fulfilled") {
      coursesPage = coursesResult.value;
    } else if (searchQuery && isNoResultsError(coursesResult.reason)) {
      coursesPage = {
        currentPage: 1,
        count: 0,
        totalPages: 0,
        totalCount: 0,
        items: [],
      };
    }
  }

  const lastAvailablePage = Math.max(coursesPage?.totalPages ?? 1, 1);

  if (coursesPage && requestedPage > lastAvailablePage) {
    redirect(
      getCatalogHref({
        categoryId,
        page: lastAvailablePage,
        searchQuery,
      }),
    );
  }

  const selectedCategoryName = selectedCategory?.tenDanhMuc;
  const catalogTitle = searchQuery
    ? selectedCategoryName
      ? `Kết quả trong ${selectedCategoryName}`
      : "Kết quả tìm kiếm"
    : selectedCategoryName ||
      (categoryId ? "Khóa học theo danh mục" : "Tất cả khóa học");
  const retryHref = getCatalogHref({
    categoryId,
    page: requestedPage,
    searchQuery,
  });
  const clearSearchHref = getCatalogHref({ categoryId });

  return (
    <>
      <Header
        activeItem="courses"
        categories={categories}
        searchQuery={searchQuery}
        selectedCategoryId={categoryId || undefined}
      />

      <main id="main-content" className="flex-1 bg-slate-50">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
            <nav aria-label="Đường dẫn trang" className="mb-4">
              <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <li>
                  <Link
                    href="/"
                    className="rounded-sm hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  >
                    Trang chủ
                  </Link>
                </li>
                <li aria-hidden="true" className="text-slate-400">
                  /
                </li>
                <li aria-current="page" className="font-medium text-blue-700">
                  Khóa học
                </li>
              </ol>
            </nav>

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-semibold tracking-wide text-blue-700 uppercase">
                  Học theo lộ trình thực chiến
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  Danh mục khóa học
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                  Khám phá các khóa học công nghệ mới nhất, học cùng giảng viên
                  giàu kinh nghiệm và phát triển kỹ năng qua dự án thực tế.
                </p>
              </div>

              {coursesPage ? (
                <p
                  className="shrink-0 text-sm text-slate-600"
                  aria-live="polite"
                >
                  {coursesPage.count < coursesPage.totalCount ? (
                    <>
                      Hiển thị{" "}
                      <span className="font-semibold tabular-nums text-slate-950">
                        {coursesPage.count.toLocaleString("vi-VN")}
                      </span>{" "}
                      /{" "}
                      <span className="font-semibold tabular-nums text-slate-950">
                        {coursesPage.totalCount.toLocaleString("vi-VN")}
                      </span>{" "}
                      khóa học
                    </>
                  ) : (
                    <>
                      <span className="font-semibold tabular-nums text-slate-950">
                        {coursesPage.totalCount.toLocaleString("vi-VN")}
                      </span>{" "}
                      khóa học
                    </>
                  )}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <section
          id="course-catalog"
          aria-labelledby="course-catalog-title"
          className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
        >
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2
                id="course-catalog-title"
                className="text-xl font-bold text-slate-950 sm:text-2xl"
              >
                {catalogTitle}
              </h2>
              {searchQuery ? (
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Từ khóa:{" "}
                  <strong className="text-slate-900">“{searchQuery}”</strong>
                </p>
              ) : null}
            </div>

            {searchQuery ? (
              <Button
                render={<Link href={clearSearchHref} />}
                nativeButton={false}
                variant="outline"
                size="lg"
                className="h-11 cursor-pointer border-slate-300 bg-white px-4 text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-blue-600"
              >
                Xóa tìm kiếm
              </Button>
            ) : null}
          </div>

          {!coursesPage ? (
            <div
              role="alert"
              className="rounded-2xl border border-amber-300 bg-amber-50 px-5 py-8 text-center"
            >
              <TriangleAlert
                aria-hidden="true"
                className="mx-auto size-9 text-amber-700"
              />
              <h3 className="mt-4 text-lg font-bold text-slate-950">
                Chưa thể tải danh sách khóa học
              </h3>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-700">
                Kết nối đến hệ thống đang gặp sự cố. Vui lòng thử tải lại trang.
              </p>
              <Button
                render={<a href={retryHref} />}
                nativeButton={false}
                className="mt-5 h-11 cursor-pointer bg-blue-700 px-5 text-white hover:bg-blue-800 focus-visible:ring-blue-600"
              >
                Thử lại
              </Button>
            </div>
          ) : coursesPage.items.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center">
              <SearchX
                aria-hidden="true"
                className="mx-auto size-10 text-slate-500"
              />
              <h3 className="mt-4 text-lg font-bold text-slate-950">
                Không tìm thấy khóa học phù hợp
              </h3>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
                Hãy thử một từ khóa ngắn hơn hoặc xem lại toàn bộ danh mục.
              </p>
              <Button
                render={<Link href="/" />}
                nativeButton={false}
                className="mt-5 h-11 cursor-pointer bg-blue-700 px-5 text-white hover:bg-blue-800 focus-visible:ring-blue-600"
              >
                Xem tất cả khóa học
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                {coursesPage.items.map((course, index) => (
                  <CourseCard
                    key={course.maKhoaHoc || course.biDanh}
                    course={course}
                    preloadImage={index === 0}
                  />
                ))}
              </div>

              <CoursePagination
                categoryId={categoryId || undefined}
                currentPage={coursesPage.currentPage}
                totalPages={coursesPage.totalPages}
                searchQuery={searchQuery}
              />
            </>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
