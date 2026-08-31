"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  GraduationCap,
  Search,
  UserCheck,
  UserPlus,
  UserRound,
} from "lucide-react";
import { type FormEvent, useState } from "react";

import {
  cancelCourseRegistration,
  DEFAULT_GROUP_ID,
  enrollStudentInCourse,
  getCoursesPaged,
  getPendingStudentsForCourse,
  getStudentsForCourse,
  getUnenrolledStudentsForCourse,
  type ApiCourse,
  type ApiUserSummary,
} from "@/app/lib/api";
import { getApiErrorMessage } from "@/app/lib/errors";
import { useAuthStore } from "@/app/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import EnrollmentStatusSection from "./EnrollmentStatusSection";
import EnrollmentViewSwitcher from "./EnrollmentViewSwitcher";

const COURSE_PAGE_SIZE = 12;

type StudentAction = {
  type: "enroll" | "approve" | "cancel";
  student: ApiUserSummary;
};

export default function CourseEnrollmentManagement() {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.user?.accessToken);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [courseName, setCourseName] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<ApiCourse | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const coursesQuery = useQuery({
    queryKey: [
      "admin",
      "enrollment-courses",
      page,
      courseName,
      DEFAULT_GROUP_ID,
    ],
    queryFn: () =>
      getCoursesPaged(page, COURSE_PAGE_SIZE, courseName, DEFAULT_GROUP_ID),
  });

  const courseId = selectedCourse?.maKhoaHoc ?? "";
  const unenrolledQuery = useQuery({
    queryKey: ["admin", "course-enrollment", courseId, "unenrolled"],
    queryFn: () => getUnenrolledStudentsForCourse(courseId, accessToken ?? ""),
    enabled: Boolean(courseId && accessToken),
  });
  const pendingQuery = useQuery({
    queryKey: ["admin", "course-enrollment", courseId, "pending"],
    queryFn: () => getPendingStudentsForCourse(courseId, accessToken ?? ""),
    enabled: Boolean(courseId && accessToken),
  });
  const approvedQuery = useQuery({
    queryKey: ["admin", "course-enrollment", courseId, "approved"],
    queryFn: () => getStudentsForCourse(courseId, accessToken ?? ""),
    enabled: Boolean(courseId && accessToken),
  });

  const enrollmentMutation = useMutation({
    mutationFn: async ({ type, student }: StudentAction) => {
      if (!accessToken || !selectedCourse) {
        throw new Error("Missing admin session or selected course");
      }

      const payload = {
        maKhoaHoc: selectedCourse.maKhoaHoc,
        taiKhoan: student.taiKhoan,
      };

      return type === "cancel"
        ? cancelCourseRegistration(payload, accessToken)
        : enrollStudentInCourse(payload, accessToken);
    },
    onSuccess: (_, action) => {
      const messages = {
        enroll: "Đã ghi danh người dùng vào khóa học.",
        approve: "Đã duyệt yêu cầu ghi danh.",
        cancel: "Đã hủy ghi danh của học viên.",
      };
      setFeedback({ type: "success", message: messages[action.type] });
      void queryClient.invalidateQueries({
        queryKey: ["admin", "course-enrollment", courseId],
      });
    },
    onError: (error: unknown) => {
      setFeedback({
        type: "error",
        message: getApiErrorMessage(
          error,
          "Không thể cập nhật trạng thái ghi danh.",
        ),
      });
    },
  });

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setCourseName(searchInput.trim());
    setSelectedCourse(null);
    setFeedback(null);
  };

  const handleSelectCourse = (course: ApiCourse) => {
    setSelectedCourse(course);
    setFeedback(null);
  };

  const handleAction = (action: StudentAction) => {
    setFeedback(null);
    enrollmentMutation.mutate(action);
  };

  const courses = (coursesQuery.data?.items ?? []).filter(
    (course) => course.maKhoaHoc,
  );
  const totalPages = Math.max(coursesQuery.data?.totalPages ?? 1, 1);
  const hasEnrollmentError =
    unenrolledQuery.isError || pendingQuery.isError || approvedQuery.isError;
  const isLoadingEnrollment =
    unenrolledQuery.isPending ||
    pendingQuery.isPending ||
    approvedQuery.isPending;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <h1 className="text-3xl font-bold tracking-tight text-slate-950">
        Quản lý ghi danh
      </h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
        Chọn một khóa học để quản lý người dùng chưa ghi danh, học viên chờ
        duyệt và danh sách lớp.
      </p>

      <EnrollmentViewSwitcher activeView="courses" />

      <section
        aria-labelledby="course-search-title"
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="course-search-title" className="font-bold text-slate-950">
              Chọn khóa học
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Hiển thị khóa học thuộc nhóm {DEFAULT_GROUP_ID}.
            </p>
          </div>
          <p className="text-sm text-slate-500">
            {coursesQuery.data?.totalCount?.toLocaleString("vi-VN") ?? 0} khóa
            học
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          role="search"
          className="mt-4 flex max-w-2xl gap-2"
        >
          <div className="relative flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
            />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              aria-label="Tìm khóa học để quản lý ghi danh"
              placeholder="Nhập tên khóa học"
              className="h-11 border-slate-300 bg-slate-50 pl-9 text-base focus-visible:border-blue-600 focus-visible:ring-blue-100 md:text-sm"
            />
          </div>
          <Button
            type="submit"
            className="min-h-11 bg-blue-600 text-white hover:bg-blue-700"
          >
            Tìm kiếm
          </Button>
        </form>

        {coursesQuery.isPending ? (
          <p className="mt-5 text-sm text-slate-500">
            Đang tải danh sách khóa học...
          </p>
        ) : coursesQuery.isError ? (
          <div role="alert" className="mt-5 text-sm text-red-700">
            <p>Không thể tải danh sách khóa học. Vui lòng thử lại.</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 border-red-200 text-red-700"
              onClick={() => void coursesQuery.refetch()}
            >
              Thử lại
            </Button>
          </div>
        ) : courses.length === 0 ? (
          <p className="mt-5 text-sm text-slate-500">
            Không tìm thấy khóa học phù hợp.
          </p>
        ) : (
          <ul className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => {
              const isSelected = selectedCourse?.maKhoaHoc === course.maKhoaHoc;

              return (
                <li key={course.maKhoaHoc}>
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => handleSelectCourse(course)}
                    className={`flex min-h-16 w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${isSelected ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"}`}
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600">
                      <GraduationCap aria-hidden="true" className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-900">
                        {course.tenKhoaHoc}
                      </span>
                      <span className="block truncate font-mono text-xs text-slate-500">
                        {course.maKhoaHoc}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-500">
            Trang {page} / {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Trang khóa học trước"
              disabled={page <= 1 || coursesQuery.isFetching}
              onClick={() => {
                setPage((currentPage) => Math.max(currentPage - 1, 1));
                setSelectedCourse(null);
              }}
              className="size-10 border-slate-300"
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Trang khóa học sau"
              disabled={page >= totalPages || coursesQuery.isFetching}
              onClick={() => {
                setPage((currentPage) => Math.min(currentPage + 1, totalPages));
                setSelectedCourse(null);
              }}
              className="size-10 border-slate-300"
            >
              <ChevronRight aria-hidden="true" className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      {selectedCourse ? (
        <section aria-labelledby="student-status-title" className="mt-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2
                id="student-status-title"
                className="text-xl font-bold text-slate-950"
              >
                Trạng thái học viên
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {selectedCourse.tenKhoaHoc} · {selectedCourse.maKhoaHoc}
              </p>
            </div>
            <span className="w-fit rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              {selectedCourse.maNhom || DEFAULT_GROUP_ID}
            </span>
          </div>

          {feedback ? (
            <div
              role={feedback.type === "error" ? "alert" : "status"}
              className={`mb-4 rounded-xl border p-4 text-sm ${feedback.type === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}
            >
              {feedback.message}
            </div>
          ) : null}
          {hasEnrollmentError ? (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            >
              Không thể tải đầy đủ trạng thái học viên. Vui lòng thử lại.
            </div>
          ) : null}

          {isLoadingEnrollment ? (
            <div className="grid min-h-64 place-items-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-500">
              Đang tải trạng thái học viên...
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-3">
              <EnrollmentStatusSection
                key={`${courseId}-unenrolled`}
                title="Chưa ghi danh"
                description="Có thể thêm trực tiếp vào lớp"
                items={unenrolledQuery.data ?? []}
                emptyMessage="Không còn người dùng chưa ghi danh."
                actionLabel="Ghi danh"
                isPending={enrollmentMutation.isPending}
                icon={UserPlus}
                itemIcon={UserRound}
                getItemKey={(student) => student.taiKhoan}
                getPrimaryText={(student) => student.hoTen}
                getSecondaryText={(student) => `@${student.taiKhoan}`}
                onAction={(student) =>
                  handleAction({ type: "enroll", student })
                }
              />
              <EnrollmentStatusSection
                key={`${courseId}-pending`}
                title="Chờ xét duyệt"
                description="Yêu cầu đăng ký đang chờ"
                items={pendingQuery.data ?? []}
                emptyMessage="Không có học viên đang chờ."
                actionLabel="Duyệt"
                isPending={enrollmentMutation.isPending}
                icon={Clock3}
                itemIcon={UserRound}
                getItemKey={(student) => student.taiKhoan}
                getPrimaryText={(student) => student.hoTen}
                getSecondaryText={(student) => `@${student.taiKhoan}`}
                onAction={(student) =>
                  handleAction({ type: "approve", student })
                }
              />
              <EnrollmentStatusSection
                key={`${courseId}-approved`}
                title="Danh sách lớp"
                description="Học viên đã được duyệt"
                items={approvedQuery.data ?? []}
                emptyMessage="Khóa học chưa có học viên."
                actionLabel="Hủy"
                isDestructive
                isPending={enrollmentMutation.isPending}
                icon={UserCheck}
                itemIcon={UserRound}
                getItemKey={(student) => student.taiKhoan}
                getPrimaryText={(student) => student.hoTen}
                getSecondaryText={(student) => `@${student.taiKhoan}`}
                onAction={(student) =>
                  handleAction({ type: "cancel", student })
                }
              />
            </div>
          )}
        </section>
      ) : (
        <div className="mt-6 grid min-h-64 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
          <div>
            <GraduationCap
              aria-hidden="true"
              className="mx-auto size-12 text-slate-300"
            />
            <p className="mt-3 font-semibold text-slate-800">
              Chưa chọn khóa học
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Chọn một khóa học để quản lý danh sách học viên.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
