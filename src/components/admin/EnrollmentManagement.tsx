"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookCheck,
  BookOpen,
  Clock3,
  GraduationCap,
  Search,
  UserRound,
} from "lucide-react";
import { type FormEvent, useState } from "react";

import {
  cancelCourseRegistration,
  DEFAULT_GROUP_ID,
  enrollStudentInCourse,
  getApprovedCoursesForUser,
  getPendingCoursesForUser,
  getUnenrolledCoursesForUser,
  getUsers,
  type ApiEnrollmentCourse,
  type ApiUserSummary,
} from "@/app/lib/api";
import { getApiErrorMessage } from "@/app/lib/errors";
import { useAuthStore } from "@/app/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import EnrollmentStatusSection from "./EnrollmentStatusSection";
import EnrollmentViewSwitcher from "./EnrollmentViewSwitcher";

type EnrollmentAction = {
  type: "enroll" | "approve" | "cancel";
  course: ApiEnrollmentCourse;
};

export default function EnrollmentManagement() {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.user?.accessToken);
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [selectedUser, setSelectedUser] = useState<ApiUserSummary | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const usersQuery = useQuery({
    queryKey: ["admin", "enrollment-users", keyword, DEFAULT_GROUP_ID],
    queryFn: () => getUsers(keyword, DEFAULT_GROUP_ID),
    enabled: keyword.length > 0,
  });

  const username = selectedUser?.taiKhoan ?? "";
  const unenrolledQuery = useQuery({
    queryKey: ["admin", "enrollment", username, "unenrolled"],
    queryFn: () => getUnenrolledCoursesForUser(username, accessToken ?? ""),
    enabled: Boolean(username && accessToken),
  });
  const pendingQuery = useQuery({
    queryKey: ["admin", "enrollment", username, "pending"],
    queryFn: () => getPendingCoursesForUser(username, accessToken ?? ""),
    enabled: Boolean(username && accessToken),
  });
  const approvedQuery = useQuery({
    queryKey: ["admin", "enrollment", username, "approved"],
    queryFn: () => getApprovedCoursesForUser(username, accessToken ?? ""),
    enabled: Boolean(username && accessToken),
  });

  const enrollmentMutation = useMutation({
    mutationFn: async ({ type, course }: EnrollmentAction) => {
      if (!accessToken || !selectedUser) {
        throw new Error("Missing admin session or selected user");
      }

      const payload = {
        maKhoaHoc: course.maKhoaHoc,
        taiKhoan: selectedUser.taiKhoan,
      };

      return type === "cancel"
        ? cancelCourseRegistration(payload, accessToken)
        : enrollStudentInCourse(payload, accessToken);
    },
    onSuccess: (_, action) => {
      const messages = {
        enroll: "Đã ghi danh học viên vào khóa học.",
        approve: "Đã duyệt yêu cầu ghi danh.",
        cancel: "Đã hủy ghi danh khóa học.",
      };
      setFeedback({ type: "success", message: messages[action.type] });
      void queryClient.invalidateQueries({
        queryKey: ["admin", "enrollment", username],
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
    setKeyword(searchInput.trim());
    setSelectedUser(null);
    setFeedback(null);
  };

  const handleSelectUser = (user: ApiUserSummary) => {
    setSelectedUser(user);
    setFeedback(null);
  };

  const handleAction = (action: EnrollmentAction) => {
    setFeedback(null);
    enrollmentMutation.mutate(action);
  };

  const hasEnrollmentError =
    unenrolledQuery.isError || pendingQuery.isError || approvedQuery.isError;
  const isLoadingEnrollment =
    unenrolledQuery.isPending ||
    pendingQuery.isPending ||
    approvedQuery.isPending;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          Quản lý ghi danh
        </h1>
      </div>

      <EnrollmentViewSwitcher activeView="users" />

      <section
        aria-labelledby="student-search-title"
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 id="student-search-title" className="font-bold text-slate-950">
          Nhập người dùng
        </h2>
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
              aria-label="Tìm tài khoản để quản lý ghi danh"
              placeholder="Nhập tài khoản hoặc họ tên"
              className="h-11 border-slate-300 bg-slate-50 pl-9 text-base focus-visible:border-blue-600 focus-visible:ring-blue-100 md:text-sm"
            />
          </div>
          <Button
            type="submit"
            disabled={!searchInput.trim()}
            className="min-h-11 bg-blue-600 text-white hover:bg-blue-700"
          >
            Tìm kiếm
          </Button>
        </form>

        {usersQuery.isFetching ? (
          <p className="mt-4 text-sm text-slate-500">Đang tìm người dùng...</p>
        ) : null}
        {usersQuery.isError ? (
          <p role="alert" className="mt-4 text-sm text-red-700">
            Không thể tìm người dùng. Vui lòng thử lại.
          </p>
        ) : null}
        {keyword && !usersQuery.isFetching && usersQuery.data?.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            Không tìm thấy người dùng phù hợp.
          </p>
        ) : null}
        {usersQuery.data && usersQuery.data.length > 0 ? (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {usersQuery.data.slice(0, 12).map((user) => {
              const isSelected = selectedUser?.taiKhoan === user.taiKhoan;
              return (
                <li key={user.taiKhoan}>
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => handleSelectUser(user)}
                    className={`flex min-h-16 w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${isSelected ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"}`}
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600">
                      <UserRound aria-hidden="true" className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-900">
                        {user.hoTen}
                      </span>
                      <span className="block truncate text-xs text-slate-500">
                        @{user.taiKhoan}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>

      {selectedUser ? (
        <section aria-labelledby="enrollment-title" className="mt-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2
                id="enrollment-title"
                className="text-xl font-bold text-slate-950"
              >
                2. Trạng thái khóa học
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {selectedUser.hoTen} · @{selectedUser.taiKhoan}
              </p>
            </div>
            <span className="w-fit rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              {selectedUser.maNhom || DEFAULT_GROUP_ID}
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
              Không thể tải đầy đủ trạng thái ghi danh. Vui lòng thử lại.
            </div>
          ) : null}

          {isLoadingEnrollment ? (
            <div className="grid min-h-64 place-items-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-500">
              Đang tải trạng thái ghi danh...
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-3">
              <EnrollmentStatusSection
                key={`${username}-unenrolled`}
                title="Chưa ghi danh"
                description="Có thể ghi danh trực tiếp"
                items={unenrolledQuery.data ?? []}
                emptyMessage="Không còn khóa học chưa ghi danh."
                actionLabel="Ghi danh"
                isPending={enrollmentMutation.isPending}
                icon={BookOpen}
                secondaryStyle="code"
                getItemKey={(course) => course.maKhoaHoc}
                getPrimaryText={(course) => course.tenKhoaHoc}
                getSecondaryText={(course) => course.maKhoaHoc}
                onAction={(course) => handleAction({ type: "enroll", course })}
              />
              <EnrollmentStatusSection
                key={`${username}-pending`}
                title="Chờ xét duyệt"
                description="Yêu cầu đăng ký đang chờ"
                items={pendingQuery.data ?? []}
                emptyMessage="Không có yêu cầu đang chờ."
                actionLabel="Duyệt"
                isPending={enrollmentMutation.isPending}
                icon={Clock3}
                secondaryStyle="code"
                getItemKey={(course) => course.maKhoaHoc}
                getPrimaryText={(course) => course.tenKhoaHoc}
                getSecondaryText={(course) => course.maKhoaHoc}
                onAction={(course) => handleAction({ type: "approve", course })}
              />
              <EnrollmentStatusSection
                key={`${username}-approved`}
                title="Đã xét duyệt"
                description="Khóa học đang tham gia"
                items={approvedQuery.data ?? []}
                emptyMessage="Chưa có khóa học đã duyệt."
                actionLabel="Hủy"
                isDestructive
                isPending={enrollmentMutation.isPending}
                icon={BookCheck}
                secondaryStyle="code"
                getItemKey={(course) => course.maKhoaHoc}
                getPrimaryText={(course) => course.tenKhoaHoc}
                getSecondaryText={(course) => course.maKhoaHoc}
                onAction={(course) => handleAction({ type: "cancel", course })}
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
              Chưa chọn người dùng
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Tìm và chọn một tài khoản để quản lý ghi danh.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
