import AdminCourseForm from "@/components/admin/AdminCourseForm";
import { AdminPage, AdminPageHeader } from "@/components/admin/AdminPage";

export default async function EditAdminCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  return (
    <AdminPage maxWidth="5xl">
      <AdminPageHeader
        eyebrow="Quản lý khóa học · Chỉnh sửa"
        title="Cập nhật khóa học"
        titleClassName="mb-6"
      />
      <AdminCourseForm courseId={decodeURIComponent(courseId)} />
    </AdminPage>
  );
}
