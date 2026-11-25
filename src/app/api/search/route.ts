import { parseSearchParams, search } from "@/lib/queries";

// GET /api/search?q=&type=posts|comments|users&sort=latest|oldest&from=YYYY-MM-DD&to=YYYY-MM-DD
// 로그인 쿠키의 토큰을 붙여 백엔드 GET /api/v1/search로 전달합니다.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = parseSearchParams(Object.fromEntries(url.searchParams));
  const { error, status, rows } = await search(params);

  if (error) return Response.json({ error }, { status });
  return Response.json({ params, count: rows.length, rows });
}
