"use client";

const PENDING_ENROLLMENTS_STORAGE_KEY = "cybersoft-pending-enrollments";

type PendingEnrollmentMap = Record<string, string[]>;

function getPendingEnrollmentMap(): PendingEnrollmentMap {
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
  pendingEnrollments: PendingEnrollmentMap,
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
