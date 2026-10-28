"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { createSession, deleteSession } from "@/lib/auth";
import { readDb, updateDb, type User } from "@/lib/db";
import { field, type FormState } from "@/lib/form-state";
import { hashPassword, verifyPassword } from "@/lib/password";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function safeNext(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/board";
}

export async function signup(_: FormState, formData: FormData): Promise<FormState> {
  const email = field(formData, "email").toLowerCase();
  const name = field(formData, "name");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!EMAIL_RE.test(email)) return { error: "올바른 이메일 주소를 입력하세요." };
  if (name.length < 2 || name.length > 20) return { error: "이름은 2~20자로 입력하세요." };
  if (password.length < 8) return { error: "비밀번호는 8자 이상이어야 합니다." };
  if (password !== confirm) return { error: "비밀번호 확인이 일치하지 않습니다." };

  const passwordHash = await hashPassword(password);
  const user = await updateDb((data) => {
    if (data.users.some((u) => u.email === email)) return null;
    const newUser: User = {
      id: randomUUID(),
      email,
      name,
      passwordHash,
      // 첫 번째로 가입한 회원이 관리자가 됩니다.
      role: data.users.length === 0 ? "admin" : "user",
      createdAt: new Date().toISOString(),
    };
    data.users.push(newUser);
    return newUser;
  });

  if (!user) return { error: "이미 가입된 이메일입니다." };

  await createSession(user.id);
  redirect("/mypage");
}

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  const email = field(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");

  const data = await readDb();
  const user = data.users.find((u) => u.email === email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  await createSession(user.id);
  redirect(safeNext(field(formData, "next")));
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
