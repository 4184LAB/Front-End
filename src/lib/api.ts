import "server-only";
import { cookies } from "next/headers";

// 모든 데이터는 NestJS 백엔드(backend/)의 REST API에서 읽고 씁니다.
// 주소는 BACKEND_API_URL 환경 변수로 바꿀 수 있습니다 (기본: 로컬 개발 서버).
export const API_BASE_URL = (process.env.BACKEND_API_URL ?? "http://localhost:3001/api/v1").replace(
  /\/$/,
  "",
);

// 백엔드가 발급한 JWT(accessToken)를 담는 httpOnly 쿠키
export const SESSION_COOKIE = "session";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

type Options = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  json?: unknown;
  form?: FormData;
  query?: Record<string, string | undefined>;
  // false면 쿠키의 토큰을 보내지 않습니다.
  auth?: boolean;
  // 쿠키 대신 이 토큰을 씁니다 (로그인 직후 등).
  token?: string;
};

function errorMessage(status: number, body: unknown) {
  if (body && typeof body === "object" && "message" in body) {
    const message = (body as { message: unknown }).message;
    if (status === 400 && message === "Validation failed") return "입력값을 확인하세요.";
    if (typeof message === "string" && message !== "Unauthorized") return message;
    if (Array.isArray(message)) return message.join(", ");
  }
  if (status === 401) return "로그인이 필요합니다.";
  if (status === 403) return "권한이 없습니다.";
  if (status === 404) return "찾을 수 없습니다.";
  return `백엔드 오류 (${status})`;
}

export async function apiFetch<T>(path: string, options: Options = {}): Promise<T> {
  const { method = "GET", json, form, query, auth = true } = options;

  const url = new URL(API_BASE_URL + path);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value) url.searchParams.set(key, value);
  }

  const headers: Record<string, string> = {};
  const token = options.token ?? (auth ? (await cookies()).get(SESSION_COOKIE)?.value : undefined);
  if (token) headers.Authorization = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  } else if (form) {
    body = form;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new ApiError(503, "백엔드 서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인하세요.");
  }

  const text = await res.text();
  let data: unknown = undefined;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) throw new ApiError(res.status, errorMessage(res.status, data));
  return data as T;
}

// Server Action에서 백엔드 오류 메시지를 폼에 그대로 보여 줍니다.
export function actionError(error: unknown): { error: string } {
  if (error instanceof ApiError) return { error: error.message };
  throw error;
}

// 404는 null로 바꿔 notFound() 처리하기 쉽게 합니다.
export async function orNull<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

// JWT payload를 서명 검증 없이 읽습니다 (만료 시각과 userId 확인용, 신뢰 판단에는 쓰지 않음).
export function decodeToken(token: string): { userId?: string; exp?: number } | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

// ---- 백엔드 응답 타입 ----

export type Role = "user" | "admin";
export type BackendRole = "USER" | "ADMIN";

export function toRole(role: BackendRole): Role {
  return role === "ADMIN" ? "admin" : "user";
}

export type PublicUser = {
  id: string;
  username: string;
  name: string;
  role: Role;
  createdAt: string;
};

export type BackendUser = Omit<PublicUser, "role"> & { role: BackendRole };

export function toPublicUser(user: BackendUser): PublicUser {
  return { ...user, role: toRole(user.role) };
}

export type BoardKind = "GENERAL" | "NOTICE";

export type BackendPostSummary = {
  id: number;
  title: string;
  createdAt: string;
  author: { name: string } | null;
  _count?: { comments: number };
};

export type Attachment = {
  id: number;
  originalName: string;
  storedName: string;
  size: number;
  createdAt: string;
};

export type BackendPost = {
  id: number;
  type: BoardKind;
  title: string;
  content: string;
  authorId: string | null;
  createdAt: string;
  updatedAt: string;
  author: { name: string } | null;
  attachments: Attachment[];
};

export type BackendComment = {
  id: number;
  content: string;
  authorId: string | null;
  createdAt: string;
  author: { name: string } | null;
};

export const DELETED_AUTHOR = "(탈퇴한 회원)";

export function authorName(author: { name: string } | null) {
  return author?.name ?? DELETED_AUTHOR;
}
