import { isAxiosError } from "axios";
import type { NextRequest } from "next/server";

import {
  clearAuthSession,
  getAuthSession,
} from "@/app/lib/authSession";
import {
  getCurrentUserPassword,
} from "@/app/lib/serverApi";
import { getCybersoftApiConfig } from "@/app/lib/axiosClient";

export const runtime = "nodejs";

const ENDPOINT_METHODS: Record<string, readonly string[]> = {
  "/QuanLyKhoaHoc/LayDanhMucKhoaHoc": ["GET"],
  "/QuanLyKhoaHoc/LayKhoaHocTheoDanhMuc": ["GET"],
  "/QuanLyKhoaHoc/LayDanhSachKhoaHoc_PhanTrang": ["GET"],
  "/QuanLyKhoaHoc/LayThongTinKhoaHoc": ["GET"],
  "/QuanLyKhoaHoc/ThemKhoaHoc": ["POST"],
  "/QuanLyKhoaHoc/CapNhatKhoaHoc": ["PUT"],
  "/QuanLyKhoaHoc/XoaKhoaHoc": ["DELETE"],
  "/QuanLyKhoaHoc/GhiDanhKhoaHoc": ["POST"],
  "/QuanLyKhoaHoc/DangKyKhoaHoc": ["POST"],
  "/QuanLyKhoaHoc/HuyGhiDanh": ["POST"],
  "/QuanLyKhoaHoc/ThemKhoaHocUploadHinh": ["POST"],
  "/QuanLyKhoaHoc/CapNhatKhoaHocUpload": ["POST"],
  "/QuanLyNguoiDung/LayDanhSachLoaiNguoiDung": ["GET"],
  "/QuanLyNguoiDung/LayDanhSachNguoiDung": ["GET"],
  "/QuanLyNguoiDung/LayDanhSachNguoiDung_PhanTrang": ["GET"],
  "/QuanLyNguoiDung/TimKiemNguoiDung": ["GET"],
  "/QuanLyNguoiDung/ThongTinTaiKhoan": ["POST"],
  "/QuanLyNguoiDung/ThemNguoiDung": ["POST"],
  "/QuanLyNguoiDung/CapNhatThongTinNguoiDung": ["PUT"],
  "/QuanLyNguoiDung/XoaNguoiDung": ["DELETE"],
  "/QuanLyNguoiDung/LayDanhSachKhoaHocChuaGhiDanh": ["POST"],
  "/QuanLyNguoiDung/LayDanhSachKhoaHocChoXetDuyet": ["POST"],
  "/QuanLyNguoiDung/LayDanhSachKhoaHocDaXetDuyet": ["POST"],
  "/QuanLyNguoiDung/LayDanhSachNguoiDungChuaGhiDanh": ["POST"],
  "/QuanLyNguoiDung/LayDanhSachHocVienChoXetDuyet": ["POST"],
  "/QuanLyNguoiDung/LayDanhSachHocVienKhoaHoc": ["POST"],
};

const PUBLIC_ENDPOINTS = new Set([
  "/QuanLyKhoaHoc/LayDanhMucKhoaHoc",
  "/QuanLyKhoaHoc/LayKhoaHocTheoDanhMuc",
  "/QuanLyKhoaHoc/LayDanhSachKhoaHoc_PhanTrang",
  "/QuanLyKhoaHoc/LayThongTinKhoaHoc",
]);

const ADMIN_ENDPOINTS = new Set([
  "/QuanLyKhoaHoc/ThemKhoaHoc",
  "/QuanLyKhoaHoc/CapNhatKhoaHoc",
  "/QuanLyKhoaHoc/XoaKhoaHoc",
  "/QuanLyKhoaHoc/GhiDanhKhoaHoc",
  "/QuanLyKhoaHoc/ThemKhoaHocUploadHinh",
  "/QuanLyKhoaHoc/CapNhatKhoaHocUpload",
  "/QuanLyNguoiDung/LayDanhSachNguoiDung",
  "/QuanLyNguoiDung/LayDanhSachNguoiDung_PhanTrang",
  "/QuanLyNguoiDung/TimKiemNguoiDung",
  "/QuanLyNguoiDung/ThemNguoiDung",
  "/QuanLyNguoiDung/XoaNguoiDung",
  "/QuanLyNguoiDung/LayDanhSachKhoaHocChuaGhiDanh",
  "/QuanLyNguoiDung/LayDanhSachKhoaHocChoXetDuyet",
  "/QuanLyNguoiDung/LayDanhSachKhoaHocDaXetDuyet",
  "/QuanLyNguoiDung/LayDanhSachNguoiDungChuaGhiDanh",
  "/QuanLyNguoiDung/LayDanhSachHocVienChoXetDuyet",
  "/QuanLyNguoiDung/LayDanhSachHocVienKhoaHoc",
]);

