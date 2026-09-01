import { z } from "zod";

import {
  accountSchema,
  emailSchema,
  fullNameSchema,
  passwordSchema,
  phoneSchema,
} from "@/app/lib/schemas";

export const adminUserSchema = z.object({
  account: accountSchema,
  password: passwordSchema,
  fullName: fullNameSchema,
  email: emailSchema,
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
