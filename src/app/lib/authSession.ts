import "server-only";

import { cookies } from "next/headers";

import type { ApiAccountUser, ApiSignInResponse } from "./serverApi";
import {
  AUTH_SESSION_COOKIE_NAME,
  AUTH_SESSION_MAX_AGE,
  decryptAuthSession,
  type AuthSessionData,
  type AuthSessionUser,
  encryptAuthSession,
} from "./authSessionCrypto";

export type { AuthSessionData, AuthSessionUser } from "./authSessionCrypto";
export { AUTH_SESSION_COOKIE_NAME } from "./authSessionCrypto";

function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: AUTH_SESSION_MAX_AGE,
    path: "/",
  };
}

export function getAuthUser(
  signedInUser: ApiSignInResponse,
): AuthSessionUser {
  return {
    taiKhoan: signedInUser.taiKhoan,
    hoTen: signedInUser.hoTen,
    soDT: signedInUser.soDT,
    maNhom: signedInUser.maNhom,
    email: signedInUser.email,
    maLoaiNguoiDung: signedInUser.maLoaiNguoiDung,
    ...(signedInUser.tenLoaiNguoiDung
      ? { tenLoaiNguoiDung: signedInUser.tenLoaiNguoiDung }
      : {}),
  };
}

export async function setAuthSession(session: AuthSessionData): Promise<void> {
  const serializedSession = await encryptAuthSession(session);
  const cookieStore = await cookies();

  cookieStore.set(
    AUTH_SESSION_COOKIE_NAME,
    serializedSession,
    getCookieOptions(),
  );
}

export async function getAuthSession(): Promise<AuthSessionData | null> {
  const serializedSession = (await cookies()).get(
    AUTH_SESSION_COOKIE_NAME,
  )?.value;

  return decryptAuthSession(serializedSession);
}

export async function updateAuthSessionUser(
  user: ApiAccountUser,
): Promise<AuthSessionData | null> {
  const session = await getAuthSession();

  if (!session) {
    return null;
  }

  const updatedSession = {
    ...session,
    user,
  } satisfies AuthSessionData;

  await setAuthSession(updatedSession);
  return updatedSession;
}

export async function clearAuthSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_SESSION_COOKIE_NAME);
}
