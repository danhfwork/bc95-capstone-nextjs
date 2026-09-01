"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";

import {
  createUser,
  DEFAULT_GROUP_ID,
  searchUsers,
  updateUser,
  type ApiUserPayload,
} from "@/app/lib/api";
import { getApiErrorMessage } from "@/app/lib/errors";
import { useAuthStore } from "@/app/store/useAuthStore";
import PasswordInput from "@/components/forms/FormControls";
import { Button } from "@/components/ui/button";
import FeedbackAlert from "@/components/ui/feedback-alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { adminUserSchema, type AdminUserFormData } from "./adminSchemas";
import {
  AdminFormActions,
  AdminFormFieldError as FieldError,
  AdminFormLoading,
  adminInputClassName as inputClassName,
  adminLabelClassName,
  adminSelectClassName,
} from "./AdminForm";

type AdminUserFormProps = {
  username?: string;
};

export default function AdminUserForm({ username }: AdminUserFormProps) {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const isEditing = Boolean(username);
  const existingUserQuery = useQuery({
    queryKey: ["admin", "user", username],
    queryFn: async () => {
      const users = await searchUsers(username ?? "", DEFAULT_GROUP_ID);
      return users.find((user) => user.taiKhoan === username) ?? null;
    },
    enabled: isEditing,
  });

  const {
    control,
    register,
    reset,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<AdminUserFormData>({
    resolver: zodResolver(adminUserSchema),
    mode: "onBlur",
    defaultValues: {
      account: username ?? "",
      password: "",
      fullName: "",
      email: "",
      phone: "",
      groupId: DEFAULT_GROUP_ID,
      role: "HV",
    },
  });

  useEffect(() => {
    const user = existingUserQuery.data;

    if (!user) {
      return;
    }

    reset({
      account: user.taiKhoan,
      password: "",
      fullName: user.hoTen,
      email: user.email ?? "",
      phone: user.soDT ?? "",
      groupId: user.maNhom ?? DEFAULT_GROUP_ID,
      role: user.maLoaiNguoiDung === "GV" ? "GV" : "HV",
    });
  }, [existingUserQuery.data, reset]);

  const saveMutation = useMutation({
    mutationFn: async (payload: ApiUserPayload) => {
      if (!currentUser?.accessToken) {
        throw new Error("Missing admin session");
      }

      return isEditing
        ? updateUser(payload, currentUser.accessToken)
        : createUser(payload, currentUser.accessToken);
    },
    onSuccess: () => {
      router.push(`/admin/users?status=${isEditing ? "updated" : "created"}`);
    },
    onError: (error: unknown) => {
      setError("root", {
        type: "server",
        message: getApiErrorMessage(
          error,
          isEditing
            ? "Không thể cập nhật người dùng. Vui lòng kiểm tra dữ liệu."
            : "Không thể tạo người dùng. Tài khoản hoặc email có thể đã tồn tại.",
        ),
      });
      requestAnimationFrame(() =>
        document.getElementById("user-form-server-error")?.focus(),
      );
    },
  });

  const handleSave: SubmitHandler<AdminUserFormData> = (values) => {
    clearErrors("root");
    saveMutation.mutate({
      taiKhoan: values.account,
      matKhau: values.password,
      hoTen: values.fullName,
      soDT: values.phone.replace(/\s/g, ""),
      maNhom: values.groupId.toLocaleUpperCase("vi-VN"),
      email: values.email,
      maLoaiNguoiDung: values.role,
    });
  };

  if (existingUserQuery.isPending && isEditing) {
    return <AdminFormLoading message="Đang tải thông tin người dùng..." />;
  }

  if (isEditing && (existingUserQuery.isError || !existingUserQuery.data)) {
    return (
      <FeedbackAlert type="error" className="rounded-2xl p-6">
        <h2 className="font-bold">Không tìm thấy người dùng</h2>
        <p className="mt-1 text-sm">
          Tài khoản này không tồn tại hoặc không thuộc nhóm {DEFAULT_GROUP_ID}.
        </p>
        <Button
          render={<Link href="/admin/users" />}
          nativeButton={false}
          variant="outline"
          className="mt-4 border-red-300 bg-white text-red-700"
        >
          Quay lại danh sách
        </Button>
      </FeedbackAlert>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(handleSave)}
      onChange={() => clearErrors("root")}
      className="rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      {errors.root?.message ? (
        <FeedbackAlert
          type="error"
          id="user-form-server-error"
          tabIndex={-1}
          className="m-6 outline-none focus:ring-2 focus:ring-red-600"
        >
          {errors.root.message}
        </FeedbackAlert>
      ) : null}

      <div className="grid gap-x-6 px-6 py-7 md:grid-cols-2 md:px-8">
        <div>
          <Label htmlFor="account" className={adminLabelClassName}>
            Tài khoản <span className="text-red-600">*</span>
          </Label>
          <Input
            id="account"
            autoComplete="username"
            readOnly={isEditing}
            aria-invalid={Boolean(errors.account)}
            aria-describedby={errors.account ? "account-error" : undefined}
            placeholder="Ví dụ: nguyenvana"
            className={`${inputClassName} read-only:cursor-not-allowed read-only:bg-slate-100 read-only:text-slate-500`}
            {...register("account")}
          />
          <FieldError id="account-error" message={errors.account?.message} />
        </div>

        <div>
          <Label htmlFor="password" className={adminLabelClassName}>
            {isEditing ? "Mật khẩu mới" : "Mật khẩu"}{" "}
            <span className="text-red-600">*</span>
          </Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            placeholder="Tối thiểu 6 ký tự"
            className={inputClassName}
            {...register("password")}
          />
          <FieldError id="password-error" message={errors.password?.message} />
        </div>

        <div>
          <Label htmlFor="fullName" className={adminLabelClassName}>
            Họ tên <span className="text-red-600">*</span>
          </Label>
          <Input
            id="fullName"
            autoComplete="name"
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
            placeholder="Nguyễn Văn A"
            className={inputClassName}
            {...register("fullName")}
          />
          <FieldError id="fullName-error" message={errors.fullName?.message} />
        </div>

        <div>
          <Label htmlFor="email" className={adminLabelClassName}>
            Email <span className="text-red-600">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            placeholder="email@example.com"
            className={inputClassName}
            {...register("email")}
          />
          <FieldError id="email-error" message={errors.email?.message} />
        </div>

        <div>
          <Label htmlFor="phone" className={adminLabelClassName}>
            Số điện thoại <span className="text-red-600">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            placeholder="0901234567"
            className={inputClassName}
            {...register("phone")}
          />
          <FieldError id="phone-error" message={errors.phone?.message} />
        </div>

        <div>
          <Label htmlFor="groupId" className={adminLabelClassName}>
            Mã nhóm <span className="text-red-600">*</span>
          </Label>
          <Input
            id="groupId"
            autoCapitalize="characters"
            aria-invalid={Boolean(errors.groupId)}
            aria-describedby={errors.groupId ? "groupId-error" : undefined}
            placeholder="GP01"
            className={inputClassName}
            {...register("groupId")}
          />
          <FieldError id="groupId-error" message={errors.groupId?.message} />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="role" className={adminLabelClassName}>
            Loại người dùng <span className="text-red-600">*</span>
          </Label>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="role"
                  aria-invalid={Boolean(errors.role)}
                  aria-describedby={errors.role ? "role-error" : undefined}
                  className={adminSelectClassName}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HV">Học viên</SelectItem>
                  <SelectItem value="GV">Giáo vụ</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <FieldError id="role-error" message={errors.role?.message} />
        </div>
      </div>

      <AdminFormActions
        cancelHref="/admin/users"
        isPending={saveMutation.isPending}
        saveLabel="Lưu thông tin"
      />
    </form>
  );
}
