import { cookies } from "next/headers";
import { API_BASE_URL, SESSION_COOKIE } from "@/lib/api";

// GET /api/files/download?filename=<storedName>
// 브라우저에는 백엔드 토큰이 없으므로, 쿠키의 토큰을 붙여 백엔드
// GET /api/v1/files/download로 그대로 전달하고 응답을 흘려보냅니다.
// filename 검사는 백엔드에 맡깁니다 (백엔드의 경로 조작 실습이 화면에서도 재현되도록 그대로 전달).
export async function GET(request: Request) {
  const filename = new URL(request.url).searchParams.get("filename") ?? "";
  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  const target = new URL(`${API_BASE_URL}/files/download`);
  target.searchParams.set("filename", filename);

  let res: Response;
  try {
    res = await fetch(target, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
    });
  } catch {
    return Response.json({ error: "백엔드 서버에 연결할 수 없습니다." }, { status: 503 });
  }

  const headers = new Headers({ "Cache-Control": "no-store" });
  for (const name of ["content-type", "content-length", "content-disposition"]) {
    const value = res.headers.get(name);
    if (value) headers.set(name, value);
  }
  return new Response(res.body, { status: res.status, headers });
}
