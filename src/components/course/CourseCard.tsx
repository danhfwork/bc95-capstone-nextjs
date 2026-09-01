import { Eye, UsersRound } from "lucide-react";
import Link from "next/link";

import type { ApiCourse } from "@/app/lib/api";
import CourseImage from "@/components/course/CourseImage";
import {
  getCourseImageUrl,
  getCoursePlainText,
} from "@/components/course/courseContent";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { getDisplayInitial } from "@/lib/utils";

type CourseCardProps = {
  course: ApiCourse;
  preloadImage?: boolean;
};

export default function CourseCard({
  course,
  preloadImage = false,
}: CourseCardProps) {
  const imageUrl = getCourseImageUrl(course.hinhAnh);
  const creatorName = course.nguoiTao?.hoTen?.trim() || "CyberSoft";
  const categoryName =
    course.danhMucKhoaHoc?.tenDanhMucKhoaHoc?.trim() || "Lập trình";
  const description =
    getCoursePlainText(course.moTa || "") ||
    "Khóa học thực hành giúp bạn xây dựng nền tảng và phát triển kỹ năng công nghệ.";
  const hasCourseId = Boolean(course.maKhoaHoc.trim());
  const courseHref = hasCourseId
    ? `/courses/${encodeURIComponent(course.maKhoaHoc)}`
    : null;

  const card = (
    <Card className="h-full gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white py-0 shadow-sm ring-0">
      <div className="relative aspect-video overflow-hidden bg-blue-50">
        <CourseImage
          courseName={course.tenKhoaHoc}
          imageUrl={imageUrl}
          preload={preloadImage}
        />
      </div>

      <CardContent className="flex flex-1 flex-col p-4">
        <p className="w-fit rounded-full bg-blue-50 px-2.5 py-1 text-xs leading-4 font-semibold text-blue-700">
          {categoryName}
        </p>
        <h3 className="mt-3 line-clamp-2 min-h-12 break-words text-base leading-6 font-bold text-slate-950">
          {course.tenKhoaHoc}
        </h3>
        <p className="mt-2 line-clamp-2 break-words text-sm leading-6 text-slate-600">
          {description}
        </p>

        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-800 text-xs font-bold text-white"
          >
            {getDisplayInitial(creatorName, "C")}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {creatorName}
            </p>
            <p className="truncate text-xs leading-5 text-slate-500">
              {course.nguoiTao?.tenLoaiNguoiDung || "Giảng viên"}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="justify-between border-t border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-600">
        {hasCourseId ? (
          <>
            <span className="inline-flex items-center gap-1.5">
              <Eye aria-hidden="true" className="size-4" />
              <span className="tabular-nums">
                {course.luotXem.toLocaleString("vi-VN")}
              </span>
              <span className="sr-only">lượt xem</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <UsersRound aria-hidden="true" className="size-4" />
              <span className="tabular-nums">
                {course.soLuongHocVien.toLocaleString("vi-VN")}
              </span>
              <span className="sr-only">học viên</span>
            </span>
          </>
        ) : (
          <span className="font-medium text-amber-700">
            Mã khóa học chưa được cập nhật
          </span>
        )}
      </CardFooter>
    </Card>
  );

  if (!courseHref) {
    return (
      <article
        aria-label={`${course.tenKhoaHoc} - chưa có mã khóa học`}
        className="block h-full rounded-2xl outline-none"
      >
        {card}
      </article>
    );
  }

  return (
    <Link
      href={courseHref}
      className="block h-full rounded-2xl outline-none transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
    >
      {card}
    </Link>
  );
}
