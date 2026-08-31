import type { Metadata } from "next";

import { getCourseCategories } from "@/app/lib/api";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import StudentProfile from "@/components/profile/StudentProfile";

export const metadata: Metadata = {
  title: "Thông tin học viên | CyberSoft",
  description:
    "Quản lý thông tin cá nhân và các khóa học đã đăng ký tại CyberSoft Academy.",
};

export default async function ProfilePage() {
  const categories = await getCourseCategories().catch(() => []);

  return (
    <>
      <Header activeItem={null} categories={categories} />
      <StudentProfile />
      <Footer />
    </>
  );
}
