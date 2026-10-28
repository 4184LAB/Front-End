import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { adminDeletePost, deleteUser, setUserRole } from "@/actions/admin";
import ConfirmButton from "@/components/ConfirmButton";
import { Badge, Card, Empty, Loading, Notice, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { getAdminOverview } from "@/lib/queries";

export const metadata: Metadata = { title: "관리자" };

export default function AdminPage() {
  return (
    <>
      <PageHeader title="관리자 페이지" description="회원과 게시글을 관리하고 통계를 확인합니다." />
      <Suspense fallback={<Loading />}>
        <AdminContent />
      </Suspense>
    </>
  );
}

async function AdminContent() {
  const me = await requireUser();
  if (me.role !== "admin") {
    return (
      <Notice title="접근 권한이 없습니다" href="/" linkLabel="홈으로">
        관리자만 이용할 수 있는 페이지입니다.
      </Notice>
    );
  }

  const { stats, users, recentPosts } = await getAdminOverview();
  const statItems = [
    { label: "전체 회원", value: stats.users },
    { label: "전체 게시글", value: stats.posts },
    { label: "전체 댓글", value: stats.comments },
    { label: "오늘 작성된 글", value: stats.postsToday },
    { label: "활성 세션", value: stats.activeSessions },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {statItems.map((item) => (
          <div key={item.label} className="rounded-xl border border-line p-4">
            <p className="text-xs text-muted">{item.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{item.value}</p>
          </div>
        ))}
      </div>

      <Card title="회원 관리">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>이름</th>
                <th>이메일</th>
                <th>권한</th>
                <th>글</th>
                <th>가입일</th>
                <th className="text-right">관리</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isMe = user.id === me.id;
                const nextRole = user.role === "admin" ? "user" : "admin";
                return (
                  <tr key={user.id}>
                    <td className="whitespace-nowrap">
                      {user.name}
                      {isMe && <span className="ml-1 text-xs text-muted">(나)</span>}
                    </td>
                    <td className="text-muted">{user.email}</td>
                    <td>
                      <Badge tone={user.role === "admin" ? "accent" : "default"}>
                        {user.role === "admin" ? "관리자" : "회원"}
                      </Badge>
                    </td>
                    <td className="tabular-nums">{user.postCount}</td>
                    <td className="whitespace-nowrap text-muted">{formatDate(user.createdAt)}</td>
                    <td>
                      {!isMe && (
                        <div className="flex justify-end gap-2">
                          <form action={setUserRole.bind(null, user.id, nextRole)}>
                            <ConfirmButton
                              message={`${user.name}님의 권한을 변경할까요?`}
                              className="btn btn-secondary btn-sm"
                            >
                              {nextRole === "admin" ? "관리자 지정" : "관리자 해제"}
                            </ConfirmButton>
                          </form>
                          <form action={deleteUser.bind(null, user.id)}>
                            <ConfirmButton message={`${user.name}님을 강제 탈퇴시킬까요?`}>
                              탈퇴
                            </ConfirmButton>
                          </form>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="최근 게시글" action={<Link href="/board" className="text-sm text-accent hover:underline">게시판 →</Link>}>
        {recentPosts.length === 0 ? (
          <Empty>게시글이 없습니다.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>번호</th>
                  <th>제목</th>
                  <th>작성자</th>
                  <th>작성일</th>
                  <th className="text-right">관리</th>
                </tr>
              </thead>
              <tbody>
                {recentPosts.map((post) => (
                  <tr key={post.id}>
                    <td className="text-muted">{post.id}</td>
                    <td>
                      <Link href={`/board/${post.id}`} className="hover:text-accent">
                        {post.title}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap">{post.authorName}</td>
                    <td className="whitespace-nowrap text-muted">{formatDate(post.createdAt)}</td>
                    <td className="text-right">
                      <form action={adminDeletePost.bind(null, post.id)}>
                        <ConfirmButton message="이 글을 삭제할까요?">삭제</ConfirmButton>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
