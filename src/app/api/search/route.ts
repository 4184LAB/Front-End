import { getCurrentUser } from "@/lib/auth";
import { parseSearchParams, search } from "@/lib/queries";

// GET /api/search?q=&type=posts|comments|users&sort=latest|oldest&from=YYYY-MM-DD&to=YYYY-MM-DD
export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = parseSearchParams(Object.fromEntries(url.searchParams));
  const { error, rows } = await search(params, await getCurrentUser());

  if (error) return Response.json({ error }, { status: 403 });
  return Response.json({ params, count: rows.length, rows });
}
