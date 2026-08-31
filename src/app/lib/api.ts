import { axiosClient, getAuthorizationHeaders } from "./axiosClient";

export const DEFAULT_GROUP_ID = "GP01";

export type ApiPaginatedResponse<T> = {
  currentPage: number;
  count: number;
  totalPages: number;
  totalCount: number;
  items: T[];
};

export type ApiCourseCategory = {
  maDanhMuc: string;
  tenDanhMuc: string;
};

export type ApiCourseCreator = {
  taiKhoan: string;
  hoTen: string;
  maLoaiNguoiDung: string;
  tenLoaiNguoiDung: string;
};

export type ApiCourseCategoryDetail = {
  maDanhMucKhoahoc: string;
  tenDanhMucKhoaHoc: string;
};

export type ApiCourse = {
  maKhoaHoc: string;
  biDanh: string;
  tenKhoaHoc: string;
  moTa: string;
  luotXem: number;
  hinhAnh: string;
  maNhom: string;
  ngayTao: string;
  soLuongHocVien: number;
  danhGia?: number;
  nguoiTao: ApiCourseCreator;
  danhMucKhoaHoc: ApiCourseCategoryDetail;
};

export type ApiCoursePayload = {
  maKhoaHoc: string;
  biDanh: string;
  tenKhoaHoc: string;
  moTa: string;
  luotXem: number;
  danhGia: number;
  hinhAnh: string;
  maNhom: string;
  ngayTao: string;
  maDanhMucKhoaHoc: string;
  taiKhoanNguoiTao: string;
};

export type ApiUserSummary = {
  taiKhoan: string;
  hoTen: string;
  biDanh?: string;
  soDT?: string;
  maNhom?: string | null;
  email?: string;
  maLoaiNguoiDung?: string;
  tenLoaiNguoiDung?: string;
};

export type ApiAccountUser = {
  taiKhoan: string;
  hoTen: string;
  soDT: string;
  maNhom: string | null;
  email: string;
  maLoaiNguoiDung: string;
  tenLoaiNguoiDung?: string;
};

export type ApiUserType = {
  maLoaiNguoiDung: string;
  tenLoaiNguoiDung: string;
};

export type ApiSignInPayload = {
  taiKhoan: string;
  matKhau: string;
};

export type ApiSignInResponse = ApiAccountUser & {
  accessToken: string;
};

export type ApiSignUpPayload = {
  taiKhoan: string;
  matKhau: string;
  hoTen: string;
  soDT: string;
  maNhom: string;
  email: string;
};

export type ApiUserPayload = ApiSignUpPayload & {
  maLoaiNguoiDung: string;
};

export type ApiProfileUpdatePayload = Omit<ApiUserPayload, "matKhau"> & {
  matKhau?: string;
};

export type ApiEnrollmentPayload = {
  maKhoaHoc: string;
  taiKhoan: string;
};

export type ApiAccountCourse = {
  maKhoaHoc: string;
  tenKhoaHoc: string;
  hinhAnh: string;
  moTa: string;
  ngayTao: string;
  danhGia: number;
  luotXem: number;
};

export type ApiEnrollmentCourse = {
  maKhoaHoc: string;
  tenKhoaHoc: string;
};

