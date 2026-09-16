import { isAxiosError } from "axios";

import {
  clearAuthSession,
  getAuthSession,
  setAuthSession,
} from "@/app/lib/authSession";
import { getAccountInfo } from "@/app/lib/serverApi";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  const session = await getAuthSession();

  if (!session) {
    return Response.json(
      { message: "Bạn chưa đăng nhập." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const account = await getAccountInfo(session.accessToken);
    const refreshedSession = { ...session, user: account };

    await setAuthSession(refreshedSession);

    return Response.json(
      { user: account },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error: unknown) {
    if (isAxiosError(error) && error.response?.status === 401) {
      await clearAuthSession();
      return Response.json(
        { message: "Phiên đăng nhập đã hết hạn." },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }

    return Response.json(
      { message: "Không thể kiểm tra phiên đăng nhập." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export async function DELETE(): Promise<Response> {
  await clearAuthSession();
  return new Response(null, { status: 204 });
}
