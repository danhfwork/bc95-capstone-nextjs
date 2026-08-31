import { isAxiosError } from "axios";

function getResponseMessage(responseData: unknown): string | null {
  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  if (typeof responseData !== "object" || responseData === null) {
    return null;
  }

  if (
    "content" in responseData &&
    typeof responseData.content === "string" &&
    responseData.content.trim()
  ) {
    return responseData.content;
  }

  if (
    "message" in responseData &&
    typeof responseData.message === "string" &&
    responseData.message.trim()
  ) {
    return responseData.message;
  }

  return null;
}

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (!isAxiosError(error)) {
    return "Không thể kết nối đến hệ thống. Vui lòng thử lại.";
  }

  if (error.response?.status === 401) {
    return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  }

  return getResponseMessage(error.response?.data) ?? fallbackMessage;
}

export function getSignInErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) {
    return "Không thể kết nối đến hệ thống. Vui lòng thử lại.";
  }

  return (
    getResponseMessage(error.response?.data) ??
    "Tên đăng nhập hoặc mật khẩu chưa chính xác."
  );
}

export function getSignUpErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) {
    return "Không thể kết nối đến hệ thống. Vui lòng thử lại.";
  }

  return (
    getResponseMessage(error.response?.data) ??
    "Không thể đăng ký tài khoản. Vui lòng kiểm tra thông tin và thử lại."
  );
}

export function getCourseRegistrationErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) {
    return "Không thể kết nối đến hệ thống. Vui lòng thử lại.";
  }

  if (error.response?.status === 401) {
    return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  }

  return (
    getResponseMessage(error.response?.data) ??
    "Không thể đăng ký khóa học. Vui lòng thử lại."
  );
}

export function getAccountErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) {
    return "Không thể kết nối đến hệ thống. Vui lòng thử lại.";
  }

  if (error.response?.status === 401) {
    return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  }

  return (
    getResponseMessage(error.response?.data) ??
    "Không thể tải thông tin tài khoản. Vui lòng thử lại."
  );
}

export function getProfileUpdateErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) {
    return "Không thể kết nối đến hệ thống. Vui lòng thử lại.";
  }

  if (error.response?.status === 401) {
    return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  }

  return (
    getResponseMessage(error.response?.data) ??
    "Không thể cập nhật thông tin. Vui lòng kiểm tra dữ liệu và thử lại."
  );
}

export function getCourseCancellationErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) {
    return "Không thể kết nối đến hệ thống. Vui lòng thử lại.";
  }

  if (error.response?.status === 401) {
    return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  }

  return (
    getResponseMessage(error.response?.data) ??
    "Không thể hủy đăng ký khóa học. Vui lòng thử lại."
  );
}
