import { z } from "zod";

import { DEFAULT_GROUP_ID } from "@/app/lib/api";
import {
  accountSchema,
  emailSchema,
  fullNameSchema,
  passwordSchema,
  phoneSchema,
} from "@/app/lib/schemas";

const adminGroupSchema = z
  .string()
  .trim()
  .regex(
    new RegExp(`^${DEFAULT_GROUP_ID}$`, "i"),
    `Hệ thống hiện chỉ hỗ trợ nhóm ${DEFAULT_GROUP_ID}.`,
  );

export const adminUserSchema = z.object({
  account: accountSchema,
  password: passwordSchema,
  fullName: fullNameSchema,
  email: emailSchema,
  phone: phoneSchema,
  groupId: adminGroupSchema,
  role: z.enum(["HV", "GV"]),
});

export const adminUserEditSchema = adminUserSchema.extend({
  password: z.string().trim().refine(
    (password) => password.length === 0 || password.length >= 6,
    "Mật khẩu phải có ít nhất 6 ký tự nếu muốn đổi.",
  ),
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
  groupId: adminGroupSchema,
});

export const adminCourseEditSchema = adminCourseSchema.extend({
  courseId: z.string().min(2, "Vui lòng nhập mã khóa học."),
});

export type AdminCourseFormData = z.infer<typeof adminCourseSchema>;
