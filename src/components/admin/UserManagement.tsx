"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Search,
  Trash2,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { DEFAULT_GROUP_ID, deleteUser, getUsersPaged } from "@/app/lib/api";
import { getApiErrorMessage } from "@/app/lib/errors";
import { useAuthStore } from "@/app/store/useAuthStore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_SIZE = 10;

export default function UserManagement() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const accessToken = useAuthStore((state) => state.user?.accessToken);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [mutationError, setMutationError] = useState("");
  const [mutationSuccess, setMutationSuccess] = useState("");
  const status = searchParams.get("status");

  const usersQuery = useQuery({
    queryKey: ["admin", "users", page, keyword, DEFAULT_GROUP_ID],
    queryFn: () => getUsersPaged(page, PAGE_SIZE, keyword, DEFAULT_GROUP_ID),
  });

  const deleteMutation = useMutation({
    mutationFn: async (username: string) => {
      if (!accessToken) {
        throw new Error("Missing admin session");
      }
      return deleteUser(username, accessToken);
    },
    onSuccess: () => {
      setMutationError("");
      setMutationSuccess("Đã xóa người dùng thành công.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (error: unknown) => {
      setMutationSuccess("");
      setMutationError(
        getApiErrorMessage(error, "Không thể xóa người dùng này."),
      );
    },
  });

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setKeyword(searchInput.trim());
  };

  const users = usersQuery.data?.items ?? [];
  const totalPages = Math.max(usersQuery.data?.totalPages ?? 1, 1);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Quản lý người dùng
          </h1>
        </div>
        <Button
          render={<Link href="/admin/users/new" />}
          nativeButton={false}
          className="min-h-11 bg-blue-600 text-white hover:bg-blue-700"
        >
          <Plus aria-hidden="true" className="size-4" />
          Thêm người dùng
        </Button>
      </div>

      {status === "created" || status === "updated" ? (
        <div
          role="status"
          className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          {status === "created"
            ? "Đã tạo người dùng thành công."
            : "Đã cập nhật người dùng thành công."}
        </div>
      ) : null}
      {mutationSuccess ? (
        <div
          role="status"
          className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          {mutationSuccess}
        </div>
      ) : null}
      {mutationError ? (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {mutationError}
        </div>
      ) : null}

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <form
            onSubmit={handleSearch}
            role="search"
            className="flex w-full max-w-lg gap-2"
          >
            <div className="relative flex-1">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
              />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                aria-label="Tìm người dùng"
                placeholder="Tìm theo tài khoản hoặc họ tên"
                className="h-11 border-slate-300 bg-slate-50 pl-9 text-base focus-visible:border-blue-600 focus-visible:ring-blue-100 md:text-sm"
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              className="min-h-11 border-slate-300 px-4"
            >
              Tìm kiếm
            </Button>
          </form>
          <p className="text-sm whitespace-nowrap text-slate-500">
            {usersQuery.data?.totalCount?.toLocaleString("vi-VN") ?? 0} người
            dùng
          </p>
        </div>

        {usersQuery.isPending ? (
          <div className="grid min-h-72 place-items-center text-sm text-slate-500">
            Đang tải danh sách...
          </div>
        ) : usersQuery.isError ? (
          <div
            role="alert"
            className="grid min-h-72 place-items-center p-6 text-center text-sm text-red-700"
          >
            <div>
              <p>Không thể tải danh sách người dùng. Vui lòng thử lại.</p>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => void usersQuery.refetch()}
              >
                Thử lại
              </Button>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="grid min-h-72 place-items-center p-6 text-center">
            <div>
              <UsersRound
                aria-hidden="true"
                className="mx-auto size-10 text-slate-300"
              />
              <p className="mt-3 font-semibold text-slate-800">
                Không có người dùng phù hợp
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Thử thay đổi từ khóa tìm kiếm.
              </p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead scope="col" className="px-4">
                  Người dùng
                </TableHead>
                <TableHead scope="col" className="hidden lg:table-cell">
                  Liên hệ
                </TableHead>
                <TableHead scope="col" className="hidden sm:table-cell">
                  Vai trò
                </TableHead>
                <TableHead scope="col" className="hidden md:table-cell">
                  Nhóm
                </TableHead>
                <TableHead scope="col" className="px-4 text-right">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.taiKhoan}>
                  <TableCell className="max-w-52 px-4 whitespace-normal">
                    <p className="truncate font-semibold text-slate-900">
                      {user.hoTen}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      @{user.taiKhoan}
                    </p>
                  </TableCell>
                  <TableCell className="hidden max-w-64 whitespace-normal lg:table-cell">
                    <p className="truncate text-slate-700">
                      {user.email || "—"}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {user.soDT || "Chưa có SĐT"}
                    </p>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${user.maLoaiNguoiDung === "GV" ? "bg-indigo-50 text-indigo-700" : "bg-blue-50 text-blue-700"}`}
                    >
                      {user.tenLoaiNguoiDung ||
                        (user.maLoaiNguoiDung === "GV"
                          ? "Giáo vụ"
                          : "Học viên")}
                    </span>
                  </TableCell>
                  <TableCell className="hidden text-slate-600 md:table-cell">
                    {user.maNhom || "—"}
                  </TableCell>
                  <TableCell className="px-4">
                    <div className="flex justify-end gap-1">
                      <Button
                        render={
                          <Link
                            href={`/admin/users/${encodeURIComponent(user.taiKhoan)}/edit`}
                          />
                        }
                        nativeButton={false}
                        variant="ghost"
                        size="icon"
                        aria-label={`Sửa ${user.hoTen}`}
                        className="size-10 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Pencil aria-hidden="true" className="size-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Xóa ${user.hoTen}`}
                              className="size-10 text-slate-600 hover:bg-red-50 hover:text-red-700"
                            />
                          }
                        >
                          <Trash2 aria-hidden="true" className="size-4" />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogMedia className="bg-red-50 text-red-700">
                              <Trash2 aria-hidden="true" />
                            </AlertDialogMedia>
                            <AlertDialogTitle>Xóa người dùng?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tài khoản “{user.taiKhoan}” sẽ bị xóa khỏi hệ
                              thống. Thao tác này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              disabled={deleteMutation.isPending}
                              onClick={() =>
                                deleteMutation.mutate(user.taiKhoan)
                              }
                            >
                              {deleteMutation.isPending
                                ? "Đang xóa..."
                                : "Xóa người dùng"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <div className="flex items-center justify-between gap-4 border-t border-slate-200 px-4 py-4">
          <p className="text-sm text-slate-500">
            Trang {page} / {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Trang trước"
              disabled={page <= 1 || usersQuery.isFetching}
              onClick={() =>
                setPage((currentPage) => Math.max(currentPage - 1, 1))
              }
              className="size-10 border-slate-300"
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Trang sau"
              disabled={page >= totalPages || usersQuery.isFetching}
              onClick={() =>
                setPage((currentPage) => Math.min(currentPage + 1, totalPages))
              }
              className="size-10 border-slate-300"
            >
              <ChevronRight aria-hidden="true" className="size-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
