import Link from "next/link";
import { deletePost, uploadAttachment } from "@/actions/board";
import ActionForm from "@/components/ActionForm";
import ConfirmButton from "@/components/ConfirmButton";
import type { BoardKind, PublicUser } from "@/lib/api";
import { formatBytes, formatDateTime } from "@/lib/format";
import type { PostDetail } from "@/lib/queries";

// 백엔드 권한 규칙과 같게: 공지는 관리자, 일반 글은 작성자만 수정합니다.
// 삭제는 관리자도 할 수 있습니다 (관리자 API 사용).
export function canEdit(kind: BoardKind, user: PublicUser | null, authorId: string | null) {
  if (!user) return false;
  return kind === "NOTICE" ? user.role === "admin" : !!authorId && user.id === authorId;
}

export default function PostView({
  kind,
  post,
  user,
  uploadFailed,
}: {
  kind: BoardKind;
  post: PostDetail;
  user: PublicUser | null;
  uploadFailed?: boolean;
}) {
  const base = kind === "NOTICE" ? "/notices" : "/board";
  const editable = canEdit(kind, user, post.authorId);
  const deletable = editable || user?.role === "admin";

  return (
    <article className="mt-6">
      <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
        <span className="font-medium text-foreground">{post.authorName}</span>
        <time dateTime={post.createdAt}>{formatDateTime(post.createdAt)}</time>
        {post.updatedAt !== post.createdAt && <span>(수정됨)</span>}
        {deletable && (
          <span className="ml-auto flex gap-2">
            {editable && (
              <Link href={`${base}/${post.id}/edit`} className="btn btn-secondary btn-sm">
                수정
              </Link>
            )}
            <form action={deletePost.bind(null, kind, post.id)}>
              <ConfirmButton message="이 글을 삭제할까요?">삭제</ConfirmButton>
            </form>
          </span>
        )}
      </div>

      {uploadFailed && (
        <p role="alert" className="mt-4 text-sm text-danger">
          글은 등록됐지만 첨부파일을 올리지 못했습니다. 아래에서 다시 올려 주세요.
        </p>
      )}

      <div className="mt-8 border-t border-line pt-8 leading-relaxed whitespace-pre-wrap">
        {post.content}
      </div>

      {(post.attachments.length > 0 || editable) && (
        <section className="mt-8 rounded-md border border-line p-4">
          <h2 className="text-sm font-semibold">첨부파일 {post.attachments.length}</h2>
          {post.attachments.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm">
              {post.attachments.map((file) => (
                <li key={file.id} className="flex items-center gap-2">
                  <a
                    href={`/api/files/download?filename=${encodeURIComponent(file.storedName)}`}
                    className="text-accent hover:underline"
                  >
                    {file.originalName}
                  </a>
                  <span className="text-xs text-muted">{formatBytes(file.size)}</span>
                </li>
              ))}
            </ul>
          )}
          {editable && (
            <ActionForm
              action={uploadAttachment.bind(null, kind, post.id)}
              submitLabel="파일 올리기"
              resetOnSuccess
              className="mt-3 flex flex-wrap items-center gap-2"
            >
              <input name="file" type="file" required aria-label="첨부파일" className="input max-w-xs" />
            </ActionForm>
          )}
        </section>
      )}
    </article>
  );
}
