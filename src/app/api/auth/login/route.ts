import { isAxiosError } from "axios";

import { getSignInErrorMessage } from "@/app/lib/errors";
import { loginSchema } from "@/app/lib/schemas";
import { getAuthUser, setAuthSession } from "@/app/lib/authSession";
import { signIn } from "@/app/lib/serverApi";

export const runtime = "nodejs";

function getErrorStatus(error: unknown): number {
  if (isAxiosError(error) && error.response?.status) {
    return error.response.status;
  }

  return 502;
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { message: "Dữ liệu đăng nhập không hợp lệ." },
      { status: 400 },
    );
  }

  const parsedBody = loginSchema.safeParse(body);

  if (!parsedBody.success) {
    return Response.json(
      { message: parsedBody.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." },
      { status: 400 },
    );
  }

  try {
    const signedInUser = await signIn({
      taiKhoan: parsedBody.data.account,
      matKhau: parsedBody.data.password,
    });

    await setAuthSession({
      accessToken: signedInUser.accessToken,
      user: getAuthUser(signedInUser),
    });

    return Response.json(
      { user: getAuthUser(signedInUser) },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error: unknown) {
    return Response.json(
      { message: getSignInErrorMessage(error) },
      { status: getErrorStatus(error) },
    );
  }
}
