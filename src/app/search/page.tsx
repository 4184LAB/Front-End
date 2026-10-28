import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { Empty, Field, Loading, PageHeader } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { parseSearchParams, search, type SearchParams } from "@/lib/queries";

export const metadata: Metadata = { title: "검색 · 조회" };

const TYPE_LABELS = { posts: "게시글", comments: "댓글", users: "회원 (관리자)" } as const;

export default function SearchPage(props: PageProps<"/search">) {
  return (
    <>
      <PageHeader
        title="검색 · 데이터 조회"
        description="조건을 지정해 게시글, 댓글, 회원 데이터를 조회합니다."
      />
      <Suspense fallback={<Loading />}>
        <SearchContent searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}

async function SearchContent({
  searchParams,
}: {
  searchParams: PageProps<"/search">["searchParams"];
}) {
  const params = parseSearchParams(await searchParams);
  const viewer = await getCurrentUser();
  const { error, rows } = await search(params, viewer);

  return (
    <>
      <SearchForm params={params} />

      <div className="mt-8 mb-3 flex items-center justify-between gap-4">
        <p className="text-sm text-muted">
          {TYPE_LABELS[params.type]} 조회 결과 <strong className="text-foreground">{rows.length}</strong>건
        </p>
        {!error && (
          <a
            href={`/api/search?${toQuery(params)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
          >
            JSON으로 보기
          </a>
        )}
      </div>

      {error ? (
        <Empty>{error}</Empty>
      ) : rows.length === 0 ? (
        <Empty>조건에 맞는 데이터가 없습니다.</Empty>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>{params.type === "users" ? "이름" : params.type === "comments" ? "게시글" : "제목"}</th>
                <th>{params.type === "users" ? "이메일" : "내용"}</th>
                <th>{params.type === "users" ? "권한" : "작성자"}</th>
                <th>{params.type === "users" ? "가입일" : "작성일"}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="max-w-56 truncate">
                    {row.href ? (
                      <Link href={row.href} className="hover:text-accent">
                        {row.title}
                      </Link>
                    ) : (
                      row.title
                    )}
                  </td>
                  <td className="max-w-80 truncate text-muted">{row.detail}</td>
                  <td className="whitespace-nowrap">{row.author}</td>
                  <td className="whitespace-nowrap text-muted">{formatDateTime(row.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function toQuery(params: SearchParams) {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) sp.set(key, value);
  return sp.toString();
}

function SearchForm({ params }: { params: SearchParams }) {
  return (
    <Form
      action="/search"
      className="grid gap-4 rounded-xl border border-line p-5 sm:grid-cols-2 lg:grid-cols-6"
    >
      <div className="sm:col-span-2 lg:col-span-2">
        <Field label="검색어">
          <input name="q" defaultValue={params.q} placeholder="비워두면 전체 조회" className="input" />
        </Field>
      </div>
      <Field label="대상">
        <select name="type" defaultValue={params.type} className="input">
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="정렬">
        <select name="sort" defaultValue={params.sort} className="input">
          <option value="latest">최신순</option>
          <option value="oldest">오래된순</option>
        </select>
      </Field>
      <Field label="시작일">
        <input name="from" type="date" defaultValue={params.from} className="input" />
      </Field>
      <Field label="종료일">
        <input name="to" type="date" defaultValue={params.to} className="input" />
      </Field>
      <div className="flex gap-2 sm:col-span-2 lg:col-span-6">
        <button type="submit" className="btn btn-primary">
          조회
        </button>
        <Link href="/search" className="btn btn-secondary">
          초기화
        </Link>
      </div>
    </Form>
  );
}
