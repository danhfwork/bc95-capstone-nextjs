"use client";

import { isAxiosError } from "axios";
import {
  AtSign,
  BookOpen,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  IdCard,
  LoaderCircle,
  Mail,
  Phone,
  ShieldCheck,
  TriangleAlert,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  cancelCourseRegistration,
  getAccountInfo,
  getUserTypes,
  type ApiAccount,
  type ApiAccountCourse,
  type ApiUserType,
} from "@/app/lib/api";
import { clearPendingCourse } from "@/app/lib/session";
import {
  getAccountErrorMessage,
  getCourseCancellationErrorMessage,
} from "@/app/lib/errors";
import { clearSession } from "@/app/lib/session";
import { useAuthStore } from "@/app/store/useAuthStore";
import CourseImage from "@/components/course/CourseImage";
import { getCourseImageUrl } from "@/components/course/courseContent";
import ProfileUpdateDialog from "@/components/profile/ProfileUpdateDialog";
import { Button } from "@/components/ui/button";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { Skeleton } from "@/components/ui/skeleton";

type Feedback = {
  message: string;
  type: "error" | "success";
};

type AccountFieldProps = {
  icon: LucideIcon;
  label: string;
  value: string;
};

function getUserInitial(displayName: string): string {
  return Array.from(displayName.trim())[0]?.toLocaleUpperCase("vi-VN") ?? "H";
}

function AccountField({ icon: Icon, label, value }: AccountFieldProps) {
  return (
    <div>
      <dt className="flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-600 uppercase">
        <Icon aria-hidden="true" className="size-4" />
        {label}
      </dt>
      <dd className="mt-2 min-h-12 break-words rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-slate-900">
        {value || "Chưa cập nhật"}
      </dd>
    </div>
  );
}

function ProfileLoading() {
  return (
    <main id="main-content" className="flex-1 bg-slate-50" aria-busy="true">
      <div className="bg-blue-700">
        <div className="mx-auto flex max-w-7xl items-center gap-5 px-4 py-10 sm:px-6 lg:px-8">
          <Skeleton className="size-24 shrink-0 rounded-2xl bg-blue-300" />
          <div className="w-full max-w-sm space-y-3">
            <Skeleton className="h-8 w-full bg-blue-300" />
            <Skeleton className="h-5 w-2/3 bg-blue-300" />
          </div>
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:px-8">
        <Skeleton className="h-40 rounded-xl bg-slate-200" />
        <Skeleton className="h-96 rounded-xl bg-slate-200 lg:col-span-3" />
      </div>
    </main>
  );
}

function SignInRequired() {
  return (
    <main
      id="main-content"
      className="grid flex-1 place-items-center bg-slate-50 px-4 py-16"
    >
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <UserRound
          aria-hidden="true"
          className="mx-auto size-12 text-blue-700"
        />
        <h1 className="mt-4 text-2xl font-bold text-slate-950">
          Đăng nhập để xem hồ sơ
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Thông tin học viên và các khóa học đã đăng ký chỉ hiển thị cho chủ tài
          khoản.
        </p>
        <Button
          render={<Link href="/login" />}
          nativeButton={false}
          className="mt-6 h-11 bg-blue-700 px-5 text-white hover:bg-blue-800 focus-visible:ring-blue-600"
        >
          Đăng nhập
        </Button>
      </section>
    </main>
  );
}

function CourseCard({
  course,
  isCancelling,
  onCancel,
}: {
  course: ApiAccountCourse;
  isCancelling: boolean;
  onCancel: (course: ApiAccountCourse) => void;
}) {
  const hasCourseId = Boolean(course.maKhoaHoc.trim());

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-video bg-blue-50">
        <CourseImage
          courseName={course.tenKhoaHoc}
          imageUrl={getCourseImageUrl(course.hinhAnh)}
          sizes="(max-width: 1023px) calc(100vw - 48px), 36vw"
        />
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 min-h-12 text-base leading-6 font-bold text-slate-950">
          {course.tenKhoaHoc}
        </h3>
        <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <CalendarDays aria-hidden="true" className="size-4" />
            <dt className="sr-only">Ngày tạo</dt>
            <dd>{course.ngayTao || "Chưa có ngày tạo"}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <UsersRound aria-hidden="true" className="size-4" />
            <dt className="sr-only">Lượt xem</dt>
            <dd>{course.luotXem.toLocaleString("vi-VN")} lượt xem</dd>
          </div>
        </dl>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {hasCourseId ? (
            <Button
              render={
                <Link
                  href={`/courses/${encodeURIComponent(course.maKhoaHoc)}`}
                />
              }
              nativeButton={false}
              variant="outline"
              className="h-10 flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 focus-visible:ring-blue-600"
            >
              Xem khóa học
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              disabled
              className="h-10 flex-1 border-amber-200 text-amber-700"
              title="Khóa học chưa có mã định danh"
            >
              Thiếu mã khóa học
            </Button>
          )}

          <ConfirmationDialog
            trigger={
              <Button
                type="button"
                variant="ghost"
                disabled={isCancelling || !hasCourseId}
                className="h-10 flex-1 text-red-700 hover:bg-red-50 hover:text-red-800 focus-visible:ring-red-600"
              >
                {isCancelling ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="size-4 animate-spin motion-reduce:animate-none"
                  />
                ) : null}
                Hủy đăng ký
              </Button>
            }
            icon={TriangleAlert}
            itemIcon={BookOpen}
            title="Hủy đăng ký khóa học?"
            description="Bạn sắp hủy đăng ký khóa học này. Bạn có chắc muốn tiếp tục?"
            itemLabel="Khóa học sẽ được gỡ khỏi danh sách của bạn"
            itemName={course.tenKhoaHoc}
            actionLabel="Xác nhận hủy"
            pendingLabel="Đang hủy..."
            isPending={isCancelling}
            onConfirm={() => void onCancel(course)}
          />
        </div>
      </div>
    </article>
  );
}

