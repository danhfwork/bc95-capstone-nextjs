"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CircleAlert,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Pencil,
  Phone,
  Save,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";

import {
  DEFAULT_GROUP_ID,
  getAccountInfo,
  updateCurrentUserProfile,
  type ApiAccount,
} from "@/app/lib/api";
import { getProfileUpdateErrorMessage } from "@/app/lib/errors";
import { profileSchema, type ProfileFormData } from "@/app/lib/schemas";
import { updateSessionUser } from "@/app/lib/session";
import { useAuthStore } from "@/app/store/useAuthStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type ProfileUpdateDialogProps = {
  account: ApiAccount;
  accessToken: string;
  onUpdated: (account: ApiAccount) => void;
};

const inputClassName =
  "h-12 border-slate-300 bg-white text-base text-slate-900 shadow-sm focus-visible:border-blue-600 focus-visible:ring-blue-100 aria-invalid:border-red-500 aria-invalid:ring-red-100 md:text-sm";

export default function ProfileUpdateDialog({
  account,
  accessToken,
  onUpdated,
}: ProfileUpdateDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);
  const {
    control,
    handleSubmit,
    clearErrors,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: {
      fullName: account.hoTen,
      email: account.email,
      phone: account.soDT,
      password: "",
    },
  });

  const handleOpenChange = (open: boolean) => {
    if (!open && isSubmitting) {
      return;
    }

    setIsOpen(open);

    if (!open) {
      reset({
        fullName: account.hoTen,
        email: account.email,
        phone: account.soDT,
        password: "",
      });
    }
  };

  const handleUpdate: SubmitHandler<ProfileFormData> = async (values) => {
    clearErrors("root");

    try {
      await updateCurrentUserProfile(
        {
          taiKhoan: account.taiKhoan,
          ...(values.password ? { matKhau: values.password } : {}),
          hoTen: values.fullName,
          soDT: values.phone.replace(/\s/g, ""),
          maLoaiNguoiDung: account.maLoaiNguoiDung,
          maNhom: account.maNhom ?? DEFAULT_GROUP_ID,
          email: values.email,
        },
        accessToken,
      );

      const updatedAccount = await getAccountInfo(accessToken);
      const updatedSession = updateSessionUser(updatedAccount);

      if (updatedSession) {
        setUser(updatedSession);
      }

      onUpdated(updatedAccount);
      setIsOpen(false);
      reset({
        fullName: updatedAccount.hoTen,
        email: updatedAccount.email,
        phone: updatedAccount.soDT,
        password: "",
      });
    } catch (error: unknown) {
      setError("root", {
        type: "server",
        message: getProfileUpdateErrorMessage(error),
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button className="h-11 bg-blue-700 px-4 text-white hover:bg-blue-800 focus-visible:ring-blue-600" />
        }
      >
        <Pencil aria-hidden="true" className="size-4" />
        Cập nhật thông tin
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="max-h-dvh gap-0 overflow-hidden border border-slate-200 bg-white p-0 shadow-2xl sm:max-w-2xl"
      >
        <form
          noValidate
          onSubmit={handleSubmit(handleUpdate)}
          onChange={() => clearErrors("root")}
          className="flex min-h-0 flex-col"
        >
          <div className="relative shrink-0 border-b border-blue-100 bg-blue-50 px-5 py-5 sm:px-6">
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-lg"
                  disabled={isSubmitting}
                  aria-label="Đóng cửa sổ cập nhật"
                  className="absolute top-4 right-4 cursor-pointer text-slate-500 hover:bg-white hover:text-slate-900 focus-visible:ring-blue-600"
                />
              }
            >
              <X aria-hidden="true" className="size-5" />
            </DialogClose>

            <DialogHeader className="pr-12">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-700 text-white shadow-sm"
                >
                  <Pencil className="size-5" />
                </span>
                <div>
                  <DialogTitle className="text-xl leading-7 font-bold text-slate-950 sm:text-2xl">
                    Cập nhật thông tin cá nhân
                  </DialogTitle>
                  <DialogDescription className="mt-1 max-w-xl leading-6 text-slate-600">
                    Kiểm tra thông tin tài khoản và chỉnh sửa các trường bạn
                    muốn cập nhật.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="min-h-0 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
            {errors.root?.message ? (
              <FieldError className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
                <CircleAlert
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0"
                />
                <span>{errors.root.message}</span>
              </FieldError>
            ) : null}

            <fieldset>
              <legend className="text-base font-semibold text-slate-950">
                Thông tin cá nhân
              </legend>

              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <Controller
                  name="fullName"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="gap-1.5"
                    >
                      <FieldLabel
                        htmlFor="profile-full-name"
                        className="font-semibold text-slate-800"
                      >
                        <UserRound aria-hidden="true" className="size-4" />
                        Họ tên
                        <span aria-hidden="true" className="text-red-600">
                          *
                        </span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id="profile-full-name"
                        type="text"
                        required
                        autoComplete="name"
                        aria-invalid={fieldState.invalid}
                        aria-describedby={
                          fieldState.error
                            ? "profile-full-name-error"
                            : undefined
                        }
                        className={inputClassName}
                      />
                      <FieldError
                        id="profile-full-name-error"
                        errors={[fieldState.error]}
                        className="text-xs leading-5 text-red-600"
                      />
                    </Field>
                  )}
                />

                <Controller
                  name="phone"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="gap-1.5"
                    >
                      <FieldLabel
                        htmlFor="profile-phone"
                        className="font-semibold text-slate-800"
                      >
                        <Phone aria-hidden="true" className="size-4" />
                        Số điện thoại
                        <span aria-hidden="true" className="text-red-600">
                          *
                        </span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id="profile-phone"
                        type="tel"
                        required
                        inputMode="tel"
                        autoComplete="tel"
                        aria-invalid={fieldState.invalid}
                        aria-describedby={
                          fieldState.error ? "profile-phone-error" : undefined
                        }
                        className={inputClassName}
                      />
                      <FieldError
                        id="profile-phone-error"
                        errors={[fieldState.error]}
                        className="text-xs leading-5 text-red-600"
                      />
                    </Field>
                  )}
                />

                <Controller
                  name="email"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="gap-1.5 sm:col-span-2"
                    >
                      <FieldLabel
                        htmlFor="profile-email"
                        className="font-semibold text-slate-800"
                      >
                        <Mail aria-hidden="true" className="size-4" />
                        Email
                        <span aria-hidden="true" className="text-red-600">
                          *
                        </span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id="profile-email"
                        type="email"
                        required
                        autoComplete="email"
                        aria-invalid={fieldState.invalid}
                        aria-describedby={
                          fieldState.error ? "profile-email-error" : undefined
                        }
                        className={inputClassName}
                      />
                      <FieldError
                        id="profile-email-error"
                        errors={[fieldState.error]}
                        className="text-xs leading-5 text-red-600"
                      />
                    </Field>
                  )}
                />

                <Controller
                  name="password"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="gap-1.5 sm:col-span-2"
                    >
                      <FieldLabel
                        htmlFor="profile-password"
                        className="font-semibold text-slate-800"
                      >
                        <LockKeyhole aria-hidden="true" className="size-4" />
                        Mật khẩu mới
                      </FieldLabel>
                      <Input
                        {...field}
                        id="profile-password"
                        type="password"
                        autoComplete="new-password"
                        aria-invalid={fieldState.invalid}
                        aria-describedby={
                          fieldState.error
                            ? "profile-password-error"
                            : undefined
                        }
                        placeholder="Nếu muốn thay đổi mật khẩu, vui lòng nhập mật khẩu mới"
                        className={inputClassName}
                      />
                      <FieldError
                        id="profile-password-error"
                        errors={[fieldState.error]}
                        className="text-xs leading-5 text-red-600"
                      />
                    </Field>
                  )}
                />
              </div>
            </fieldset>
          </div>

          <DialogFooter className="mx-0 mt-0 mb-0 shrink-0 rounded-none border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  className="h-11 cursor-pointer px-4"
                />
              }
            >
              Hủy
            </DialogClose>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 min-w-32 cursor-pointer bg-blue-700 px-4 text-white hover:bg-blue-800 focus-visible:ring-blue-600"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle
                    aria-hidden="true"
                    className="size-4 animate-spin motion-reduce:animate-none"
                  />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save aria-hidden="true" className="size-4" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
