const API_IMAGE_HOST = "elearningnew.cybersoft.edu.vn";

export function getCourseImageUrl(imageUrl: string): string | null {
  try {
    const parsedUrl = new URL(imageUrl);

    return parsedUrl.protocol === "https:" &&
      parsedUrl.hostname === API_IMAGE_HOST
      ? parsedUrl.toString()
      : null;
  } catch {
    return null;
  }
}

export function getCreatorInitial(creatorName: string): string {
  return Array.from(creatorName.trim())[0]?.toLocaleUpperCase("vi-VN") ?? "C";
}

export function getCoursePlainText(value: string): string {
  return value
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}
