import Form from "next/form";
import Link from "next/link";
import { Empty, Notice } from "@/components/ui";
import { ApiError, type BoardKind } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { listBoard } from "@/lib/queries";

// 국민참여 게시판(GENERAL)과 공지사항(NOTICE) 목록을 함께 그립니다.
export default async function BoardList({
  kind,
  searchParams,
}: {
  kind: BoardKind;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const base = kind === "NOTICE" ? "/notices" : "/board";
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const page = Number(params.page) || 1;
  const user = await getCurrentUser();

  // 백엔드에서 일반 게시글 목록은 로그인해야 볼 수 있습니다.
  if (kind === "GENERAL" && !user) {
    return (
      <Notice title="로그인이 필요합니다" href={`/login?next=${base}`} linkLabel="로그인">
        국민참여 게시판은 로그인한 회원만 볼 수 있습니다.
      </Notice>
    );
  }

  let result: Awaited<ReturnType<typeof listBoard>>;
  try {
    result = await listBoard(kind, { q, page });
  } catch (error) {
    if (error instanceof ApiError) return <Empty>{error.message}</Empty>;
    throw error;
  }

  const canWrite = kind === "GENERAL" ? !!user : user?.role === "admin";

  const pageHref = (p: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (p > 1) sp.set("page", String(p));
    const query = sp.toString();
    return query ? `${base}?${query}` : base;
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Form action={base} className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder={kind === "NOTICE" ? "제목 검색" : "제목 또는 내용 검색"}
            className="input w-56"
          />
          <button type="submit" className="btn btn-secondary">
            검색
          </button>
        </Form>
        {canWrite && (
          <Link href={`${base}/new`} className="btn btn-primary">
            글쓰기
          </Link>
        )}
      </div>

      <p className="mb-2 text-sm text-muted">
        {q ? `"${q}" 검색 결과 ` : "전체 "}
        {result.total}건
      </p>

      {result.items.length === 0 ? (
        <Empty>게시글이 없습니다.</Empty>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="w-16">번호</th>
                <th>제목</th>
                <th className="w-32">작성자</th>
                <th className="w-28">작성일</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((post) => (
                <tr key={post.id}>
                  <td className="text-muted">{post.id}</td>
                  <td>
                    <Link href={`${base}/${post.id}`} className="hover:text-accent">
                      {post.title}
                    </Link>
                    {post.commentCount > 0 && (
                      <span className="ml-1.5 text-xs text-accent">[{post.commentCount}]</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap">{post.authorName}</td>
                  <td className="whitespace-nowrap text-muted">{formatDate(post.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {result.totalPages > 1 && (
        <nav className="mt-6 flex justify-center gap-1" aria-label="페이지">
          {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={pageHref(p)}
              aria-current={p === result.page ? "page" : undefined}
              className={`btn btn-sm ${p === result.page ? "btn-primary" : "btn-secondary"}`}
            >
              {p}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
