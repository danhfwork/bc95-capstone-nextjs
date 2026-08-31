import type { Metadata } from "next";

import AdminProviders from "@/components/admin/AdminProviders";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Quản trị | CyberLearn",
  description: "Quản lý người dùng, khóa học và ghi danh trên CyberLearn.",
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AdminProviders>
      <AdminShell>{children}</AdminShell>
    </AdminProviders>
  );
}
