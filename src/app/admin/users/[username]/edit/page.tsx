import AdminUserForm from "@/components/admin/AdminUserForm";

export default async function EditAdminUserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <p className="text-sm font-semibold text-blue-700">
        Quản lý người dùng · Chỉnh sửa
      </p>
      <h1 className="mt-1 mb-6 text-3xl font-bold tracking-tight text-slate-950">
        Cập nhật người dùng
      </h1>
      <AdminUserForm username={decodeURIComponent(username)} />
    </div>
  );
}
