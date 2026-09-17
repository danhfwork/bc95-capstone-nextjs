"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";

import { DEFAULT_GROUP_ID, deleteCourse, getCoursesPaged } from "@/app/lib/api";
import { getApiErrorMessage } from "@/app/lib/errors";
import { useAuthStore } from "@/app/store/useAuthStore";
import {
  AdminCollectionState,
  AdminPage,
  AdminPageHeader,
  AdminSearchForm,
} from "@/components/admin/AdminPage";
import { Button } from "@/components/ui/button";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import FeedbackAlert from "@/components/ui/feedback-alert";
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
    <AdminPage>
      <AdminPageHeader
        title="Quản lý khóa học"
        action={
          <Button
            render={<Link href="/admin/courses/new" />}
            nativeButton={false}
            className="min-h-11 bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus aria-hidden="true" className="size-4" />
            Thêm khóa học
          </Button>
        }
      />

      {status === "created" || status === "updated" ? (
        <FeedbackAlert type="success" className="mt-6">
          {status === "created"
            ? "Đã tạo khóa học thành công."
            : "Đã cập nhật khóa học thành công."}
        </FeedbackAlert>
      ) : null}
      {mutationSuccess ? (
        <FeedbackAlert type="success" className="mt-6">
          {mutationSuccess}
        </FeedbackAlert>
      ) : null}
      {mutationError ? (
        <FeedbackAlert type="error" className="mt-6">
          {mutationError}
        </FeedbackAlert>
      ) : null}

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <AdminSearchForm
            onSubmit={handleSearch}
            value={searchInput}
            onChange={setSearchInput}
            ariaLabel="Tìm khóa học"
            placeholder="Tìm theo tên khóa học"
            buttonVariant="outline"
            className="max-w-lg"
          />
          <p className="text-sm whitespace-nowrap text-slate-500">
            {coursesQuery.data?.totalCount?.toLocaleString("vi-VN") ?? 0} khóa
            học
          </p>
        </div>

        <AdminCollectionState
          isPending={coursesQuery.isPending}
          isError={coursesQuery.isError}
          isEmpty={courses.length === 0}
          errorMessage="Không thể tải danh sách khóa học. Vui lòng thử lại."
          emptyIcon={BookOpen}
          emptyTitle="Không có khóa học phù hợp"
          emptyDescription="Thử thay đổi từ khóa tìm kiếm."
          onRetry={() => void coursesQuery.refetch()}
        >
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
        </AdminCollectionState>

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
    </AdminPage>
  );
}
