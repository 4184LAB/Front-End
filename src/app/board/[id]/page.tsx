import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { addComment, deleteComment, deletePost } from "@/actions/board";
import ActionForm from "@/components/ActionForm";
import ConfirmButton from "@/components/ConfirmButton";
import { Loading } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import type { PublicUser } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { getPostDetail } from "@/lib/queries";

export const metadata: Metadata = { title: "게시글" };

export default function PostPage(props: PageProps<"/board/[id]">) {
  return (
    <>
      <Link href="/board" className="text-sm text-muted hover:text-foreground">
        ← 목록으로
      </Link>
      <Suspense fallback={<Loading />}>
        <PostDetail params={props.params} />
      </Suspense>
    </>
  );
}

function canModify(user: PublicUser | null, authorId: string) {
  return !!user && (user.role === "admin" || user.id === authorId);
}

async function PostDetail({ params }: { params: PageProps<"/board/[id]">["params"] }) {
  const { id } = await params;
  const [post, user] = await Promise.all([getPostDetail(Number(id)), getCurrentUser()]);
  if (!post) notFound();

  return (
    <>
      <article className="mt-6">
        <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          <span className="font-medium text-foreground">{post.authorName}</span>
          <time dateTime={post.createdAt}>{formatDateTime(post.createdAt)}</time>
          {post.updatedAt !== post.createdAt && <span>(수정됨)</span>}
          {canModify(user, post.authorId) && (
            <span className="ml-auto flex gap-2">
              <Link href={`/board/${post.id}/edit`} className="btn btn-secondary btn-sm">
                수정
              </Link>
              <form action={deletePost.bind(null, post.id)}>
                <ConfirmButton message="이 글을 삭제할까요? 댓글도 함께 삭제됩니다.">
                  삭제
                </ConfirmButton>
              </form>
            </span>
          )}
        </div>
        <div className="mt-8 border-t border-line pt-8 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>
      </article>

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-semibold">댓글 {post.comments.length}</h2>
        <ul className="mt-4 divide-y divide-line">
          {post.comments.map((comment) => (
            <li key={comment.id} className="py-4">
              <div className="flex items-center gap-3 text-sm">
                <span className="font-medium">{comment.authorName}</span>
                <time dateTime={comment.createdAt} className="text-muted">
                  {formatDateTime(comment.createdAt)}
                </time>
                {canModify(user, comment.authorId) && (
                  <form action={deleteComment.bind(null, comment.id)} className="ml-auto">
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
          {user ? (
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
          ) : (
            <p className="text-sm text-muted">
              댓글을 쓰려면{" "}
              <Link href={`/login?next=/board/${post.id}`} className="text-accent hover:underline">
                로그인
              </Link>
              하세요.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
