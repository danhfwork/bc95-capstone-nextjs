"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, LoaderCircle, LockKeyhole, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";

import { signIn } from "@/app/lib/api";
import { getSignInErrorMessage } from "@/app/lib/errors";
import { loginSchema, type LoginFormData } from "@/app/lib/schemas";
import { setSession } from "@/app/lib/session";
import { useAuthStore } from "@/app/store/useAuthStore";
import PasswordInput, {
  authFieldLabelClassName as fieldLabelClassName,
  authInputClassName as inputClassName,
} from "@/components/forms/FormControls";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type LoginFormProps = {
  redirectTo?: string;
};

export default function LoginForm({ redirectTo = "/" }: LoginFormProps) {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const {
    control,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: {
      account: "",
      password: "",
    },
  });

  const handleFormChange = () => {
    clearErrors("root");
  };

  const handleLogin: SubmitHandler<LoginFormData> = async (values) => {
    clearErrors("root");

    try {
      const signedInUser = await signIn({
        taiKhoan: values.account,
        matKhau: values.password,
      });

      setSession(signedInUser);
      setUser(signedInUser);
      router.replace(redirectTo);
    } catch (error: unknown) {
      setError("root", {
        type: "server",
        message: getSignInErrorMessage(error),
      });
    }
  };

  return (
    <>
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold tracking-wider text-blue-600 uppercase">
          Chào mừng trở lại
        </p>
        <h2
          id="login-title"
          className="text-3xl font-bold tracking-tight text-slate-900"
        >
          Đăng nhập
        </h2>
        <p className="mt-1 text-base leading-6 text-slate-500">
          Tiếp tục hành trình chinh phục công nghệ của bạn.
        </p>
      </div>

      <form
        noValidate
        onSubmit={handleSubmit(handleLogin)}
        onChange={handleFormChange}
      >
        <FieldGroup className="gap-2">
          <Controller
            name="account"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-0">
                <FieldLabel htmlFor="account" className={fieldLabelClassName}>
                  Tài khoản
                </FieldLabel>
                <div className="relative">
                  <UserRound
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-3 z-10 size-5 -translate-y-1/2 text-slate-500"
                  />
                  <Input
                    {...field}
                    id="account"
                    type="text"
                    autoComplete="username"
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.error ? "account-error" : undefined
                    }
                    placeholder="Nhập tên đăng nhập hoặc email"
                    className={inputClassName}
                  />
                </div>
                <div className="min-h-6 pt-1">
                  <FieldError
                    id="account-error"
                    errors={[fieldState.error]}
                    className="text-xs leading-5 text-red-600"
                  />
                </div>
              </Field>
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-0">
                <FieldLabel htmlFor="password" className={fieldLabelClassName}>
                  Mật khẩu
                </FieldLabel>
                <PasswordInput
                  {...field}
                  id="password"
                  icon={LockKeyhole}
                  autoComplete="current-password"
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.error ? "password-error" : undefined
                  }
                  placeholder="Nhập mật khẩu"
                  className={inputClassName}
                  toggleClassName="focus-visible:border-transparent focus-visible:ring-blue-600"
                />
                <div className="min-h-6 pt-1">
                  <FieldError
                    id="password-error"
                    errors={[fieldState.error]}
                    className="text-xs leading-5 text-red-600"
                  />
                </div>
              </Field>
            )}
          />
        </FieldGroup>

        {errors.root?.message ? (
          <FieldError className="mt-3 rounded-lg border border-red-600/25 bg-red-50 px-3 py-2.5 text-sm leading-5 text-red-700">
            {errors.root.message}
          </FieldError>
        ) : null}

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="mt-5 h-12 w-full cursor-pointer gap-2 bg-blue-600 px-5 font-semibold text-white shadow-md hover:bg-blue-700 focus-visible:border-blue-600 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed"
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
              Đăng nhập
              <ArrowRight aria-hidden="true" className="size-4" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-8">
        <Separator className="bg-slate-200" />
        <div className="pt-6 text-center text-sm text-slate-700">
          Bạn chưa có tài khoản?{" "}
          <Link
            href="/register"
            className="inline-flex min-h-11 items-center rounded-md px-1 font-semibold text-blue-600 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </>
  );
}
