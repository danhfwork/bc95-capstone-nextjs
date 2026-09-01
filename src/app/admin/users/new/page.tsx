import AdminUserForm from "@/components/admin/AdminUserForm";
import { AdminPage, AdminPageHeader } from "@/components/admin/AdminPage";

export default function NewAdminUserPage() {
  return (
    <AdminPage maxWidth="5xl">
      <AdminPageHeader
        eyebrow="Quản lý người dùng · Thêm mới"
        title="Thêm người dùng"
        titleClassName="mb-6"
      />
      <AdminUserForm />
    </AdminPage>
  );
}
