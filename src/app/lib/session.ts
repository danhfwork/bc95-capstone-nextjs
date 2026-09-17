"use client";

import type { ApiAccountUser, ApiSignInResponse } from "./api";

const AUTH_STORAGE_KEY = "cybersoft-auth";
const AUTH_COOKIE_NAME = "token";
const PENDING_ENROLLMENTS_STORAGE_KEY = "cybersoft-pending-enrollments";

function isSignInResponse(value: unknown): value is ApiSignInResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return (
    "accessToken" in value &&
    typeof value.accessToken === "string" &&
    "taiKhoan" in value &&
    typeof value.taiKhoan === "string" &&
    "hoTen" in value &&
    typeof value.hoTen === "string" &&
    "soDT" in value &&
    typeof value.soDT === "string" &&
    "maNhom" in value &&
    (typeof value.maNhom === "string" || value.maNhom === null) &&
    "email" in value &&
    typeof value.email === "string" &&
    "maLoaiNguoiDung" in value &&
    typeof value.maLoaiNguoiDung === "string"
  );
}

function parseSession(
  serializedSession: string | null,
): ApiSignInResponse | null {
  if (!serializedSession) {
    return null;
  }

  try {
    const parsedSession: unknown = JSON.parse(serializedSession);
    return isSignInResponse(parsedSession) ? parsedSession : null;
  } catch {
    return null;
  }
}

function setAuthCookie(accessToken: string) {
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(accessToken)}; Path=/; SameSite=Lax`;
}

export function setSession(session: ApiSignInResponse): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  setAuthCookie(session.accessToken);
}

export function getSession(): ApiSignInResponse | null {
  return (
    parseSession(localStorage.getItem(AUTH_STORAGE_KEY)) ??
    parseSession(sessionStorage.getItem(AUTH_STORAGE_KEY))
  );
}

export function updateSessionUser(
  user: ApiAccountUser,
): ApiSignInResponse | null {
  const currentSession = getSession();

  if (!currentSession) {
    return null;
  }

  const updatedSession: ApiSignInResponse = {
    ...currentSession,
    ...user,
    accessToken: currentSession.accessToken,
  };
  const storage = localStorage.getItem(AUTH_STORAGE_KEY)
    ? localStorage
    : sessionStorage;

  storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedSession));

  return updatedSession;
}

export function clearSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
  document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}

function getPendingEnrollmentMap(): Record<string, string[]> {
  try {
    const serializedMap = localStorage.getItem(PENDING_ENROLLMENTS_STORAGE_KEY);

    if (!serializedMap) {
      return {};
    }

    const parsedMap: unknown = JSON.parse(serializedMap);

    if (typeof parsedMap !== "object" || parsedMap === null) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsedMap).filter(
        (entry): entry is [string, string[]] =>
          Array.isArray(entry[1]) &&
          entry[1].every((courseId) => typeof courseId === "string"),
      ),
    );
  } catch {
    return {};
  }
}

function savePendingEnrollmentMap(
  pendingEnrollments: Record<string, string[]>,
): void {
  localStorage.setItem(
    PENDING_ENROLLMENTS_STORAGE_KEY,
    JSON.stringify(pendingEnrollments),
  );
}

export function getPendingCourseIds(username: string): string[] {
  return getPendingEnrollmentMap()[username] ?? [];
}

export function markCoursePending(username: string, courseId: string): void {
  const pendingEnrollments = getPendingEnrollmentMap();
  const pendingCourseIds = pendingEnrollments[username] ?? [];

  if (!pendingCourseIds.includes(courseId)) {
    pendingEnrollments[username] = [...pendingCourseIds, courseId];
    savePendingEnrollmentMap(pendingEnrollments);
  }
}

export function clearPendingCourse(username: string, courseId: string): void {
  const pendingEnrollments = getPendingEnrollmentMap();
  const pendingCourseIds = pendingEnrollments[username] ?? [];
  const nextCourseIds = pendingCourseIds.filter(
    (pendingCourseId) => pendingCourseId !== courseId,
  );

  if (nextCourseIds.length === 0) {
    delete pendingEnrollments[username];
  } else {
    pendingEnrollments[username] = nextCourseIds;
  }

  savePendingEnrollmentMap(pendingEnrollments);
}
