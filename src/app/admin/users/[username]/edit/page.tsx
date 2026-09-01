import AdminUserForm from "@/components/admin/AdminUserForm";
import { AdminPage, AdminPageHeader } from "@/components/admin/AdminPage";

export default async function EditAdminUserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  return (
    <AdminPage maxWidth="5xl">
      <AdminPageHeader
        eyebrow="Quản lý người dùng · Chỉnh sửa"
        title="Cập nhật người dùng"
        titleClassName="mb-6"
      />
      <AdminUserForm username={decodeURIComponent(username)} />
    </AdminPage>
  );
}
