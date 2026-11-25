"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { actionError, apiFetch } from "@/lib/api";
import { deleteSession, getCurrentUser } from "@/lib/auth";
import { field, type FormState } from "@/lib/form-state";

export async function updateProfile(_: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const name = field(formData, "name");
  if (name.length < 2 || name.length > 20) return { error: "이름은 2~20자로 입력하세요." };

  try {
    await apiFetch("/users/me", { method: "PATCH", json: { name } });
  } catch (error) {
    return actionError(error);
  }

  refresh();
  return { ok: true, message: "이름을 변경했습니다." };
}

export async function changePassword(_: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const currentPassword = String(formData.get("current") ?? "");
  const newPassword = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!currentPassword) return { error: "현재 비밀번호를 입력하세요." };
  if (newPassword.length < 8 || newPassword.length > 128) {
    return { error: "새 비밀번호는 8~128자로 입력하세요." };
  }
  if (newPassword !== confirm) return { error: "새 비밀번호 확인이 일치하지 않습니다." };

  try {
    const { message } = await apiFetch<{ message: string }>("/users/me/password", {
      method: "PATCH",
      json: { currentPassword, newPassword },
    });
    return { ok: true, message };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteAccount(_: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const password = String(formData.get("password") ?? "");
  if (!password) return { error: "비밀번호를 입력하세요." };

  try {
    await apiFetch("/users/me", { method: "DELETE", json: { password } });
  } catch (error) {
    return actionError(error);
  }

  await deleteSession();
  redirect("/");
}
