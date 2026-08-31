import type { Metadata } from "next";

import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Đăng nhập | CyberSoft",
  description: "Đăng nhập hệ thống học tập trực tuyến CyberSoft.",
};

type LoginPageProps = {
  searchParams: Promise<{
    next?: string | string[];
  }>;
};

function getSafeRedirectPath(value: string | string[] | undefined): string {
  const redirectPath = Array.isArray(value) ? value[0] : value;

  if (
    !redirectPath ||
    !redirectPath.startsWith("/") ||
    redirectPath.startsWith("//")
  ) {
    return "/";
  }

  return redirectPath;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <AuthLayout titleId="login-title">
      <LoginForm redirectTo={getSafeRedirectPath(params.next)} />
    </AuthLayout>
  );
}
