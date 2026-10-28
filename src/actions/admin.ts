"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { updateDb, type Role } from "@/lib/db";

// 모든 관리자 액션은 클라이언트를 믿지 않고 서버에서 권한을 다시 확인합니다.
async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") throw new Error("관리자 권한이 필요합니다.");
  return user;
}

export async function setUserRole(userId: string, role: Role) {
  const admin = await requireAdmin();
  if (userId === admin.id) return;

  await updateDb((data) => {
    const target = data.users.find((u) => u.id === userId);
    if (target) target.role = role;
  });
  refresh();
}

export async function deleteUser(userId: string) {
  const admin = await requireAdmin();
  if (userId === admin.id) return;

  await updateDb((data) => {
    data.users = data.users.filter((u) => u.id !== userId);
    data.sessions = data.sessions.filter((s) => s.userId !== userId);
  });
  refresh();
}

export async function adminDeletePost(postId: number) {
  await requireAdmin();

  await updateDb((data) => {
    data.posts = data.posts.filter((p) => p.id !== postId);
    data.comments = data.comments.filter((c) => c.postId !== postId);
  });
  refresh();
}

export async function purgeExpiredSessions() {
  await requireAdmin();

  await updateDb((data) => {
    const now = Date.now();
    data.sessions = data.sessions.filter((s) => Date.parse(s.expiresAt) > now);
  });
  refresh();
}
