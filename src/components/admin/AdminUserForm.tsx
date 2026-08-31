"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Eye, EyeOff, LoaderCircle, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
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

type AdminUserFormProps = {
  username?: string;
};

const inputClassName =
  "h-12 border-slate-300 bg-slate-50 text-base text-slate-950 placeholder:text-slate-400 focus-visible:border-blue-600 focus-visible:bg-white focus-visible:ring-blue-100 aria-invalid:border-red-500 aria-invalid:ring-red-100 md:text-sm";

function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <p
      id={id}
      role={message ? "alert" : undefined}
      className="min-h-5 pt-1 text-xs leading-4 text-red-700"
    >
      {message}
    </p>
  );
}

export default function AdminUserForm({ username }: AdminUserFormProps) {
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
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
    return (
      <div className="grid min-h-80 place-items-center rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <LoaderCircle
            aria-hidden="true"
            className="size-5 animate-spin motion-reduce:animate-none"
          />
          Đang tải thông tin người dùng...
        </div>
      </div>
    );
  }

  if (isEditing && (existingUserQuery.isError || !existingUserQuery.data)) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800"
      >
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
      </div>
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
        <div
          id="user-form-server-error"
          tabIndex={-1}
          role="alert"
          className="m-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 outline-none focus:ring-2 focus:ring-red-600"
        >
          {errors.root.message}
        </div>
      ) : null}

      <div className="grid gap-x-6 px-6 py-7 md:grid-cols-2 md:px-8">
        <div>
          <Label
            htmlFor="account"
            className="mb-2 text-sm font-semibold text-slate-900"
          >
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
          <Label
            htmlFor="password"
            className="mb-2 text-sm font-semibold text-slate-900"
          >
            {isEditing ? "Mật khẩu mới" : "Mật khẩu"}{" "}
            <span className="text-red-600">*</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={isPasswordVisible ? "text" : "password"}
              autoComplete="new-password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              placeholder="Tối thiểu 6 ký tự"
              className={`${inputClassName} pr-12`}
              {...register("password")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={isPasswordVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              aria-pressed={isPasswordVisible}
              onClick={() => setIsPasswordVisible((isVisible) => !isVisible)}
              className="absolute inset-y-1 right-1 h-auto w-10 text-slate-500 hover:bg-slate-100"
            >
              {isPasswordVisible ? (
                <EyeOff aria-hidden="true" className="size-5" />
              ) : (
                <Eye aria-hidden="true" className="size-5" />
              )}
            </Button>
          </div>
          <FieldError id="password-error" message={errors.password?.message} />
        </div>

        <div>
          <Label
            htmlFor="fullName"
            className="mb-2 text-sm font-semibold text-slate-900"
          >
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
          <Label
            htmlFor="email"
            className="mb-2 text-sm font-semibold text-slate-900"
          >
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
          <Label
            htmlFor="phone"
            className="mb-2 text-sm font-semibold text-slate-900"
          >
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
          <Label
            htmlFor="groupId"
            className="mb-2 text-sm font-semibold text-slate-900"
          >
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
          <Label
            htmlFor="role"
            className="mb-2 text-sm font-semibold text-slate-900"
          >
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
                  className="h-12 w-full border-slate-300 bg-slate-50 px-3 text-base focus-visible:border-blue-600 focus-visible:ring-blue-100 aria-invalid:border-red-500 aria-invalid:ring-red-100 md:text-sm"
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

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:justify-end md:px-8">
        <Button
          render={<Link href="/admin/users" />}
          nativeButton={false}
          variant="ghost"
          className="min-h-11 text-slate-700"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Hủy
        </Button>
        <Button
          type="submit"
          disabled={saveMutation.isPending}
          className="min-h-11 bg-blue-600 px-5 text-white shadow-sm hover:bg-blue-700"
        >
          {saveMutation.isPending ? (
            <LoaderCircle
              aria-hidden="true"
              className="size-4 animate-spin motion-reduce:animate-none"
            />
          ) : (
            <Save aria-hidden="true" className="size-4" />
          )}
          {saveMutation.isPending ? "Đang lưu..." : "Lưu thông tin"}
        </Button>
      </div>
    </form>
  );
}
