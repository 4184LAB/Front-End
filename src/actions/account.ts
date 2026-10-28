"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { deleteSession, getCurrentUser } from "@/lib/auth";
import { readDb, updateDb } from "@/lib/db";
import { field, type FormState } from "@/lib/form-state";
import { hashPassword, verifyPassword } from "@/lib/password";

export async function updateProfile(_: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const name = field(formData, "name");
  if (name.length < 2 || name.length > 20) return { error: "이름은 2~20자로 입력하세요." };

  await updateDb((data) => {
    const target = data.users.find((u) => u.id === user.id);
    if (target) target.name = name;
  });

  refresh();
  return { ok: true, message: "이름을 변경했습니다." };
}

export async function changePassword(_: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const stored = (await readDb()).users.find((u) => u.id === user.id);
  if (!stored || !(await verifyPassword(current, stored.passwordHash))) {
    return { error: "현재 비밀번호가 올바르지 않습니다." };
  }
  if (next.length < 8) return { error: "새 비밀번호는 8자 이상이어야 합니다." };
  if (next !== confirm) return { error: "새 비밀번호 확인이 일치하지 않습니다." };

  const passwordHash = await hashPassword(next);
  await updateDb((data) => {
    const target = data.users.find((u) => u.id === user.id);
    if (target) target.passwordHash = passwordHash;
  });

  return { ok: true, message: "비밀번호를 변경했습니다." };
}

export async function deleteAccount(_: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const password = String(formData.get("password") ?? "");
  const data = await readDb();
  const stored = data.users.find((u) => u.id === user.id);
  if (!stored || !(await verifyPassword(password, stored.passwordHash))) {
    return { error: "비밀번호가 올바르지 않습니다." };
  }
  if (user.role === "admin" && data.users.filter((u) => u.role === "admin").length === 1) {
    return { error: "마지막 관리자는 탈퇴할 수 없습니다. 다른 회원을 관리자로 지정하세요." };
  }

  await deleteSession();
  await updateDb((data) => {
    data.users = data.users.filter((u) => u.id !== user.id);
    data.sessions = data.sessions.filter((s) => s.userId !== user.id);
  });

  redirect("/");
}
