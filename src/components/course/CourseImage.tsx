"use client";

import { BookOpen } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type CourseImageProps = {
  courseName: string;
  imageUrl: string | null;
  preload?: boolean;
  sizes?: string;
};

const DEFAULT_SIZES =
  "(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) calc(50vw - 36px), 25vw";

function getCourseImageProxyUrl(imageUrl: string): string {
  return `/api/course-image?url=${encodeURIComponent(imageUrl)}`;
}

export default function CourseImage({
  courseName,
  imageUrl,
  preload = false,
  sizes = DEFAULT_SIZES,
}: CourseImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!imageUrl || hasError) {
    return (
      <div
        role="img"
        aria-label={`Chưa có ảnh minh họa cho khóa học ${courseName}`}
        className="grid size-full place-items-center bg-blue-50 text-blue-700"
      >
        <BookOpen aria-hidden="true" className="size-10" />
      </div>
    );
  }

  return (
    <Image
      src={getCourseImageProxyUrl(imageUrl)}
      alt={`Ảnh minh họa khóa học ${courseName}`}
      fill
      loading={preload ? "eager" : "lazy"}
      fetchPriority={preload ? "high" : undefined}
      sizes={sizes}
      unoptimized
      className="object-cover"
      onError={() => setHasError(true)}
    />
  );
}
