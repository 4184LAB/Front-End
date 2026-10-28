import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { updatePost } from "@/actions/board";
import PostForm from "@/components/PostForm";
import { Loading, Notice, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getPostDetail } from "@/lib/queries";

export const metadata: Metadata = { title: "글 수정" };

export default function EditPostPage(props: PageProps<"/board/[id]/edit">) {
  return (
    <>
      <PageHeader title="글 수정" />
      <Suspense fallback={<Loading />}>
        <EditForm params={props.params} />
      </Suspense>
    </>
  );
}

async function EditForm({ params }: { params: PageProps<"/board/[id]/edit">["params"] }) {
  const { id } = await params;
  const user = await requireUser();
  const post = await getPostDetail(Number(id));
  if (!post) notFound();

  if (user.role !== "admin" && user.id !== post.authorId) {
    return <Notice title="수정 권한이 없습니다" href={`/board/${post.id}`} linkLabel="글로 돌아가기" />;
  }

  return (
    <PostForm
      action={updatePost.bind(null, post.id)}
      submitLabel="수정 완료"
      defaults={{ title: post.title, content: post.content }}
    />
  );
}
