"use server";

import { redirect } from "next/navigation";
import { actionError, apiFetch } from "@/lib/api";
import { createSession, deleteSession } from "@/lib/auth";
import { field, type FormState } from "@/lib/form-state";

function safeNext(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/board";
}

async function issueToken(username: string, password: string) {
  const { accessToken } = await apiFetch<{ accessToken: string }>("/auth/login", {
    method: "POST",
    json: { username, password },
    auth: false,
  });
  await createSession(accessToken);
}

export async function signup(_: FormState, formData: FormData): Promise<FormState> {
  const username = field(formData, "username");
  const name = field(formData, "name");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!username || username.length > 50) return { error: "아이디는 1~50자로 입력하세요." };
  if (name.length < 2 || name.length > 20) return { error: "이름은 2~20자로 입력하세요." };
  if (password.length < 8 || password.length > 128) return { error: "비밀번호는 8~128자로 입력하세요." };
  if (password !== confirm) return { error: "비밀번호 확인이 일치하지 않습니다." };

  try {
    // role은 보내지 않습니다. 백엔드가 첫 가입자는 ADMIN, 나머지는 USER로 저장합니다.
    await apiFetch("/auth/register", {
      method: "POST",
      json: { username, name, password },
      auth: false,
    });
    await issueToken(username, password);
  } catch (error) {
    return actionError(error);
  }

  redirect("/mypage");
}

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  const username = field(formData, "username");
  const password = String(formData.get("password") ?? "");
  if (!username || !password) return { error: "아이디와 비밀번호를 입력하세요." };

  try {
    await issueToken(username, password);
  } catch (error) {
    return actionError(error);
  }

  redirect(safeNext(field(formData, "next")));
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