export default function StudentProfile() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthHydrated = useAuthStore((state) => state.isHydrated);
  const clearUser = useAuthStore((state) => state.clearUser);
  const [account, setAccount] = useState<ApiAccount | null>(null);
  const [userTypes, setUserTypes] = useState<ApiUserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cancellingCourseId, setCancellingCourseId] = useState<string | null>(
    null,
  );
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const loadAccount = useCallback(async () => {
    if (!user) {
      setAccount(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      const [accountResult, userTypesResult] = await Promise.allSettled([
        getAccountInfo(user.accessToken),
        getUserTypes(),
      ]);

      if (accountResult.status === "rejected") {
        throw accountResult.reason;
      }

      setAccount(accountResult.value);

      if (userTypesResult.status === "fulfilled") {
        setUserTypes(userTypesResult.value);
      }
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 401) {
        clearSession();
        clearUser();
        router.replace("/login");
        return;
      }

      setLoadError(getAccountErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [clearUser, router, user]);

  useEffect(() => {
    if (!isAuthHydrated) {
      return;
    }

    let isActive = true;

    queueMicrotask(() => {
      if (isActive) {
        void loadAccount();
      }
    });

    return () => {
      isActive = false;
    };
  }, [isAuthHydrated, loadAccount]);

  const handleCancelCourse = async (course: ApiAccountCourse) => {
    if (!user || cancellingCourseId) {
      return;
    }

    setFeedback(null);
    setCancellingCourseId(course.maKhoaHoc);

    try {
      const responseMessage = await cancelCourseRegistration(
        {
          maKhoaHoc: course.maKhoaHoc,
          taiKhoan: user.taiKhoan,
        },
        user.accessToken,
      );

      clearPendingCourse(user.taiKhoan, course.maKhoaHoc);

      setAccount((currentAccount) =>
        currentAccount
          ? {
              ...currentAccount,
              chiTietKhoaHocGhiDanh:
                currentAccount.chiTietKhoaHocGhiDanh.filter(
                  (registeredCourse) =>
                    registeredCourse.maKhoaHoc !== course.maKhoaHoc,
                ),
            }
          : currentAccount,
      );
      setFeedback({
        type: "success",
        message:
          responseMessage.trim() ||
          `Đã hủy đăng ký khóa học “${course.tenKhoaHoc}”.`,
      });
    } catch (error: unknown) {
      setFeedback({
        type: "error",
        message: getCourseCancellationErrorMessage(error),
      });
    } finally {
      setCancellingCourseId(null);
    }
  };

  if (!isAuthHydrated || isLoading) {
    return <ProfileLoading />;
  }

  if (!user) {
    return <SignInRequired />;
  }

  if (!account || loadError) {
    return (
      <main
        id="main-content"
        className="grid flex-1 place-items-center bg-slate-50 px-4 py-16"
      >
        <section
          role="alert"
          className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm sm:p-8"
        >
          <h1 className="text-2xl font-bold text-slate-950">
            Chưa thể tải hồ sơ
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {loadError ?? "Dữ liệu tài khoản chưa sẵn sàng."}
          </p>
          <Button
            type="button"
            className="mt-6 h-11 bg-blue-700 px-5 text-white hover:bg-blue-800 focus-visible:ring-blue-600"
            onClick={() => void loadAccount()}
          >
            Thử lại
          </Button>
        </section>
      </main>
    );
  }

  const displayName = account.hoTen.trim() || account.taiKhoan;
  const enrolledCourses = account.chiTietKhoaHocGhiDanh ?? [];
  const userTypeName =
    account.tenLoaiNguoiDung?.trim() ||
    userTypes.find(
      (userType) => userType.maLoaiNguoiDung === account.maLoaiNguoiDung,
    )?.tenLoaiNguoiDung ||
    account.maLoaiNguoiDung ||
    "Chưa xác định";

  return (
    <main id="main-content" className="flex-1 bg-slate-50">
      <section className="bg-gradient-to-r from-blue-700 to-indigo-600 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-9 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div
            aria-hidden="true"
            className="grid size-24 shrink-0 place-items-center rounded-2xl border-4 border-white bg-blue-100 text-4xl font-bold text-blue-700 shadow-md"
          >
            {getUserInitial(displayName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-blue-100">
              Hồ sơ học viên
            </p>
            <h1 className="mt-1 break-words text-3xl font-bold tracking-tight sm:text-4xl">
              Chào, {displayName}
            </h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-blue-50">
              <ShieldCheck aria-hidden="true" className="size-5" />
              {userTypeName}
            </p>
          </div>
          <div className="w-fit rounded-xl border border-white/25 bg-white/10 px-6 py-4 text-center backdrop-blur-sm">
            <p className="text-3xl font-bold tabular-nums">
              {enrolledCourses.length.toLocaleString("vi-VN")}
            </p>
            <p className="mt-1 text-xs font-medium tracking-wide text-blue-50 uppercase">
              Khóa đã đăng ký
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:items-start lg:px-8">
        <aside className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-4">
          <p className="px-3 py-2 text-xs font-bold tracking-wide text-slate-500 uppercase">
            Quản lý cá nhân
          </p>
          <nav aria-label="Điều hướng hồ sơ" className="space-y-1">
            <a
              href="#thong-tin"
              className="flex min-h-11 items-center gap-3 rounded-lg bg-blue-700 px-3 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <UserRound aria-hidden="true" className="size-5" />
              Thông tin cá nhân
            </a>
            <a
              href="#khoa-hoc"
              className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <BookOpen aria-hidden="true" className="size-5" />
              Khóa học của tôi
            </a>
          </nav>
        </aside>

        <div className="min-w-0 space-y-6 lg:col-span-3">
          <section
            id="thong-tin"
            aria-labelledby="account-title"
            className="scroll-mt-4 rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
              <h2
                id="account-title"
                className="text-xl font-bold text-slate-950"
              >
                Thông tin tài khoản
              </h2>
              <ProfileUpdateDialog
                key={`${account.hoTen}-${account.email}-${account.soDT}`}
                account={account}
                accessToken={user.accessToken}
                onUpdated={(updatedAccount) => {
                  setAccount(updatedAccount);
                  setFeedback({
                    type: "success",
                    message: "Thông tin cá nhân đã được cập nhật.",
                  });
                }}
              />
            </div>

            <dl className="grid gap-5 p-5 sm:grid-cols-2">
              <AccountField
                icon={AtSign}
                label="Tài khoản"
                value={account.taiKhoan}
              />
              <AccountField
                icon={IdCard}
                label="Họ tên"
                value={account.hoTen}
              />
              <AccountField icon={Mail} label="Email" value={account.email} />
              <AccountField
                icon={Phone}
                label="Số điện thoại"
                value={account.soDT}
              />
              <AccountField
                icon={GraduationCap}
                label="Loại người dùng"
                value={userTypeName}
              />
            </dl>
          </section>

          <section
            id="khoa-hoc"
            aria-labelledby="courses-title"
            className="scroll-mt-4"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2
                  id="courses-title"
                  className="text-xl font-bold text-slate-950"
                >
                  Khóa học của tôi
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Danh sách khóa học tài khoản đã ghi danh.
                </p>
              </div>
              <p className="text-sm font-semibold text-blue-700">
                {enrolledCourses.length.toLocaleString("vi-VN")} khóa học
              </p>
            </div>

            <div className="min-h-8 py-2" aria-live="polite" aria-atomic="true">
              {feedback ? (
                <p
                  role={feedback.type === "error" ? "alert" : "status"}
                  className={
                    feedback.type === "error"
                      ? "rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                      : "flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
                  }
                >
                  {feedback.type === "success" ? (
                    <CheckCircle2 aria-hidden="true" className="size-4" />
                  ) : null}
                  {feedback.message}
                </p>
              ) : null}
            </div>

            {enrolledCourses.length ? (
              <div className="grid gap-5 md:grid-cols-2">
                {enrolledCourses.map((course) => (
                  <CourseCard
                    key={course.maKhoaHoc || course.tenKhoaHoc}
                    course={course}
                    isCancelling={cancellingCourseId === course.maKhoaHoc}
                    onCancel={handleCancelCourse}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
                <BookOpenCheck
                  aria-hidden="true"
                  className="mx-auto size-11 text-blue-700"
                />
                <h3 className="mt-4 text-lg font-bold text-slate-950">
                  Bạn chưa đăng ký khóa học nào
                </h3>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
                  Khám phá danh sách khóa học và bắt đầu lộ trình học phù hợp
                  với bạn.
                </p>
                <Button
                  render={<Link href="/" />}
                  nativeButton={false}
                  className="mt-5 h-11 bg-blue-700 px-5 text-white hover:bg-blue-800 focus-visible:ring-blue-600"
                >
                  Khám phá khóa học
                </Button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
