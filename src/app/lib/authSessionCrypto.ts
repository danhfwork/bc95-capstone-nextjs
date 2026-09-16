import "server-only";

import { createHash } from "node:crypto";
import { CompactEncrypt, compactDecrypt } from "jose";

import type { ApiAccountUser } from "./api";

export const AUTH_SESSION_COOKIE_NAME = "cybersoft-session";
export const AUTH_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export type AuthSessionUser = ApiAccountUser;

export type AuthSessionData = {
  accessToken: string;
  user: AuthSessionUser;
};

function getSessionKey(): Uint8Array {
  const secret = process.env.AUTH_SESSION_SECRET;

  if (!secret) {
    throw new Error("AUTH_SESSION_SECRET is not configured");
  }

  return createHash("sha256").update(secret).digest();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAuthSessionUser(value: unknown): value is AuthSessionUser {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.taiKhoan === "string" &&
    typeof value.hoTen === "string" &&
    typeof value.soDT === "string" &&
    (typeof value.maNhom === "string" || value.maNhom === null) &&
    typeof value.email === "string" &&
    typeof value.maLoaiNguoiDung === "string" &&
    (value.tenLoaiNguoiDung === undefined ||
      typeof value.tenLoaiNguoiDung === "string")
  );
}

export async function encryptAuthSession(
  session: AuthSessionData,
): Promise<string> {
  const payload = new TextEncoder().encode(JSON.stringify(session));

  return new CompactEncrypt(payload)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .encrypt(getSessionKey());
}

export async function decryptAuthSession(
  serializedSession: string | undefined,
): Promise<AuthSessionData | null> {
  if (!serializedSession) {
    return null;
  }

  try {
    const { plaintext } = await compactDecrypt(
      serializedSession,
      getSessionKey(),
      {
        keyManagementAlgorithms: ["dir"],
        contentEncryptionAlgorithms: ["A256GCM"],
      },
    );
    const parsed: unknown = JSON.parse(new TextDecoder().decode(plaintext));

    if (
      !isRecord(parsed) ||
      typeof parsed.accessToken !== "string" ||
      !isAuthSessionUser(parsed.user)
    ) {
      return null;
    }

    return {
      accessToken: parsed.accessToken,
      user: parsed.user,
    };
  } catch {
    return null;
  }
}
