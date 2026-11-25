import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { changePassword, deleteAccount, updateProfile } from "@/actions/account";
import ActionForm from "@/components/ActionForm";
import { Badge, Card, Empty, Field, Loading, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { formatDate, formatDateTime } from "@/lib/format";
import { getUserActivity } from "@/lib/queries";

export const metadata: Metadata = { title: "마이페이지" };

export default function MyPage() {
  return (
    <>
      <PageHeader title="마이페이지" description="내 정보와 활동 내역을 관리합니다." />
      <Suspense fallback={<Loading />}>
        <MyPageContent />
      </Suspense>
    </>
  );
}

async function MyPageContent() {
  const user = await requireUser();
  const activity = await getUserActivity();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="내 정보">
        <dl className="grid grid-cols-[6rem_1fr] gap-y-3 text-sm">
          <dt className="text-muted">아이디</dt>
          <dd>{user.username}</dd>
          <dt className="text-muted">이름</dt>
          <dd>{user.name}</dd>
          <dt className="text-muted">권한</dt>
          <dd>
            <Badge tone={user.role === "admin" ? "accent" : "default"}>
              {user.role === "admin" ? "관리자" : "일반 회원"}
            </Badge>
          </dd>
          <dt className="text-muted">가입일</dt>
          <dd>{formatDateTime(user.createdAt)}</dd>
          <dt className="text-muted">활동</dt>
          <dd>
            글 {activity.posts.length}개 · 댓글 {activity.commentCount}개
          </dd>
        </dl>
      </Card>

      <Card title="이름 변경">
        <ActionForm action={updateProfile} submitLabel="저장">
          <Field label="새 이름" hint="2~20자">
            <input
              name="name"
              required
              minLength={2}
              maxLength={20}
              defaultValue={user.name}
              className="input"
            />
          </Field>
        </ActionForm>
      </Card>

      <Card title="내가 쓴 글" className="lg:col-span-2">
        {activity.posts.length === 0 ? (
          <Empty>
            아직 작성한 글이 없습니다.{" "}
            <Link href="/board/new" className="text-accent hover:underline">
              첫 글 쓰기
            </Link>
          </Empty>
        ) : (
          <ul className="divide-y divide-line">
            {activity.posts.map((post) => (
              <li key={post.id} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                <Link href={`/board/${post.id}`} className="truncate hover:text-accent">
                  {post.title}
                  {post.commentCount > 0 && (
                    <span className="ml-1.5 text-xs text-accent">[{post.commentCount}]</span>
                  )}
                </Link>
                <span className="shrink-0 text-muted">{formatDate(post.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="비밀번호 변경">
        <ActionForm action={changePassword} submitLabel="비밀번호 변경" resetOnSuccess>
          <Field label="현재 비밀번호">
            <input
              name="current"
              type="password"
              required
              autoComplete="current-password"
              className="input"
            />
          </Field>
          <Field label="새 비밀번호" hint="8자 이상">
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="input"
            />
          </Field>
          <Field label="새 비밀번호 확인">
            <input
              name="confirm"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="input"
            />
          </Field>
        </ActionForm>
      </Card>

      <Card title="회원 탈퇴">
        <p className="mb-4 text-sm text-muted">
          탈퇴하면 계정 정보가 삭제되며 되돌릴 수 없습니다. 작성한 글과 댓글은 &ldquo;탈퇴한
          회원&rdquo;으로 표시되어 남습니다.
        </p>
        <ActionForm action={deleteAccount} submitLabel="탈퇴하기" variant="danger">
          <Field label="비밀번호 확인">
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="input"
            />
          </Field>
        </ActionForm>
      </Card>
    </div>
  );
}
