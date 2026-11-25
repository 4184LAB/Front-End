import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { updatePost } from "@/actions/board";
import PostForm from "@/components/PostForm";
import { Loading, Notice, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getBoardPost } from "@/lib/queries";

export const metadata: Metadata = { title: "공지 수정" };

export default function EditNoticePage(props: PageProps<"/notices/[id]/edit">) {
  return (
    <>
      <PageHeader title="공지 수정" />
      <Suspense fallback={<Loading />}>
        <EditForm params={props.params} />
      </Suspense>
    </>
  );
}

async function EditForm({ params }: { params: PageProps<"/notices/[id]/edit">["params"] }) {
  const { id } = await params;
  const user = await requireUser();
  const post = await getBoardPost("NOTICE", Number(id));
  if (!post) notFound();

  if (user.role !== "admin") {
    return <Notice title="관리자만 수정할 수 있습니다" href={`/notices/${post.id}`} linkLabel="공지로 돌아가기" />;
  }

  return (
    <PostForm
      action={updatePost.bind(null, "NOTICE", post.id)}
      submitLabel="수정 완료"
      defaults={{ title: post.title, content: post.content }}
    />
  );
}
