import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PostView from "@/components/PostView";
import { Loading } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { getBoardPost } from "@/lib/queries";

export const metadata: Metadata = { title: "공지사항" };

export default function NoticePage(props: PageProps<"/notices/[id]">) {
  return (
    <>
      <Link href="/notices" className="text-sm text-muted hover:text-foreground">
        ← 목록으로
      </Link>
      <Suspense fallback={<Loading />}>
        <NoticeDetail params={props.params} searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}

// 공지는 로그인 없이 볼 수 있습니다.
async function NoticeDetail({
  params,
  searchParams,
}: {
  params: PageProps<"/notices/[id]">["params"];
  searchParams: PageProps<"/notices/[id]">["searchParams"];
}) {
  const { id } = await params;
  const { upload } = await searchParams;
  const [post, user] = await Promise.all([getBoardPost("NOTICE", Number(id)), getCurrentUser()]);
  if (!post) notFound();

  return <PostView kind="NOTICE" post={post} user={user} uploadFailed={upload === "failed"} />;
}