export type ApiAccount = ApiAccountUser & {
  chiTietKhoaHocGhiDanh: ApiAccountCourse[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getRequiredString(
  record: Record<string, unknown>,
  key: string,
): string {
  const value = record[key];

  if (typeof value !== "string") {
    throw new Error(`API response is missing string field: ${key}`);
  }

  return value;
}

function getRequiredNumber(
  record: Record<string, unknown>,
  key: string,
): number {
  const value = record[key];

  if (typeof value !== "number") {
    throw new Error(`API response is missing number field: ${key}`);
  }

  return value;
}

function normalizeUserSummary(value: unknown): ApiUserSummary {
  if (!isRecord(value)) {
    throw new Error("API returned an invalid user response");
  }

  const phone = typeof value.soDT === "string" ? value.soDT : value.soDt;

  return {
    taiKhoan: getRequiredString(value, "taiKhoan"),
    hoTen: getRequiredString(value, "hoTen"),
    ...(typeof value.biDanh === "string" ? { biDanh: value.biDanh } : {}),
    ...(typeof phone === "string" ? { soDT: phone } : {}),
    ...(typeof value.maNhom === "string" || value.maNhom === null
      ? { maNhom: value.maNhom }
      : {}),
    ...(typeof value.email === "string" ? { email: value.email } : {}),
    ...(typeof value.maLoaiNguoiDung === "string"
      ? { maLoaiNguoiDung: value.maLoaiNguoiDung }
      : {}),
    ...(typeof value.tenLoaiNguoiDung === "string"
      ? { tenLoaiNguoiDung: value.tenLoaiNguoiDung }
      : {}),
  };
}

function normalizeAccountUser(value: unknown): ApiAccountUser {
  if (!isRecord(value)) {
    throw new Error("API returned an invalid account response");
  }

  const user = normalizeUserSummary(value);

  return {
    taiKhoan: user.taiKhoan,
    hoTen: user.hoTen,
    soDT: getRequiredString(
      value,
      typeof value.soDT === "string" ? "soDT" : "soDt",
    ),
    maNhom: typeof value.maNhom === "string" ? value.maNhom : null,
    email: getRequiredString(value, "email"),
    maLoaiNguoiDung: getRequiredString(value, "maLoaiNguoiDung"),
    ...(user.tenLoaiNguoiDung
      ? { tenLoaiNguoiDung: user.tenLoaiNguoiDung }
      : {}),
  };
}

function normalizeAccountCourse(value: unknown): ApiAccountCourse {
  if (!isRecord(value)) {
    throw new Error("API returned an invalid enrolled course response");
  }

  return {
    maKhoaHoc: getRequiredString(value, "maKhoaHoc"),
    tenKhoaHoc: getRequiredString(value, "tenKhoaHoc"),
    hinhAnh: getRequiredString(value, "hinhAnh"),
    moTa: getRequiredString(value, "moTa"),
    ngayTao: getRequiredString(value, "ngayTao"),
    danhGia: getRequiredNumber(value, "danhGia"),
    luotXem: getRequiredNumber(value, "luotXem"),
  };
}

function normalizeAccount(value: unknown): ApiAccount {
  if (!isRecord(value)) {
    throw new Error("API returned an invalid account response");
  }

  const enrolledCourses = value.chiTietKhoaHocGhiDanh;

  if (enrolledCourses !== undefined && !Array.isArray(enrolledCourses)) {
    throw new Error("API returned an invalid enrolled course list");
  }

  return {
    ...normalizeAccountUser(value),
    chiTietKhoaHocGhiDanh: (enrolledCourses ?? []).map(normalizeAccountCourse),
  };
}

function normalizeUserList(value: unknown): ApiUserSummary[] {
  if (!Array.isArray(value)) {
    throw new Error("API returned an invalid user list");
  }

  return value.map(normalizeUserSummary);
}

function normalizeUserTypes(value: unknown): ApiUserType[] {
  if (!Array.isArray(value)) {
    throw new Error("API returned an invalid user type list");
  }

  return value.map((userType) => {
    if (!isRecord(userType)) {
      throw new Error("API returned an invalid user type response");
    }

    return {
      maLoaiNguoiDung: getRequiredString(userType, "maLoaiNguoiDung"),
      tenLoaiNguoiDung: getRequiredString(userType, "tenLoaiNguoiDung"),
    };
  });
}

function normalizeEnrollmentCourses(value: unknown): ApiEnrollmentCourse[] {
  if (!Array.isArray(value)) {
    throw new Error("API returned an invalid enrollment course list");
  }

  return value.map((course) => {
    if (!isRecord(course)) {
      throw new Error("API returned an invalid enrollment course response");
    }

    return {
      maKhoaHoc: getRequiredString(course, "maKhoaHoc"),
      tenKhoaHoc: getRequiredString(course, "tenKhoaHoc"),
    };
  });
}

function normalizeMessage(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (isRecord(value)) {
    if (typeof value.content === "string") {
      return value.content;
    }

    if (typeof value.message === "string") {
      return value.message;
    }
  }

  return "";
}

export const getCourseCategories = async (
  categoryName = "",
): Promise<ApiCourseCategory[]> => {
  const normalizedCategoryName = categoryName.trim();
  const { data } = await axiosClient.get<ApiCourseCategory[]>(
    "/QuanLyKhoaHoc/LayDanhMucKhoaHoc",
    {
      params: {
        ...(normalizedCategoryName
          ? { tenDanhMuc: normalizedCategoryName }
          : {}),
      },
    },
  );

  return data;
};

export const getCoursesByCategory = async (
  categoryId: string,
  groupId = DEFAULT_GROUP_ID,
): Promise<ApiCourse[]> => {
  const { data } = await axiosClient.get<ApiCourse[]>(
    "/QuanLyKhoaHoc/LayKhoaHocTheoDanhMuc",
    {
      params: {
        maDanhMuc: categoryId,
        MaNhom: groupId,
      },
    },
  );

  return data;
};

export const getCoursesPaged = async (
  page = 1,
  pageSize = 10,
  courseName = "",
  groupId = DEFAULT_GROUP_ID,
): Promise<ApiPaginatedResponse<ApiCourse>> => {
  const normalizedCourseName = courseName.trim();
  const { data } = await axiosClient.get<ApiPaginatedResponse<ApiCourse>>(
    "/QuanLyKhoaHoc/LayDanhSachKhoaHoc_PhanTrang",
    {
      params: {
        ...(normalizedCourseName ? { tenKhoaHoc: normalizedCourseName } : {}),
        page,
        pageSize,
        MaNhom: groupId,
      },
    },
  );

  return data;
};

export const getCourseById = async (courseId: string): Promise<ApiCourse> => {
  const { data } = await axiosClient.get<ApiCourse>(
    "/QuanLyKhoaHoc/LayThongTinKhoaHoc",
    {
      params: {
        maKhoaHoc: courseId,
      },
    },
  );

  return data;
};

export const deleteCourse = async (
  courseId: string,
  accessToken: string,
): Promise<string> => {
  const { data } = await axiosClient.delete<unknown>(
    "/QuanLyKhoaHoc/XoaKhoaHoc",
    {
      params: {
        MaKhoaHoc: courseId,
      },
      headers: getAuthorizationHeaders(accessToken),
    },
  );

  return normalizeMessage(data);
};

export const enrollStudentInCourse = async (
  payload: ApiEnrollmentPayload,
  accessToken: string,
): Promise<string> => {
  const { data } = await axiosClient.post<unknown>(
    "/QuanLyKhoaHoc/GhiDanhKhoaHoc",
    payload,
    {
      headers: getAuthorizationHeaders(accessToken),
    },
  );

  return normalizeMessage(data);
};

export const registerCourse = async (
  payload: ApiEnrollmentPayload,
  accessToken: string,
): Promise<string> => {
  const { data } = await axiosClient.post<unknown>(
    "/QuanLyKhoaHoc/DangKyKhoaHoc",
    payload,
    {
      headers: getAuthorizationHeaders(accessToken),
    },
  );

  return normalizeMessage(data);
};

export const cancelCourseRegistration = async (
  payload: ApiEnrollmentPayload,
  accessToken: string,
): Promise<string> => {
  const { data } = await axiosClient.post<unknown>(
    "/QuanLyKhoaHoc/HuyGhiDanh",
    payload,
    {
      headers: getAuthorizationHeaders(accessToken),
    },
  );

  return normalizeMessage(data);
};

function createCourseImageFormData(
  payload: ApiCoursePayload,
  file: File,
): FormData {
  const formData = new FormData();

  Object.entries(payload).forEach(([fieldName, value]) => {
    formData.append(fieldName, String(value));
  });
  formData.set("hinhAnh", file.name);
  formData.append("File", file, file.name);

  return formData;
}

export const createCourseWithImage = async (
  payload: ApiCoursePayload,
  file: File,
): Promise<unknown> => {
  const formData = createCourseImageFormData(payload, file);
  const { data } = await axiosClient.post<unknown>(
    "/QuanLyKhoaHoc/ThemKhoaHocUploadHinh",
    formData,
  );

  return data;
};

export const updateCourseWithImage = async (
  payload: ApiCoursePayload,
  file: File,
): Promise<unknown> => {
  const formData = createCourseImageFormData(payload, file);
  const { data } = await axiosClient.post<unknown>(
    "/QuanLyKhoaHoc/CapNhatKhoaHocUpload",
    formData,
  );

  return data;
};

export const getUserTypes = async (): Promise<ApiUserType[]> => {
  const { data } = await axiosClient.get<unknown>(
    "/QuanLyNguoiDung/LayDanhSachLoaiNguoiDung",
  );

  return normalizeUserTypes(data);
};

export const signIn = async (
  payload: ApiSignInPayload,
): Promise<ApiSignInResponse> => {
  const { data } = await axiosClient.post<unknown>(
    "/QuanLyNguoiDung/DangNhap",
    payload,
  );

  if (!isRecord(data)) {
    throw new Error("API returned an invalid sign-in response");
  }

  return {
    ...normalizeAccountUser(data),
    accessToken: getRequiredString(data, "accessToken"),
  };
};

export const signUp = async (payload: ApiSignUpPayload): Promise<unknown> => {
  const { data } = await axiosClient.post<unknown>(
    "/QuanLyNguoiDung/DangKy",
    payload,
  );

  return data;
};

export const getUsers = async (
  keyword = "",
  groupId = DEFAULT_GROUP_ID,
): Promise<ApiUserSummary[]> => {
  const normalizedKeyword = keyword.trim();
  const { data } = await axiosClient.get<unknown>(
    "/QuanLyNguoiDung/LayDanhSachNguoiDung",
    {
      params: {
        MaNhom: groupId,
        ...(normalizedKeyword ? { tuKhoa: normalizedKeyword } : {}),
      },
    },
  );

  return normalizeUserList(data);
};

export const getUsersPaged = async (
  page = 1,
  pageSize = 10,
  keyword = "",
  groupId = DEFAULT_GROUP_ID,
): Promise<ApiPaginatedResponse<ApiUserSummary>> => {
  const normalizedKeyword = keyword.trim();
  const { data } = await axiosClient.get<ApiPaginatedResponse<unknown>>(
    "/QuanLyNguoiDung/LayDanhSachNguoiDung_PhanTrang",
    {
      params: {
        MaNhom: groupId,
        ...(normalizedKeyword ? { tuKhoa: normalizedKeyword } : {}),
        page,
        pageSize,
      },
    },
  );

  return {
    ...data,
    items: data.items.map(normalizeUserSummary),
  };
};

export const searchUsers = async (
  keyword: string,
  groupId = DEFAULT_GROUP_ID,
): Promise<ApiUserSummary[]> => {
  const { data } = await axiosClient.get<unknown>(
    "/QuanLyNguoiDung/TimKiemNguoiDung",
    {
      params: {
        MaNhom: groupId,
        tuKhoa: keyword,
      },
    },
  );

  return normalizeUserList(data);
};

async function requestAccountInfo(accessToken: string): Promise<unknown> {
  const { data: accountInfo } = await axiosClient.post<unknown>(
    "/QuanLyNguoiDung/ThongTinTaiKhoan",
    undefined,
    {
      headers: getAuthorizationHeaders(accessToken),
    },
  );

  return accountInfo;
}

export const getAccountInfo = async (
  accessToken: string,
): Promise<ApiAccount> => {
  const accountInfo = await requestAccountInfo(accessToken);

  return normalizeAccount(accountInfo);
};

export const createUser = async (
  payload: ApiUserPayload,
  accessToken: string,
): Promise<unknown> => {
  const { data } = await axiosClient.post<unknown>(
    "/QuanLyNguoiDung/ThemNguoiDung",
    payload,
    {
      headers: getAuthorizationHeaders(accessToken),
    },
  );

  return data;
};

export const updateUser = async (
  payload: ApiUserPayload,
  accessToken: string,
): Promise<unknown> => {
  const { data } = await axiosClient.put<unknown>(
    "/QuanLyNguoiDung/CapNhatThongTinNguoiDung",
    payload,
    {
      headers: getAuthorizationHeaders(accessToken),
    },
  );

  return data;
};

export const updateCurrentUserProfile = async (
  payload: ApiProfileUpdatePayload,
  accessToken: string,
): Promise<unknown> => {
  let password = payload.matKhau;

  if (!password) {
    const accountInfo = await requestAccountInfo(accessToken);

    if (!isRecord(accountInfo)) {
      throw new Error("API returned an invalid account response");
    }

    const currentPassword = getRequiredString(accountInfo, "matKhau");

    if (!currentPassword) {
      throw new Error("API returned an empty account password");
    }

    password = currentPassword;
  }

  return updateUser(
    {
      ...payload,
      matKhau: password,
    },
    accessToken,
  );
};

export const deleteUser = async (
  username: string,
  accessToken: string,
): Promise<string> => {
  const { data } = await axiosClient.delete<unknown>(
    "/QuanLyNguoiDung/XoaNguoiDung",
    {
      params: {
        TaiKhoan: username,
      },
      headers: getAuthorizationHeaders(accessToken),
    },
  );

  return normalizeMessage(data);
};

export const getUnenrolledCoursesForUser = async (
  username: string,
  accessToken: string,
): Promise<ApiEnrollmentCourse[]> => {
  const { data } = await axiosClient.post<unknown>(
    "/QuanLyNguoiDung/LayDanhSachKhoaHocChuaGhiDanh",
    undefined,
    {
      params: {
        TaiKhoan: username,
      },
      headers: getAuthorizationHeaders(accessToken),
    },
  );

  return normalizeEnrollmentCourses(data);
};

export const getPendingCoursesForUser = async (
  username: string,
  accessToken: string,
): Promise<ApiEnrollmentCourse[]> => {
  const { data } = await axiosClient.post<unknown>(
    "/QuanLyNguoiDung/LayDanhSachKhoaHocChoXetDuyet",
    { taiKhoan: username },
    {
      headers: getAuthorizationHeaders(accessToken),
    },
  );

  return normalizeEnrollmentCourses(data);
};

export const getApprovedCoursesForUser = async (
  username: string,
  accessToken: string,
): Promise<ApiEnrollmentCourse[]> => {
  const { data } = await axiosClient.post<unknown>(
    "/QuanLyNguoiDung/LayDanhSachKhoaHocDaXetDuyet",
    { taiKhoan: username },
    {
      headers: getAuthorizationHeaders(accessToken),
    },
  );

  return normalizeEnrollmentCourses(data);
};

export const getUnenrolledStudentsForCourse = async (
  courseId: string,
  accessToken: string,
): Promise<ApiUserSummary[]> => {
  const { data } = await axiosClient.post<unknown>(
    "/QuanLyNguoiDung/LayDanhSachNguoiDungChuaGhiDanh",
    { maKhoaHoc: courseId },
    {
      headers: getAuthorizationHeaders(accessToken),
    },
  );

  return normalizeUserList(data);
};

export const getPendingStudentsForCourse = async (
  courseId: string,
  accessToken: string,
): Promise<ApiUserSummary[]> => {
  const { data } = await axiosClient.post<unknown>(
    "/QuanLyNguoiDung/LayDanhSachHocVienChoXetDuyet",
    { maKhoaHoc: courseId },
    {
      headers: getAuthorizationHeaders(accessToken),
    },
  );

  return normalizeUserList(data);
};

export const getStudentsForCourse = async (
  courseId: string,
  accessToken: string,
): Promise<ApiUserSummary[]> => {
  const { data } = await axiosClient.post<unknown>(
    "/QuanLyNguoiDung/LayDanhSachHocVienKhoaHoc",
    { maKhoaHoc: courseId },
    {
      headers: getAuthorizationHeaders(accessToken),
    },
  );

  return normalizeUserList(data);
};
