import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { addComment, deleteComment } from "@/actions/board";
import ActionForm from "@/components/ActionForm";
import ConfirmButton from "@/components/ConfirmButton";
import PostView from "@/components/PostView";
import { Loading } from "@/components/ui";
import type { PublicUser } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { getBoardPost, getComments } from "@/lib/queries";

export const metadata: Metadata = { title: "게시글" };

export default function PostPage(props: PageProps<"/board/[id]">) {
  return (
    <>
      <Link href="/board" className="text-sm text-muted hover:text-foreground">
        ← 목록으로
      </Link>
      <Suspense fallback={<Loading />}>
        <PostDetail params={props.params} searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}

// 백엔드 규칙: 댓글은 작성자와 관리자가 삭제할 수 있습니다.
function canDeleteComment(user: PublicUser, authorId: string | null) {
  return user.role === "admin" || (!!authorId && user.id === authorId);
}

async function PostDetail({
  params,
  searchParams,
}: {
  params: PageProps<"/board/[id]">["params"];
  searchParams: PageProps<"/board/[id]">["searchParams"];
}) {
  const { id } = await params;
  const { upload } = await searchParams;

  // 백엔드에서 일반 게시글은 로그인해야 볼 수 있습니다.
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/board/${id}`);

  const post = await getBoardPost("GENERAL", Number(id));
  if (!post) notFound();
  const comments = await getComments(post.id);

  return (
    <>
      <PostView kind="GENERAL" post={post} user={user} uploadFailed={upload === "failed"} />

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-semibold">댓글 {comments.length}</h2>
        <ul className="mt-4 divide-y divide-line">
          {comments.map((comment) => (
            <li key={comment.id} className="py-4">
              <div className="flex items-center gap-3 text-sm">
                <span className="font-medium">{comment.authorName}</span>
                <time dateTime={comment.createdAt} className="text-muted">
                  {formatDateTime(comment.createdAt)}
                </time>
                {canDeleteComment(user, comment.authorId) && (
                  <form action={deleteComment.bind(null, post.id, comment.id)} className="ml-auto">
                    <ConfirmButton
                      message="댓글을 삭제할까요?"
                      className="text-xs text-muted hover:text-danger"
                    >
                      삭제
                    </ConfirmButton>
                  </form>
                )}
              </div>
              <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <ActionForm
            action={addComment.bind(null, post.id)}
            submitLabel="댓글 등록"
            resetOnSuccess
            className="space-y-3"
          >
            <textarea
              name="content"
              required
              maxLength={1000}
              rows={3}
              placeholder="댓글을 입력하세요"
              aria-label="댓글"
              className="input resize-y"
            />
          </ActionForm>
        </div>
      </section>
    </>
  );
}
