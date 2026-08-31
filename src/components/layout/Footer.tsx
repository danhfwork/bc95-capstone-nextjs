import { AtSign, Globe2 } from "lucide-react";
import Link from "next/link";

type FooterLink = {
  href: string;
  label: string;
};

const POPULAR_COURSES = [
  { href: "/?q=React", label: "Lập trình Front-end React" },
  { href: "/?q=Nodejs", label: "Lập trình Back-end Nodejs" },
  { href: "/?q=UI%2FUX", label: "Thiết kế UI/UX Chuyên nghiệp" },
  { href: "/?q=Flutter", label: "Lập trình Mobile với Flutter" },
] satisfies FooterLink[];

const footerLinkClassName =
  "inline-flex min-h-6 items-center rounded-sm text-slate-700 transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-100";

function FooterLinkGroup({
  id,
  links,
  title,
}: {
  id: string;
  links: FooterLink[];
  title: string;
}) {
  return (
    <nav aria-labelledby={id}>
      <h2
        id={id}
        className="text-xs leading-5 font-bold tracking-wide text-slate-900 uppercase"
      >
        {title}
      </h2>
      <ul className="mt-2 space-y-1 text-xs leading-5">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={footerLinkClassName}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function Footer() {
  return (
    <footer
      aria-label="Chân trang"
      className="border-t border-blue-200 bg-blue-100 text-slate-700"
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-6 sm:grid-cols-2 sm:px-6 md:grid-cols-3 md:gap-4 lg:px-8">
        <section aria-labelledby="footer-brand">
          <h2 id="footer-brand">
            <Link
              href="/"
              className="inline-flex min-h-6 items-center rounded-sm text-sm font-bold text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-100"
            >
              CYBERSOFT
            </Link>
          </h2>
          <p className="mt-2 max-w-xs text-xs leading-5 text-slate-700">
            CyberSoft Academy - Hệ thống đào tạo lập trình chuyên sâu theo dự án
            thực tế. Nơi biến đam mê thành sự nghiệp.
          </p>
        </section>

        <FooterLinkGroup
          id="footer-popular-courses"
          title="Khóa học phổ biến"
          links={POPULAR_COURSES}
        />

        <section aria-labelledby="footer-connect">
          <h2
            id="footer-connect"
            className="text-xs leading-5 font-bold tracking-wide text-slate-900 uppercase"
          >
            Kết nối
          </h2>
          <div className="mt-2 flex gap-2">
            <a
              href="https://cybersoft.edu.vn"
              target="_blank"
              rel="noreferrer"
              aria-label="Website CyberSoft (mở trong thẻ mới)"
              className="grid size-8 place-items-center rounded-full bg-white/60 text-blue-700 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-100"
            >
              <Globe2 aria-hidden="true" className="size-4" />
            </a>
            <a
              href="mailto:info@cybersoft.edu.vn"
              aria-label="Gửi email cho CyberSoft"
              className="grid size-8 place-items-center rounded-full bg-white/60 text-blue-700 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-100"
            >
              <AtSign aria-hidden="true" className="size-4" />
            </a>
          </div>
        </section>
      </div>

      <div className="border-t border-blue-200 px-4 py-3 text-center text-xs leading-5 text-slate-600">
        © {new Date().getFullYear()} CyberSoft Education. All rights reserved.
      </div>
    </footer>
  );
}
