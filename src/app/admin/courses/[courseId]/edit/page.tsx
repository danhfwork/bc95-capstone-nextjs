import AdminCourseForm from "@/components/admin/AdminCourseForm";

export default async function EditAdminCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <p className="text-sm font-semibold text-blue-700">
        Quản lý khóa học · Chỉnh sửa
      </p>
      <h1 className="mt-1 mb-6 text-3xl font-bold tracking-tight text-slate-950">
        Cập nhật khóa học
      </h1>
      <AdminCourseForm courseId={decodeURIComponent(courseId)} />
    </div>
  );
}
