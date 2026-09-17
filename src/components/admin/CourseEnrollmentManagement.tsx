"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Clock3,
  GraduationCap,
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
import { PaginationButtons } from "@/components/ui/pagination";

import { AdminPage, AdminPageHeader, AdminSearchForm } from "./AdminPage";
import EnrollmentWorkspace, {
  SelectableEntityCard,
} from "./EnrollmentWorkspace";
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
    <AdminPage>
      <AdminPageHeader title="Quản lý ghi danh" />
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

        <AdminSearchForm
          onSubmit={handleSearch}
          value={searchInput}
          onChange={setSearchInput}
          ariaLabel="Tìm khóa học để quản lý ghi danh"
          placeholder="Nhập tên khóa học"
          className="mt-4"
        />

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
                  <SelectableEntityCard
                    icon={GraduationCap}
                    iconShape="rounded"
                    isSelected={isSelected}
                    onSelect={() => handleSelectCourse(course)}
                    primaryText={course.tenKhoaHoc}
                    secondaryText={course.maKhoaHoc}
                    secondaryClassName="font-mono"
                  />
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-500">
            Trang {page} / {totalPages}
          </p>
          <PaginationButtons
            currentPage={page}
            totalPages={totalPages}
            isPending={coursesQuery.isFetching}
            previousAriaLabel="Trang khóa học trước"
            nextAriaLabel="Trang khóa học sau"
            onPageChange={(nextPage) => {
              setPage(nextPage);
              setSelectedCourse(null);
            }}
          />
        </div>
      </section>

      <EnrollmentWorkspace
        selected={Boolean(selectedCourse)}
        titleId="student-status-title"
        title="Trạng thái học viên"
        summary={
          selectedCourse
            ? `${selectedCourse.tenKhoaHoc} · ${selectedCourse.maKhoaHoc}`
            : ""
        }
        badge={selectedCourse?.maNhom || DEFAULT_GROUP_ID}
        feedback={feedback}
        hasError={hasEnrollmentError}
        errorMessage="Không thể tải đầy đủ trạng thái học viên. Vui lòng thử lại."
        isLoading={isLoadingEnrollment}
        loadingMessage="Đang tải trạng thái học viên..."
        emptyIcon={GraduationCap}
        emptyTitle="Chưa chọn khóa học"
        emptyDescription="Chọn một khóa học để quản lý danh sách học viên."
      >
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
            onAction={(student) => handleAction({ type: "enroll", student })}
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
            onAction={(student) => handleAction({ type: "approve", student })}
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
            onAction={(student) => handleAction({ type: "cancel", student })}
          />
        </div>
      </EnrollmentWorkspace>
    </AdminPage>
  );
}
