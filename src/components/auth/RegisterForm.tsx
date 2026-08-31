"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Contact,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";

import { DEFAULT_GROUP_ID, signUp } from "@/app/lib/api";
import { getSignUpErrorMessage } from "@/app/lib/errors";
import { registerSchema, type RegisterFormData } from "@/app/lib/schemas";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const inputClassName =
  "h-12 bg-slate-50 pl-11 text-base text-slate-900 placeholder:text-slate-500 focus-visible:border-blue-600 focus-visible:bg-white focus-visible:ring-blue-100 aria-invalid:border-red-500 aria-invalid:ring-red-100 md:text-base";

const fieldLabelClassName =
  "mb-2 text-sm leading-5 font-semibold text-slate-900";

export default function RegisterForm() {
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const {
    control,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: {
      account: "",
      fullName: "",
      password: "",
      confirmPassword: "",
      email: "",
      phone: "",
    },
  });

  const handleFormChange = () => {
    clearErrors("root");
  };

  const handleRegister: SubmitHandler<RegisterFormData> = async (values) => {
    clearErrors("root");

    try {
      await signUp({
        taiKhoan: values.account,
        matKhau: values.password,
        hoTen: values.fullName,
        soDT: values.phone.replace(/\s/g, ""),
        maNhom: DEFAULT_GROUP_ID,
        email: values.email,
      });

      router.replace("/login");
    } catch (error: unknown) {
      setError("root", {
        type: "server",
        message: getSignUpErrorMessage(error),
      });
    }
  };

  return (
    <>
      <div className="mb-6">
        <p className="mb-2 text-sm font-semibold tracking-wider text-blue-600 uppercase">
          Bắt đầu hành trình
        </p>
        <h2
          id="register-title"
          className="text-3xl font-bold tracking-tight text-slate-900"
        >
          Đăng ký tài khoản
        </h2>
        <p className="mt-1 text-base leading-6 text-slate-500">
          Vui lòng điền đầy đủ thông tin để tham gia khóa học.
        </p>
      </div>

      <form
        noValidate
        onSubmit={handleSubmit(handleRegister)}
        onChange={handleFormChange}
      >
        <FieldGroup className="gap-2">
          <Controller
            name="account"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-0">
                <FieldLabel
                  htmlFor="register-account"
                  className={fieldLabelClassName}
                >
                  Tài khoản
                </FieldLabel>
                <div className="relative">
                  <UserRound
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-3 z-10 size-5 -translate-y-1/2 text-slate-500"
                  />
                  <Input
                    {...field}
                    id="register-account"
                    type="text"
                    required
                    autoComplete="username"
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.error ? "register-account-error" : undefined
                    }
                    placeholder="Nhập tên đăng nhập"
                    className={inputClassName}
                  />
                </div>
                <div className="min-h-6 pt-1">
                  <FieldError
                    id="register-account-error"
                    errors={[fieldState.error]}
                    className="text-xs leading-5 text-red-600"
                  />
                </div>
              </Field>
            )}
          />

          <Controller
            name="fullName"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-0">
                <FieldLabel
                  htmlFor="register-full-name"
                  className={fieldLabelClassName}
                >
                  Họ tên
                </FieldLabel>
                <div className="relative">
                  <Contact
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-3 z-10 size-5 -translate-y-1/2 text-slate-500"
                  />
                  <Input
                    {...field}
                    id="register-full-name"
                    type="text"
                    required
                    autoComplete="name"
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.error ? "register-full-name-error" : undefined
                    }
                    placeholder="Nhập họ và tên"
                    className={inputClassName}
                  />
                </div>
                <div className="min-h-6 pt-1">
                  <FieldError
                    id="register-full-name-error"
                    errors={[fieldState.error]}
                    className="text-xs leading-5 text-red-600"
                  />
                </div>
              </Field>
            )}
          />

          <div className="grid grid-cols-1 gap-x-5 md:grid-cols-2">
            <Controller
              name="password"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-0">
                  <FieldLabel
                    htmlFor="register-password"
                    className={fieldLabelClassName}
                  >
                    Mật khẩu
                  </FieldLabel>
                  <div className="relative">
                    <LockKeyhole
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 left-3 z-10 size-5 -translate-y-1/2 text-slate-500"
                    />
                    <Input
                      {...field}
                      id="register-password"
                      type={isPasswordVisible ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      aria-invalid={fieldState.invalid}
                      aria-describedby={
                        fieldState.error ? "register-password-error" : undefined
                      }
                      placeholder="Nhập mật khẩu"
                      className={`${inputClassName} pr-12`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={
                        isPasswordVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                      }
                      aria-pressed={isPasswordVisible}
                      className="absolute inset-y-1 right-1 h-auto w-10 cursor-pointer text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:border-transparent focus-visible:ring-blue-600"
                      onClick={() =>
                        setIsPasswordVisible((isVisible) => !isVisible)
                      }
                    >
                      {isPasswordVisible ? (
                        <EyeOff aria-hidden="true" className="size-5" />
                      ) : (
                        <Eye aria-hidden="true" className="size-5" />
                      )}
                    </Button>
                  </div>
                  <div className="min-h-6 pt-1">
                    <FieldError
                      id="register-password-error"
                      errors={[fieldState.error]}
                      className="text-xs leading-5 text-red-600"
                    />
                  </div>
                </Field>
              )}
            />

            <Controller
              name="confirmPassword"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-0">
                  <FieldLabel
                    htmlFor="register-confirm-password"
                    className={fieldLabelClassName}
                  >
                    Xác nhận mật khẩu
                  </FieldLabel>
                  <div className="relative">
                    <KeyRound
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 left-3 z-10 size-5 -translate-y-1/2 text-slate-500"
                    />
                    <Input
                      {...field}
                      id="register-confirm-password"
                      type={isConfirmPasswordVisible ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      aria-invalid={fieldState.invalid}
                      aria-describedby={
                        fieldState.error
                          ? "register-confirm-password-error"
                          : undefined
                      }
                      placeholder="Nhập lại mật khẩu"
                      className={`${inputClassName} pr-12`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={
                        isConfirmPasswordVisible
                          ? "Ẩn mật khẩu xác nhận"
                          : "Hiện mật khẩu xác nhận"
                      }
                      aria-pressed={isConfirmPasswordVisible}
                      className="absolute inset-y-1 right-1 h-auto w-10 cursor-pointer text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:border-transparent focus-visible:ring-blue-600"
                      onClick={() =>
                        setIsConfirmPasswordVisible((isVisible) => !isVisible)
                      }
                    >
                      {isConfirmPasswordVisible ? (
                        <EyeOff aria-hidden="true" className="size-5" />
                      ) : (
                        <Eye aria-hidden="true" className="size-5" />
                      )}
                    </Button>
                  </div>
                  <div className="min-h-6 pt-1">
                    <FieldError
                      id="register-confirm-password-error"
                      errors={[fieldState.error]}
                      className="text-xs leading-5 text-red-600"
                    />
                  </div>
                </Field>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-x-5 md:grid-cols-2">
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-0">
                  <FieldLabel
                    htmlFor="register-email"
                    className={fieldLabelClassName}
                  >
                    Email
                  </FieldLabel>
                  <div className="relative">
                    <Mail
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 left-3 z-10 size-5 -translate-y-1/2 text-slate-500"
                    />
                    <Input
                      {...field}
                      id="register-email"
                      type="email"
                      required
                      autoComplete="email"
                      aria-invalid={fieldState.invalid}
                      aria-describedby={
                        fieldState.error ? "register-email-error" : undefined
                      }
                      placeholder="example@gmail.com"
                      className={inputClassName}
                    />
                  </div>
                  <div className="min-h-6 pt-1">
                    <FieldError
                      id="register-email-error"
                      errors={[fieldState.error]}
                      className="text-xs leading-5 text-red-600"
                    />
                  </div>
                </Field>
              )}
            />

            <Controller
              name="phone"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-0">
                  <FieldLabel
                    htmlFor="register-phone"
                    className={fieldLabelClassName}
                  >
                    Số điện thoại
                  </FieldLabel>
                  <div className="relative">
                    <Phone
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 left-3 z-10 size-5 -translate-y-1/2 text-slate-500"
                    />
                    <Input
                      {...field}
                      id="register-phone"
                      type="tel"
                      required
                      inputMode="tel"
                      autoComplete="tel"
                      aria-invalid={fieldState.invalid}
                      aria-describedby={
                        fieldState.error ? "register-phone-error" : undefined
                      }
                      placeholder="090 123 4567"
                      className={inputClassName}
                    />
                  </div>
                  <div className="min-h-6 pt-1">
                    <FieldError
                      id="register-phone-error"
                      errors={[fieldState.error]}
                      className="text-xs leading-5 text-red-600"
                    />
                  </div>
                </Field>
              )}
            />
          </div>
        </FieldGroup>

        {errors.root?.message ? (
          <FieldError className="mt-2 rounded-lg border border-red-600/25 bg-red-50 px-3 py-2.5 text-sm leading-5 text-red-700">
            {errors.root.message}
          </FieldError>
        ) : null}

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="mt-4 h-12 w-full cursor-pointer gap-2 bg-blue-600 px-5 font-semibold text-white shadow-md hover:bg-blue-700 focus-visible:border-blue-600 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin motion-reduce:animate-none"
              />
              Đang xử lý...
            </>
          ) : (
            <>
              Đăng ký ngay
              <ArrowRight aria-hidden="true" className="size-4" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6">
        <Separator className="bg-slate-200" />
        <div className="pt-5 text-center text-sm text-slate-700">
          Bạn đã có tài khoản?{" "}
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center rounded-md px-1 font-semibold text-blue-600 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </>
  );
}
