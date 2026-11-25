import { NextResponse, type NextRequest } from "next/server";

// 백엔드 JWT는 기본 15분이면 만료됩니다. 만료가 가까우면 백엔드의
// POST /auth/reissue로 새 토큰을 받아 쿠키를 바꿔 끼웁니다.
// (reissue는 userId만 받는 실습용 취약 API이며, 프론트엔드는 그대로 사용합니다.)

const API_BASE_URL = (process.env.BACKEND_API_URL ?? "http://localhost:3001/api/v1").replace(/\/$/, "");
const COOKIE = "session";
const REFRESH_BEFORE_SECONDS = 60;
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function readPayload(token: string): { userId?: string; exp?: number } | null {
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(part));
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(COOKIE)?.value;
  if (!token) return NextResponse.next();

  const payload = readPayload(token);
  const now = Math.floor(Date.now() / 1000);
  if (payload?.exp && payload.exp - now > REFRESH_BEFORE_SECONDS) return NextResponse.next();

  let accessToken: string | undefined;
  let rejected = !payload?.userId;

  if (payload?.userId) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reissue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: payload.userId }),
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) accessToken = ((await res.json()) as { accessToken?: string }).accessToken;
      else rejected = res.status === 400 || res.status === 401;
    } catch {
      // 백엔드에 연결할 수 없으면 쿠키를 그대로 둡니다.
    }
  }

  if (accessToken) {
    // 이번 요청의 렌더링에도 새 토큰이 쓰이도록 요청 쿠키도 바꿉니다.
    request.cookies.set(COOKIE, accessToken);
    const response = NextResponse.next({ request: { headers: request.headers } });
    response.cookies.set(COOKIE, accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: MAX_AGE_SECONDS,
    });
    return response;
  }

  if (rejected) {
    // 탈퇴한 회원 등 더 이상 쓸 수 없는 토큰은 지웁니다.
    request.cookies.delete(COOKIE);
    const response = NextResponse.next({ request: { headers: request.headers } });
    response.cookies.delete(COOKIE);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)"],
};
