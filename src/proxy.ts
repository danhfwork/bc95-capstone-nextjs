import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  AUTH_SESSION_COOKIE_NAME,
  decryptAuthSession,
} from "@/app/lib/authSessionCrypto";

const ADMIN_PREFIX = "/admin";
const PROTECTED_PREFIXES = ["/admin", "/profile"];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function proxy(request: NextRequest): Promise<Response> {
  const { pathname, search } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const serializedSession = request.cookies.get(
    AUTH_SESSION_COOKIE_NAME,
  )?.value;
  const session = await decryptAuthSession(serializedSession);

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (
    (pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`)) &&
    session.user.maLoaiNguoiDung !== "GV"
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*"],
};
