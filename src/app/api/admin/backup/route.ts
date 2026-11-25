import { apiFetch, ApiError } from "@/lib/api";

// 관리자만 백엔드 DB 전체(비밀번호 제외)를 JSON 파일로 내려받습니다. 권한은 백엔드가 확인합니다.
export async function GET() {
  let data: unknown;
  try {
    data = await apiFetch("/admin/backup");
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }

  const date = new Date().toISOString().slice(0, 10);
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="backup-${date}.json"`,
    },
  });
}
