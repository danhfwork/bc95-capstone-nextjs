import type { Metadata } from "next";
import Link from "next/link";

import PublicSiteShell, {
  CenteredStatePanel,
} from "@/components/layout/PublicSiteShell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Không tìm thấy trang | CyberSoft",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <PublicSiteShell headerProps={{ activeItem: null }}>
      <CenteredStatePanel>
        <p className="text-sm font-semibold tracking-wide text-blue-700 uppercase">
          Lỗi 404
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Không tìm thấy trang
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-600">
          Trang bạn đang tìm không tồn tại hoặc đã được chuyển sang địa chỉ
          khác.
        </p>
        <Button
          render={<Link href="/" />}
          nativeButton={false}
          size="lg"
          className="mt-6 h-11 bg-blue-700 px-5 text-white hover:bg-blue-800 focus-visible:border-blue-700 focus-visible:ring-blue-600"
        >
          Về trang chủ
        </Button>
      </CenteredStatePanel>
    </PublicSiteShell>
  );
}
