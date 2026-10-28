import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { Empty, Loading, PageHeader } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { listPosts } from "@/lib/queries";

export const metadata: Metadata = { title: "게시판" };

export default function BoardPage(props: PageProps<"/board">) {
  return (
    <>
      <PageHeader title="게시판" description="자유롭게 글을 남겨주세요." />
      <Suspense fallback={<Loading />}>
        <BoardList searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}

async function BoardList({
  searchParams,
}: {
  searchParams: PageProps<"/board">["searchParams"];
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const page = Number(params.page) || 1;
  const result = await listPosts({ q, page });

  const pageHref = (p: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (p > 1) sp.set("page", String(p));
    const query = sp.toString();
    return query ? `/board?${query}` : "/board";
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Form action="/board" className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="제목 또는 내용 검색"
            className="input w-56"
          />
          <button type="submit" className="btn btn-secondary">
            검색
          </button>
        </Form>
        <Link href="/board/new" className="btn btn-primary">
          글쓰기
        </Link>
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
                    <Link href={`/board/${post.id}`} className="hover:text-accent">
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
