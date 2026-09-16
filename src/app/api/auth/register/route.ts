import { isAxiosError } from "axios";
import { z } from "zod";

import { getSignUpErrorMessage } from "@/app/lib/errors";
import {
  accountSchema,
  emailSchema,
  fullNameSchema,
  passwordSchema,
  phoneSchema,
} from "@/app/lib/schemas";
import { DEFAULT_GROUP_ID, signUp } from "@/app/lib/serverApi";

export const runtime = "nodejs";

const registerPayloadSchema = z.object({
  account: accountSchema,
  fullName: fullNameSchema,
  password: passwordSchema,
  email: emailSchema,
  phone: phoneSchema,
});

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
      { message: "Dữ liệu đăng ký không hợp lệ." },
      { status: 400 },
    );
  }

  const parsedBody = registerPayloadSchema.safeParse(body);

  if (!parsedBody.success) {
    return Response.json(
      { message: parsedBody.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." },
      { status: 400 },
    );
  }

  try {
    await signUp({
      taiKhoan: parsedBody.data.account,
      matKhau: parsedBody.data.password,
      hoTen: parsedBody.data.fullName,
      soDT: parsedBody.data.phone.replace(/\s/g, ""),
      maNhom: DEFAULT_GROUP_ID,
      email: parsedBody.data.email,
    });

    return Response.json(
      { success: true },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error: unknown) {
    return Response.json(
      { message: getSignUpErrorMessage(error) },
      { status: getErrorStatus(error) },
    );
  }
}
