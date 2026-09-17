"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, UsersRound } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { DEFAULT_GROUP_ID, deleteUser, getUsersPaged } from "@/app/lib/api";
import { getApiErrorMessage } from "@/app/lib/errors";
import { useAuthStore } from "@/app/store/useAuthStore";
import {
  AdminCollectionState,
  AdminPage,
  AdminPageHeader,
  AdminSearchForm,
} from "@/components/admin/AdminPage";
import { Button } from "@/components/ui/button";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import FeedbackAlert from "@/components/ui/feedback-alert";
import { PaginationControls } from "@/components/ui/pagination";
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
    <AdminPage>
      <AdminPageHeader
        title="Quản lý người dùng"
        action={
          <Button
            render={<Link href="/admin/users/new" />}
            nativeButton={false}
            className="min-h-11 bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus aria-hidden="true" className="size-4" />
            Thêm người dùng
          </Button>
        }
      />

      {status === "created" || status === "updated" ? (
        <FeedbackAlert type="success" className="mt-6">
          {status === "created"
            ? "Đã tạo người dùng thành công."
            : "Đã cập nhật người dùng thành công."}
        </FeedbackAlert>
      ) : null}
      {mutationSuccess ? (
        <FeedbackAlert type="success" className="mt-6">
          {mutationSuccess}
        </FeedbackAlert>
      ) : null}
      {mutationError ? (
        <FeedbackAlert type="error" className="mt-6">
          {mutationError}
        </FeedbackAlert>
      ) : null}

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <AdminSearchForm
            onSubmit={handleSearch}
            value={searchInput}
            onChange={setSearchInput}
            ariaLabel="Tìm người dùng"
            placeholder="Tìm theo tài khoản hoặc họ tên"
            buttonVariant="outline"
            className="max-w-lg"
          />
          <p className="text-sm whitespace-nowrap text-slate-500">
            {usersQuery.data?.totalCount?.toLocaleString("vi-VN") ?? 0} người
            dùng
          </p>
        </div>

        <AdminCollectionState
          isPending={usersQuery.isPending}
          isError={usersQuery.isError}
          isEmpty={users.length === 0}
          errorMessage="Không thể tải danh sách người dùng. Vui lòng thử lại."
          emptyIcon={UsersRound}
          emptyTitle="Không có người dùng phù hợp"
          emptyDescription="Thử thay đổi từ khóa tìm kiếm."
          onRetry={() => void usersQuery.refetch()}
        >
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
                      <ConfirmationDialog
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Xóa ${user.hoTen}`}
                            className="size-10 text-slate-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 aria-hidden="true" className="size-4" />
                          </Button>
                        }
                        icon={Trash2}
                        title="Xóa người dùng?"
                        description="Tài khoản này sẽ bị xóa khỏi hệ thống. Thao tác này không thể hoàn tác."
                        itemLabel="Tài khoản"
                        itemName={user.taiKhoan}
                        actionLabel="Xóa người dùng"
                        pendingLabel="Đang xóa..."
                        isPending={deleteMutation.isPending}
                        onConfirm={() => deleteMutation.mutate(user.taiKhoan)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AdminCollectionState>

        {totalPages > 1 ? (
          <div className="border-t border-slate-200 px-4 py-4">
            <PaginationControls
              currentPage={page}
              totalPages={totalPages}
              isPending={usersQuery.isFetching}
              onPageChange={(nextPage) => setPage(nextPage)}
            />
          </div>
        ) : null}
      </section>
    </AdminPage>
  );
}
