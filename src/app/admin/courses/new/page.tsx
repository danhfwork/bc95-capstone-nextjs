import AdminCourseForm from "@/components/admin/AdminCourseForm";

export default function NewAdminCoursePage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <p className="text-sm font-semibold text-blue-700">
        Quản lý khóa học · Thêm mới
      </p>
      <h1 className="mt-1 mb-6 text-3xl font-bold tracking-tight text-slate-950">
        Thêm khóa học
      </h1>
      <AdminCourseForm />
    </div>
  );
}
