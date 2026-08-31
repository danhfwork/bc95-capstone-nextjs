"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";

import { DEFAULT_GROUP_ID, deleteCourse, getCoursesPaged } from "@/app/lib/api";
import { getApiErrorMessage } from "@/app/lib/errors";
import { useAuthStore } from "@/app/store/useAuthStore";
import { Button } from "@/components/ui/button";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_SIZE = 10;

export default function CourseManagement() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const accessToken = useAuthStore((state) => state.user?.accessToken);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [courseName, setCourseName] = useState("");
  const [mutationError, setMutationError] = useState("");
  const [mutationSuccess, setMutationSuccess] = useState("");
  const status = searchParams.get("status");

  const coursesQuery = useQuery({
    queryKey: ["admin", "courses", page, courseName, DEFAULT_GROUP_ID],
    queryFn: () =>
      getCoursesPaged(page, PAGE_SIZE, courseName, DEFAULT_GROUP_ID),
  });
  const deleteMutation = useMutation({
    mutationFn: async (courseId: string) => {
      if (!accessToken) {
        throw new Error("Missing admin session");
      }
      return deleteCourse(courseId, accessToken);
    },
    onSuccess: () => {
      setMutationError("");
      setMutationSuccess("Đã xóa khóa học thành công.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
    },
    onError: (error: unknown) => {
      setMutationSuccess("");
      setMutationError(
        getApiErrorMessage(error, "Không thể xóa khóa học này."),
      );
    },
  });

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setCourseName(searchInput.trim());
  };

  const courses = coursesQuery.data?.items ?? [];
  const totalPages = Math.max(coursesQuery.data?.totalPages ?? 1, 1);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Quản lý khóa học
          </h1>
        </div>
        <Button
          render={<Link href="/admin/courses/new" />}
          nativeButton={false}
          className="min-h-11 bg-blue-600 text-white hover:bg-blue-700"
        >
          <Plus aria-hidden="true" className="size-4" />
          Thêm khóa học
        </Button>
      </div>

      {status === "created" || status === "updated" ? (
        <div
          role="status"
          className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          {status === "created"
            ? "Đã tạo khóa học thành công."
            : "Đã cập nhật khóa học thành công."}
        </div>
      ) : null}
      {mutationSuccess ? (
        <div
          role="status"
          className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          {mutationSuccess}
        </div>
      ) : null}
      {mutationError ? (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {mutationError}
        </div>
      ) : null}

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <form
            onSubmit={handleSearch}
            role="search"
            className="flex w-full max-w-lg gap-2"
          >
            <div className="relative flex-1">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
              />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                aria-label="Tìm khóa học"
                placeholder="Tìm theo tên khóa học"
                className="h-11 border-slate-300 bg-slate-50 pl-9 text-base focus-visible:border-blue-600 focus-visible:ring-blue-100 md:text-sm"
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              className="min-h-11 border-slate-300 px-4"
            >
              Tìm kiếm
            </Button>
          </form>
          <p className="text-sm whitespace-nowrap text-slate-500">
            {coursesQuery.data?.totalCount?.toLocaleString("vi-VN") ?? 0} khóa
            học
          </p>
        </div>

        {coursesQuery.isPending ? (
          <div className="grid min-h-72 place-items-center text-sm text-slate-500">
            Đang tải danh sách...
          </div>
        ) : coursesQuery.isError ? (
          <div
            role="alert"
            className="grid min-h-72 place-items-center p-6 text-center text-sm text-red-700"
          >
            <div>
              <p>Không thể tải danh sách khóa học. Vui lòng thử lại.</p>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => void coursesQuery.refetch()}
              >
                Thử lại
              </Button>
            </div>
          </div>
        ) : courses.length === 0 ? (
          <div className="grid min-h-72 place-items-center p-6 text-center">
            <div>
              <BookOpen
                aria-hidden="true"
                className="mx-auto size-10 text-slate-300"
              />
              <p className="mt-3 font-semibold text-slate-800">
                Không có khóa học phù hợp
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Thử thay đổi từ khóa tìm kiếm.
              </p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead scope="col" className="px-4">
                  Khóa học
                </TableHead>
                <TableHead scope="col" className="hidden md:table-cell">
                  Danh mục
                </TableHead>
                <TableHead scope="col" className="hidden lg:table-cell">
                  Người tạo
                </TableHead>
                <TableHead scope="col" className="hidden sm:table-cell">
                  Học viên
                </TableHead>
                <TableHead scope="col" className="px-4 text-right">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.maKhoaHoc || course.biDanh}>
                  <TableCell className="max-w-64 px-4 whitespace-normal">
                    <p className="truncate font-semibold text-slate-900">
                      {course.tenKhoaHoc}
                    </p>
                    <p className="truncate font-mono text-xs text-slate-500">
                      {course.maKhoaHoc || "Không có mã"}
                    </p>
                  </TableCell>
                  <TableCell className="hidden text-slate-600 md:table-cell">
                    {course.danhMucKhoaHoc.tenDanhMucKhoaHoc}
                  </TableCell>
                  <TableCell className="hidden max-w-48 truncate text-slate-600 lg:table-cell">
                    {course.nguoiTao.hoTen}
                  </TableCell>
                  <TableCell className="hidden tabular-nums text-slate-600 sm:table-cell">
                    {course.soLuongHocVien.toLocaleString("vi-VN")}
                  </TableCell>
                  <TableCell className="px-4">
                    {course.maKhoaHoc ? (
                      <div className="flex justify-end gap-1">
                        <Button
                          render={
                            <Link
                              href={`/admin/courses/${encodeURIComponent(course.maKhoaHoc)}/edit`}
                            />
                          }
                          nativeButton={false}
                          variant="ghost"
                          size="icon"
                          aria-label={`Sửa ${course.tenKhoaHoc}`}
                          className="size-10 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Pencil aria-hidden="true" className="size-4" />
                        </Button>
                        <ConfirmationDialog
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Xóa ${course.tenKhoaHoc}`}
                              className="size-10 text-slate-600 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 aria-hidden="true" className="size-4" />
                            </Button>
                          }
                          icon={Trash2}
                          title="Xóa khóa học?"
                          description="Khóa học này sẽ bị xóa khỏi hệ thống. Thao tác này không thể hoàn tác."
                          itemLabel="Khóa học"
                          itemName={course.tenKhoaHoc}
                          actionLabel="Xóa khóa học"
                          pendingLabel="Đang xóa..."
                          isPending={deleteMutation.isPending}
                          onConfirm={() =>
                            deleteMutation.mutate(course.maKhoaHoc)
                          }
                        />
                      </div>
                    ) : (
                      <span className="block text-right text-xs text-slate-500">
                        Thiếu mã khóa học
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {totalPages > 1 ? (
          <div className="border-t border-slate-200 px-4 py-4">
            <PaginationControls
              currentPage={page}
              totalPages={totalPages}
              isPending={coursesQuery.isFetching}
              onPageChange={(nextPage) => setPage(nextPage)}
            />
          </div>
        ) : null}
      </section>
    </div>
  );
}
