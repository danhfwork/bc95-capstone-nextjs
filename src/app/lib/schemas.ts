import { z } from "zod";

export const loginSchema = z.object({
  account: z
    .string()
    .trim()
    .min(1, { message: "Vui lòng nhập tên đăng nhập hoặc email." })
    .min(1, { message: "Tên đăng nhập phải có ít nhất 1 ký tự." }),
  password: z
    .string()
    .min(1, { message: "Vui lòng nhập mật khẩu." })
    .min(3, { message: "Mật khẩu phải có ít nhất 3 ký tự." }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    account: z
      .string()
      .trim()
      .min(1, { message: "Vui lòng nhập tên tài khoản." })
      .min(3, { message: "Tên tài khoản phải có ít nhất 3 ký tự." }),
    fullName: z
      .string()
      .trim()
      .min(1, { message: "Vui lòng nhập họ và tên." })
      .min(2, { message: "Họ và tên phải có ít nhất 2 ký tự." }),
    password: z
      .string()
      .min(1, { message: "Vui lòng nhập mật khẩu." })
      .min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự." }),
    confirmPassword: z
      .string()
      .min(1, { message: "Vui lòng xác nhận mật khẩu." }),
    email: z
      .string()
      .trim()
      .min(1, { message: "Vui lòng nhập email." })
      .email({ message: "Email chưa đúng định dạng." }),
    phone: z
      .string()
      .trim()
      .min(1, { message: "Vui lòng nhập số điện thoại." })
      .regex(/^(?:\+84|0)(?:\s?\d){9}$/, {
        message: "Số điện thoại phải bắt đầu bằng 0 hoặc +84 và gồm 10 chữ số.",
      }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Mật khẩu xác nhận chưa trùng khớp.",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, { message: "Vui lòng nhập họ và tên." })
    .min(2, { message: "Họ và tên phải có ít nhất 2 ký tự." }),
  email: z
    .string()
    .trim()
    .min(1, { message: "Vui lòng nhập email." })
    .email({ message: "Email chưa đúng định dạng." }),
  phone: z
    .string()
    .trim()
    .min(1, { message: "Vui lòng nhập số điện thoại." })
    .regex(/^(?:\+84|0)(?:\s?\d){9}$/, {
      message: "Số điện thoại phải bắt đầu bằng 0 hoặc +84 và gồm 10 chữ số.",
    }),
  password: z
    .string()
    .trim()
    .refine((password) => password.length === 0 || password.length >= 6, {
      message: "Mật khẩu phải có ít nhất 6 ký tự.",
    }),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
