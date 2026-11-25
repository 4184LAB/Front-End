import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  apiFetch,
  ApiError,
  SESSION_COOKIE,
  toPublicUser,
  type BackendUser,
  type PublicUser,
} from "./api";

// 쿠키는 7일 동안 유지하고, 그 안의 JWT가 만료되면 src/proxy.ts가 재발급합니다.
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
} as const;

export async function createSession(accessToken: string) {
  (await cookies()).set(SESSION_COOKIE, accessToken, sessionCookieOptions);
}

export async function deleteSession() {
  const store = await cookies();
  if (store.get(SESSION_COOKIE)) {
    // 백엔드는 토큰을 폐기하지 않지만 API 흐름을 맞추기 위해 호출합니다.
    await apiFetch("/auth/logout", { method: "POST" }).catch(() => undefined);
  }
  store.delete(SESSION_COOKIE);
}

// 한 요청 안에서는 백엔드에 한 번만 묻도록 React cache로 감쌉니다.
export const getCurrentUser = cache(async (): Promise<PublicUser | null> => {
  if (!(await cookies()).get(SESSION_COOKIE)?.value) return null;

  try {
    return toPublicUser(await apiFetch<BackendUser>("/users/me"));
  } catch (error) {
    // 토큰이 만료·위조됐거나 백엔드에 연결할 수 없으면 비로그인으로 취급합니다.
    if (error instanceof ApiError) return null;
    throw error;
  }
});

export async function requireUser(): Promise<PublicUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
