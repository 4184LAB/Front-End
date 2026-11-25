"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, type Role } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

// 화면을 믿지 않고 여기서 한 번, 백엔드(AdminGuard)에서 또 한 번 권한을 확인합니다.
async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") throw new Error("관리자 권한이 필요합니다.");
  return user;
}

export async function setUserRole(userId: string, role: Role) {
  const admin = await requireAdmin();
  if (userId === admin.id) return;

  await apiFetch(`/admin/users/${userId}/role`, {
    method: "PATCH",
    json: { role: role === "admin" ? "ADMIN" : "USER" },
  });
  refresh();
}

export async function deleteUser(userId: string) {
  const admin = await requireAdmin();
  if (userId === admin.id) return;

  await apiFetch(`/admin/users/${userId}`, { method: "DELETE" });
  refresh();
}

export async function adminDeletePost(postId: number) {
  await requireAdmin();

  await apiFetch(`/admin/posts/${postId}`, { method: "DELETE" });
  refresh();
}
