const API_IMAGE_HOST = "elearningnew.cybersoft.edu.vn";

type CatalogHrefOptions = {
  categoryId?: string;
  page?: number;
  searchQuery?: string;
};

export function getCatalogHref({
  categoryId,
  page = 1,
  searchQuery,
}: CatalogHrefOptions): string {
  const params = new URLSearchParams();

  if (categoryId) {
    params.set("category", categoryId);
  }

  if (searchQuery) {
    params.set("q", searchQuery);
  }

  if (page > 1) {
    params.set("page", page.toString());
  }

  const queryString = params.toString();
  return queryString ? `/?${queryString}` : "/";
}

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