const OWNED_ENDPOINTS = new Set([
  "/QuanLyKhoaHoc/DangKyKhoaHoc",
  "/QuanLyKhoaHoc/HuyGhiDanh",
  "/QuanLyNguoiDung/CapNhatThongTinNguoiDung",
]);


function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function jsonResponse(message: string, status: number): Response {
  return Response.json(
    { message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

async function getJsonBody(
  request: Request,
): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.clone().json();
    return isRecord(body) ? body : null;
  } catch {
    return null;
  }
}

async function checkAuthorization(
  request: NextRequest,
  endpoint: string,
  session: Awaited<ReturnType<typeof getAuthSession>>,
): Promise<Response | null> {
  if (PUBLIC_ENDPOINTS.has(endpoint)) {
    return null;
  }

  if (!session) {
    return jsonResponse("Phiên đăng nhập không hợp lệ.", 401);
  }

  if (
    ADMIN_ENDPOINTS.has(endpoint) &&
    session.user.maLoaiNguoiDung !== "GV"
  ) {
    return jsonResponse("Bạn không có quyền thực hiện thao tác này.", 403);
  }

  if (!OWNED_ENDPOINTS.has(endpoint) || session.user.maLoaiNguoiDung === "GV") {
    return null;
  }

  let username: unknown;

  if (
    endpoint ===
    "/QuanLyNguoiDung/LayDanhSachKhoaHocChuaGhiDanh"
  ) {
    username = request.nextUrl.searchParams.get("TaiKhoan");
  } else {
    username = (await getJsonBody(request))?.taiKhoan;
  }

  if (typeof username !== "string" || !username.trim()) {
    return jsonResponse("Thiếu thông tin tài khoản.", 400);
  }

  if (
    username.trim().toLocaleLowerCase("vi-VN") !==
    session.user.taiKhoan.trim().toLocaleLowerCase("vi-VN")
  ) {
    return jsonResponse("Bạn không có quyền truy cập tài khoản này.", 403);
  }

  return null;
}

function buildUpstreamUrl(baseURL: string, endpoint: string, search: string) {
  const url = new URL(baseURL);
  url.pathname = `${url.pathname.replace(/\/$/, "")}${endpoint}`;
  url.search = search;
  return url;
}

async function getRequestBody(
  request: NextRequest,
  endpoint: string,
  session: Awaited<ReturnType<typeof getAuthSession>>,
): Promise<{ body?: ArrayBuffer | string; contentType?: string }> {
  if (request.method === "GET" || request.method === "HEAD") {
    return {};
  }

  const contentType = request.headers.get("content-type") ?? undefined;

  if (
    endpoint === "/QuanLyNguoiDung/CapNhatThongTinNguoiDung" &&
    session &&
    contentType?.toLowerCase().includes("application/json")
  ) {
    const body = await getJsonBody(request);

    if (body && !body.matKhau) {
      const password = await getCurrentUserPassword(session.accessToken);
      return {
        body: JSON.stringify({ ...body, matKhau: password }),
        contentType: "application/json",
      };
    }
  }

  const body = await request.arrayBuffer();

  return {
    body: body.byteLength > 0 ? body : undefined,
    contentType,
  };
}

async function handle(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path } = await context.params;
  const endpoint = `/${path.join("/")}`;
  const allowedMethods = ENDPOINT_METHODS[endpoint];

  if (!allowedMethods || !allowedMethods.includes(request.method)) {
    return jsonResponse("API endpoint không được hỗ trợ.", 404);
  }

  const session = await getAuthSession();
  const authorizationError = await checkAuthorization(
    request,
    endpoint,
    session,
  );

  if (authorizationError) {
    return authorizationError;
  }

  try {
    const config = getCybersoftApiConfig();
    const requestBody = await getRequestBody(request, endpoint, session);
    const headers = new Headers({
      Accept: request.headers.get("accept") || "application/json",
      TokenCybersoft: config.token,
    });

    if (session) {
      headers.set("Authorization", `Bearer ${session.accessToken}`);
    }

    if (requestBody.contentType) {
      headers.set("Content-Type", requestBody.contentType);
    }

    const upstreamResponse = await fetch(
      buildUpstreamUrl(
        config.baseURL,
        endpoint,
        request.nextUrl.search,
      ),
      {
        method: request.method,
        headers,
        body: requestBody.body,
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      },
    );

    if (upstreamResponse.status === 401 && session) {
      await clearAuthSession();
    }

    const responseHeaders = new Headers({
      "Cache-Control": "no-store",
    });
    const responseContentType = upstreamResponse.headers.get("content-type");

    if (responseContentType) {
      responseHeaders.set("Content-Type", responseContentType);
    }

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch (error: unknown) {
    if (isAxiosError(error) && error.response?.status === 401 && session) {
      await clearAuthSession();
      return jsonResponse("Phiên đăng nhập đã hết hạn.", 401);
    }

    return jsonResponse(
      "Không thể kết nối đến hệ thống. Vui lòng thử lại.",
      502,
    );
  }
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
