import { getCurrentUser } from "@/lib/auth";
import { readDb } from "@/lib/db";

// 관리자만 전체 데이터베이스를 JSON 파일로 내려받을 수 있습니다.
// 비밀번호는 해시로만 저장되어 있지만, 세션 토큰은 백업에서 제외합니다.
export async function GET() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") {
    return Response.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const { users, posts, comments } = await readDb();
  const data = { users, posts, comments };
  const date = new Date().toISOString().slice(0, 10);

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="backup-${date}.json"`,
    },
  });
}
