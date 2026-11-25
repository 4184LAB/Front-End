import type { Metadata } from "next";
import { Suspense } from "react";
import { createPost } from "@/actions/board";
import PostForm from "@/components/PostForm";
import { Loading, Notice, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "공지 작성" };

export default function NewNoticePage() {
  return (
    <>
      <PageHeader title="공지 작성" />
      <Suspense fallback={<Loading />}>
        <NewNoticeForm />
      </Suspense>
    </>
  );
}

async function NewNoticeForm() {
  const user = await requireUser();
  if (user.role !== "admin") {
    return <Notice title="관리자만 공지를 쓸 수 있습니다" href="/notices" linkLabel="공지사항으로" />;
  }
  return <PostForm action={createPost.bind(null, "NOTICE")} submitLabel="등록" />;
}
