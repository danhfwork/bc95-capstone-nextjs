const IMAGE_HOST = "elearningnew.cybersoft.edu.vn";
const FALLBACK_IMAGE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" role="img" aria-label="Chưa có ảnh khóa học"><rect width="640" height="360" fill="#eff6ff"/><g fill="none" stroke="#1d4ed8" stroke-linecap="round" stroke-linejoin="round" stroke-width="10"><path d="M220 255h200M260 215h120M288 175h64"/><path d="M240 285c-20-18-32-43-32-70 0-55 45-100 100-100s100 45 100 100c0 27-12 52-32 70"/></g><circle cx="320" cy="115" r="8" fill="#1d4ed8"/></svg>`;

function fallbackImage(): Response {
  return new Response(FALLBACK_IMAGE, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Content-Type": "image/svg+xml",
    },
  });
}

export async function GET(request: Request): Promise<Response> {
  const sourceUrl = new URL(request.url).searchParams.get("url");

  if (!sourceUrl) {
    return fallbackImage();
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(sourceUrl);
  } catch {
    return fallbackImage();
  }

  if (
    parsedUrl.protocol !== "https:" ||
    parsedUrl.hostname !== IMAGE_HOST ||
    !parsedUrl.pathname.startsWith("/hinhanh/")
  ) {
    return fallbackImage();
  }

  try {
    const response = await fetch(parsedUrl, {
      headers: { Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8" },
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 3600 },
    });
    const contentType = response.headers.get("content-type") ?? "";

    if (!response.ok || !contentType.toLowerCase().startsWith("image/")) {
      return fallbackImage();
    }

    return new Response(response.body, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "Content-Type": contentType,
      },
    });
  } catch {
    return fallbackImage();
  }
}
