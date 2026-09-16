"use client";

import { isAxiosError } from "axios";
import { CheckCircle2, Clock3, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { getAccountInfo, registerCourse } from "@/app/lib/api";
import {
  getPendingCourseIds,
  markCoursePending,
} from "@/app/lib/session";
import { getCourseRegistrationErrorMessage } from "@/app/lib/errors";
import { useAuthStore } from "@/app/store/useAuthStore";
import { Button } from "@/components/ui/button";

type CourseEnrollmentButtonProps = {
  courseId: string;
};

type EnrollmentStatus =
  | "checking"
  | "guest"
  | "available"
  | "pending"
  | "registered"
  | "unavailable";

export default function CourseEnrollmentButton({
  courseId,
}: CourseEnrollmentButtonProps) {
  const session = useAuthStore((state) => state.user);
  const isAuthHydrated = useAuthStore((state) => state.isHydrated);
  const [status, setStatus] = useState<EnrollmentStatus>("checking");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);

  useEffect(() => {
    let isActive = true;
    const checkEnrollment = async () => {
      if (!isActive) {
        return;
      }

      if (!isAuthHydrated) {
        return;
      }

      if (!session) {
        setStatus("guest");
        setFeedback(null);
        return;
      }

      const hasLocallyPendingEnrollment = getPendingCourseIds(
        session.taiKhoan,
      ).includes(courseId);

      setStatus(hasLocallyPendingEnrollment ? "pending" : "checking");
      setFeedback(null);

      try {
        const account = await getAccountInfo();

        if (!isActive) {
          return;
        }

        const isRegisteredOnServer = account.chiTietKhoaHocGhiDanh?.some(
          (course) => course.maKhoaHoc === courseId,
        );

        if (hasLocallyPendingEnrollment) {
          setStatus("pending");
        } else if (isRegisteredOnServer) {
          setStatus("registered");
        } else {
          setStatus("available");
        }
      } catch (error: unknown) {
        if (!isActive) {
          return;
        }

        if (isAxiosError(error) && error.response?.status === 401) {
          setStatus("guest");
          return;
        }

        setStatus(
          hasLocallyPendingEnrollment ? "pending" : "unavailable",
        );
        setFeedback(
          hasLocallyPendingEnrollment
            ? null
            : {
                type: "error",
                message:
                  "Không thể tải thông tin tài khoản để kiểm tra trạng thái.",
              },
        );
      }
    };

    void checkEnrollment();

    return () => {
      isActive = false;
    };
  }, [courseId, isAuthHydrated, session]);

  const handleRegister = async () => {
    if (!session || status !== "available" || isSubmitting) {
      return;
    }

    setFeedback(null);
    setIsSubmitting(true);

    try {
      await registerCourse(
        {
          maKhoaHoc: courseId,
          taiKhoan: session.taiKhoan,
        },
      );

      markCoursePending(session.taiKhoan, courseId);
      setStatus("pending");      setFeedback({
        message: "Đăng ký đã được gửi và đang chờ xét duyệt.",
        type: "success",
      });
    } catch (error: unknown) {
      setFeedback({
        message: getCourseRegistrationErrorMessage(error),
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {status === "guest" ? (
        <Button
          render={
            <Link
              href={`/login?next=${encodeURIComponent(`/courses/${courseId}`)}`}
            />
          }
          nativeButton={false}
          size="lg"
          className="h-12 w-full bg-orange-600 px-5 text-base font-bold text-white shadow-md hover:bg-orange-700 focus-visible:border-orange-600 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
        >
          Đăng nhập để đăng ký
        </Button>
      ) : (
        <Button
          type="button"
          size="lg"
          disabled={status !== "available" || isSubmitting}
          aria-busy={status === "checking" || isSubmitting}
          className="h-12 w-full cursor-pointer gap-2 bg-orange-600 px-5 text-base font-bold text-white shadow-md hover:bg-orange-700 focus-visible:border-orange-600 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed"
          onClick={handleRegister}
        >
          {status === "checking" ? (
            <>
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin motion-reduce:animate-none"
              />
              Đang kiểm tra...
            </>
          ) : status === "registered" ? (
            <>
              <CheckCircle2 aria-hidden="true" className="size-4" />
              Đã đăng ký
            </>
          ) : status === "pending" ? (
            <>
              <Clock3 aria-hidden="true" className="size-4" />
              Đang chờ xét duyệt
            </>
          ) : status === "unavailable" ? (
            "Không thể kiểm tra trạng thái"
          ) : isSubmitting ? (
            <>
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin motion-reduce:animate-none"
              />
              Đang đăng ký...
            </>
          ) : (
            "Đăng ký ngay"
          )}
        </Button>
      )}

      <div className="min-h-7 pt-2" aria-live="polite" aria-atomic="true">
        {feedback ? (
          <p
            role={feedback.type === "error" ? "alert" : "status"}
            className={
              feedback.type === "error"
                ? "text-sm leading-5 text-red-700"
                : "text-sm leading-5 text-emerald-700"
            }
          >
            {feedback.message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
