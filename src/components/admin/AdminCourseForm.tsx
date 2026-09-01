"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ImageUp, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Controller,
  useForm,
  type SubmitErrorHandler,
  type SubmitHandler,
} from "react-hook-form";

import {
  createCourseWithImage,
  DEFAULT_GROUP_ID,
  getCourseById,
  getCourseCategories,
  updateCourseWithImage,
  type ApiCoursePayload,
} from "@/app/lib/api";
import { getApiErrorMessage } from "@/app/lib/errors";
import { useAuthStore } from "@/app/store/useAuthStore";
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
import { Textarea } from "@/components/ui/textarea";

import {
  adminCourseEditSchema,
  adminCourseSchema,
  type AdminCourseFormData,
} from "./adminSchemas";
import {
  AdminFormActions,
  AdminFormFieldError as FieldError,
  AdminFormLoading,
  adminInputClassName as inputClassName,
  adminLabelClassName,
  adminSelectClassName,
} from "./AdminForm";

type AdminCourseFormProps = {
  courseId?: string;
};

type CourseSaveVariables = {
  payload: ApiCoursePayload;
  imageFile: File;
};

function createAlias(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLocaleLowerCase("vi-VN")
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminCourseForm({ courseId }: AdminCourseFormProps) {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const isEditing = Boolean(courseId);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ["course-categories"],
    queryFn: () => getCourseCategories(),
  });
  const courseQuery = useQuery({
    queryKey: ["admin", "course", courseId],
    queryFn: () => getCourseById(courseId ?? ""),
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
  } = useForm<AdminCourseFormData>({
    resolver: zodResolver(
      isEditing ? adminCourseEditSchema : adminCourseSchema,
    ),
    mode: "onBlur",
    defaultValues: {
      courseId: courseId ?? "",
      courseName: "",
      description: "",
      categoryId: "",
      groupId: DEFAULT_GROUP_ID,
    },
  });

  useEffect(() => {
    const course = courseQuery.data;

    if (!course) {
      return;
    }

    reset({
      courseId: course.maKhoaHoc,
      courseName: course.tenKhoaHoc,
      description: course.moTa,
      categoryId: course.danhMucKhoaHoc.maDanhMucKhoahoc,
      groupId: course.maNhom,
    });
  }, [courseQuery.data, reset]);

  const saveMutation = useMutation({
    mutationFn: async ({ payload, imageFile }: CourseSaveVariables) => {
      if (!currentUser?.accessToken) {
        throw new Error("Missing admin session");
      }

      return isEditing
        ? updateCourseWithImage(payload, imageFile)
        : createCourseWithImage(payload, imageFile);
    },
    onSuccess: () => {
      router.push(`/admin/courses?status=${isEditing ? "updated" : "created"}`);
    },
    onError: (error: unknown) => {
      setError("root", {
        type: "server",
        message: getApiErrorMessage(
          error,
          isEditing
            ? "Không thể cập nhật khóa học. Vui lòng kiểm tra dữ liệu."
            : "Không thể tạo khóa học. Mã khóa học có thể đã tồn tại.",
        ),
      });
      requestAnimationFrame(() =>
        document.getElementById("course-form-server-error")?.focus(),
      );
    },
  });

  const handleSave: SubmitHandler<AdminCourseFormData> = (values) => {
    if (!currentUser) {
      return;
    }

    const existingCourse = courseQuery.data;
    clearErrors("root");
    if (!imageFile) {
      setImageError("Vui lòng chọn một tệp hình ảnh để tải lên.");
      requestAnimationFrame(() =>
        document.getElementById("imageFile")?.focus(),
      );
      return;
    }

    const payload: ApiCoursePayload = {
      maKhoaHoc: values.courseId,
      biDanh: existingCourse?.biDanh || createAlias(values.courseName),
      tenKhoaHoc: values.courseName,
      moTa: values.description,
      luotXem: existingCourse?.luotXem ?? 0,
      danhGia: existingCourse?.danhGia ?? 0,
      hinhAnh: imageFile.name,
      maNhom: values.groupId.toLocaleUpperCase("vi-VN"),
      ngayTao: existingCourse?.ngayTao || format(new Date(), "dd/MM/yyyy"),
      maDanhMucKhoaHoc: values.categoryId,
      taiKhoanNguoiTao:
        existingCourse?.nguoiTao.taiKhoan || currentUser.taiKhoan,
    };

    saveMutation.mutate({ payload, imageFile });
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (file && !file.type.startsWith("image/")) {
      setImageFile(null);
      setImageError("Tệp đã chọn không phải là hình ảnh.");
      event.currentTarget.value = "";
      return;
    }

    setImageFile(file);
    setImageError(file ? null : "Vui lòng chọn một tệp hình ảnh để tải lên.");
  };

  const handleInvalid: SubmitErrorHandler<AdminCourseFormData> = (
    validationErrors,
  ) => {
    if (!imageFile) {
      setImageError(
        (currentError) =>
          currentError ?? "Vui lòng chọn một tệp hình ảnh để tải lên.",
      );
    }

    const hasFieldError = Object.keys(validationErrors).some(
      (fieldName) => fieldName !== "root",
    );

    if (!imageFile && !hasFieldError) {
      requestAnimationFrame(() =>
        document.getElementById("imageFile")?.focus(),
      );
    }
  };

  if ((courseQuery.isPending && isEditing) || categoriesQuery.isPending) {
    return <AdminFormLoading message="Đang tải dữ liệu khóa học..." />;
  }

  if (categoriesQuery.isError || (isEditing && courseQuery.isError)) {
    return (
      <FeedbackAlert type="error" className="rounded-2xl p-6">
        Không thể tải thông tin khóa học. Vui lòng quay lại và thử lại.
      </FeedbackAlert>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(handleSave, handleInvalid)}
      onChange={() => clearErrors("root")}
      className="rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      {errors.root?.message ? (
        <FeedbackAlert
          type="error"
          id="course-form-server-error"
          tabIndex={-1}
          className="m-6 outline-none focus:ring-2 focus:ring-red-600"
        >
          {errors.root.message}
        </FeedbackAlert>
      ) : null}

      <div className="grid gap-x-6 px-6 py-7 md:grid-cols-2 md:px-8">
        <div>
          <Label htmlFor="courseId" className={adminLabelClassName}>
            Mã khóa học <span className="text-red-600">*</span>
          </Label>
          <Input
            id="courseId"
            readOnly={isEditing}
            aria-invalid={Boolean(errors.courseId)}
            aria-describedby={
              errors.courseId ? "courseId-help courseId-error" : "courseId-help"
            }
            placeholder="BC95_NEXTJS"
            className={`${inputClassName} read-only:cursor-not-allowed read-only:bg-slate-100 read-only:text-slate-500`}
            {...register("courseId")}
          />
          <p id="courseId-help" className="pt-1 text-xs text-slate-500">
            {isEditing
              ? "Mã khóa học không thể thay đổi."
              : "Không sử dụng khoảng trắng trong mã khóa học."}
          </p>
          <FieldError id="courseId-error" message={errors.courseId?.message} />
        </div>
        <div>
          <Label htmlFor="courseName" className={adminLabelClassName}>
            Tên khóa học <span className="text-red-600">*</span>
          </Label>
          <Input
            id="courseName"
            aria-invalid={Boolean(errors.courseName)}
            aria-describedby={
              errors.courseName ? "courseName-error" : undefined
            }
            placeholder="Lập trình Next.js"
            className={inputClassName}
            {...register("courseName")}
          />
          <FieldError
            id="courseName-error"
            message={errors.courseName?.message}
          />
        </div>
        <div>
          <Label htmlFor="categoryId" className={adminLabelClassName}>
            Danh mục <span className="text-red-600">*</span>
          </Label>
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="categoryId"
                  aria-invalid={Boolean(errors.categoryId)}
                  aria-describedby={
                    errors.categoryId ? "categoryId-error" : undefined
                  }
                  className={adminSelectClassName}
                >
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {(categoriesQuery.data ?? []).map((category) => (
                    <SelectItem
                      key={category.maDanhMuc}
                      value={category.maDanhMuc}
                    >
                      {category.tenDanhMuc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError
            id="categoryId-error"
            message={errors.categoryId?.message}
          />
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
          <Label htmlFor="imageFile" className={adminLabelClassName}>
            Hình ảnh khóa học <span className="text-red-600">*</span>
          </Label>
          <label
            htmlFor="imageFile"
            className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2"
          >
            <Upload aria-hidden="true" className="size-4" />
            {imageFile ? imageFile.name : "Chọn tệp hình ảnh"}
            <input
              id="imageFile"
              type="file"
              accept="image/*"
              className="sr-only"
              aria-invalid={Boolean(imageError)}
              aria-describedby={imageError ? "imageFile-error" : undefined}
              onChange={handleImageChange}
            />
          </label>
          <FieldError id="imageFile-error" message={imageError ?? undefined} />
          {imageFile ? (
            <div className="mt-2 flex items-center gap-2 text-xs font-medium text-blue-700">
              <ImageUp aria-hidden="true" className="size-4" />
              Sẵn sàng tải lên: {imageFile.name}
            </div>
          ) : null}
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="description" className={adminLabelClassName}>
            Mô tả <span className="text-red-600">*</span>
          </Label>
          <Textarea
            id="description"
            rows={6}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={
              errors.description ? "description-error" : undefined
            }
            placeholder="Mô tả nội dung và mục tiêu của khóa học"
            className="min-h-36 border-slate-300 bg-slate-50 text-base text-slate-950 placeholder:text-slate-400 focus-visible:border-blue-600 focus-visible:bg-white focus-visible:ring-blue-100 aria-invalid:border-red-500 aria-invalid:ring-red-100 md:text-sm"
            {...register("description")}
          />
          <FieldError
            id="description-error"
            message={errors.description?.message}
          />
        </div>
      </div>

      <AdminFormActions
        cancelHref="/admin/courses"
        isPending={saveMutation.isPending}
        saveLabel="Lưu khóa học"
      />
    </form>
  );
}
