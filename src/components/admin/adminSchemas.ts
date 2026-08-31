import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .min(1, "Vui lòng nhập số điện thoại.")
  .regex(/^(?:\+84|0)(?:\s?\d){9}$/, {
    message: "Số điện thoại phải bắt đầu bằng 0 hoặc +84 và gồm 10 chữ số.",
  });

export const adminUserSchema = z.object({
  account: z.string().trim().min(3, "Tài khoản phải có ít nhất 3 ký tự."),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự."),
  fullName: z.string().trim().min(2, "Họ tên phải có ít nhất 2 ký tự."),
  email: z.string().trim().email("Email chưa đúng định dạng."),
  phone: phoneSchema,
  groupId: z
    .string()
    .trim()
    .regex(/^GP\d{2}$/i, "Mã nhóm có dạng GP01."),
  role: z.enum(["HV", "GV"]),
});

export type AdminUserFormData = z.infer<typeof adminUserSchema>;

export const adminCourseSchema = z.object({
  courseId: z
    .string()
    .min(2, "Vui lòng nhập mã khóa học.")
    .regex(/^\S+$/, "Mã khóa học không được chứa khoảng trắng."),
  courseName: z.string().trim().min(2, "Vui lòng nhập tên khóa học."),
  description: z.string().trim().min(10, "Mô tả cần ít nhất 10 ký tự."),
  categoryId: z.string().trim().min(1, "Vui lòng chọn danh mục."),
  groupId: z
    .string()
    .trim()
    .regex(/^GP\d{2}$/i, "Mã nhóm có dạng GP01."),
});

export const adminCourseEditSchema = adminCourseSchema.extend({
  courseId: z.string().min(2, "Vui lòng nhập mã khóa học."),
});

export type AdminCourseFormData = z.infer<typeof adminCourseSchema>;
