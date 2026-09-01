"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookCheck,
  BookOpen,
  Clock3,
  GraduationCap,
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

import EnrollmentWorkspace, {
  SelectableEntityCard,
} from "./EnrollmentWorkspace";
import EnrollmentStatusSection from "./EnrollmentStatusSection";
import EnrollmentViewSwitcher from "./EnrollmentViewSwitcher";
import { AdminPage, AdminPageHeader, AdminSearchForm } from "./AdminPage";

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
    <AdminPage>
      <AdminPageHeader title="Quản lý ghi danh" />

      <EnrollmentViewSwitcher activeView="users" />

      <section
        aria-labelledby="student-search-title"
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 id="student-search-title" className="font-bold text-slate-950">
          Nhập người dùng
        </h2>
        <AdminSearchForm
          onSubmit={handleSearch}
          value={searchInput}
          onChange={setSearchInput}
          ariaLabel="Tìm tài khoản để quản lý ghi danh"
          placeholder="Nhập tài khoản hoặc họ tên"
          disabled={!searchInput.trim()}
          className="mt-4"
        />

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
                  <SelectableEntityCard
                    icon={UserRound}
                    isSelected={isSelected}
                    onSelect={() => handleSelectUser(user)}
                    primaryText={user.hoTen}
                    secondaryText={`@${user.taiKhoan}`}
                  />
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>

      <EnrollmentWorkspace
        selected={Boolean(selectedUser)}
        titleId="enrollment-title"
        title="2. Trạng thái khóa học"
        summary={
          selectedUser
            ? `${selectedUser.hoTen} · @${selectedUser.taiKhoan}`
            : ""
        }
        badge={selectedUser?.maNhom || DEFAULT_GROUP_ID}
        feedback={feedback}
        hasError={hasEnrollmentError}
        errorMessage="Không thể tải đầy đủ trạng thái ghi danh. Vui lòng thử lại."
        isLoading={isLoadingEnrollment}
        loadingMessage="Đang tải trạng thái ghi danh..."
        emptyIcon={GraduationCap}
        emptyTitle="Chưa chọn người dùng"
        emptyDescription="Tìm và chọn một tài khoản để quản lý ghi danh."
      >
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
      </EnrollmentWorkspace>
    </AdminPage>
  );
}
