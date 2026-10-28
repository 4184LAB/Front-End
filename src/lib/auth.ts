import "server-only";
import { randomBytes } from "crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readDb, toPublicUser, updateDb, type PublicUser } from "./db";

const COOKIE_NAME = "session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7일

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const now = Date.now();
  const expiresAt = new Date(now + MAX_AGE_SECONDS * 1000).toISOString();

  await updateDb((data) => {
    data.sessions = data.sessions.filter((s) => Date.parse(s.expiresAt) > now);
    data.sessions.push({ token, userId, expiresAt });
  });

  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function deleteSession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) {
    await updateDb((data) => {
      data.sessions = data.sessions.filter((s) => s.token !== token);
    });
  }
  store.delete(COOKIE_NAME);
}

// 한 요청 안에서는 세션을 한 번만 읽도록 React cache로 감쌉니다.
export const getCurrentUser = cache(async (): Promise<PublicUser | null> => {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  const data = await readDb();
  const session = data.sessions.find((s) => s.token === token);
  if (!session || Date.parse(session.expiresAt) <= Date.now()) return null;

  const user = data.users.find((u) => u.id === session.userId);
  return user ? toPublicUser(user) : null;
});

export async function requireUser(): Promise<PublicUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
