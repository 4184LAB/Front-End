import type { Metadata } from "next";
import { Suspense } from "react";
import { createPost } from "@/actions/board";
import PostForm from "@/components/PostForm";
import { Loading, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "글쓰기" };

export default function NewPostPage() {
  return (
    <>
      <PageHeader title="글쓰기" />
      <Suspense fallback={<Loading />}>
        <NewPostForm />
      </Suspense>
    </>
  );
}

async function NewPostForm() {
  await requireUser();
  return <PostForm action={createPost} submitLabel="등록" />;
}
