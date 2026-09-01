import AdminCourseForm from "@/components/admin/AdminCourseForm";
import { AdminPage, AdminPageHeader } from "@/components/admin/AdminPage";

export default function NewAdminCoursePage() {
  return (
    <AdminPage maxWidth="5xl">
      <AdminPageHeader
        eyebrow="Quản lý khóa học · Thêm mới"
        title="Thêm khóa học"
        titleClassName="mb-6"
      />
      <AdminCourseForm />
    </AdminPage>
  );
}
