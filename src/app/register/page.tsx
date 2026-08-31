import type { Metadata } from "next";

import AuthLayout from "@/components/auth/AuthLayout";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Đăng ký | CyberSoft",
  description: "Đăng ký tài khoản học tập trực tuyến CyberSoft.",
};

export default function RegisterPage() {
  return (
    <AuthLayout titleId="register-title" isWide>
      <RegisterForm />
    </AuthLayout>
  );
}
