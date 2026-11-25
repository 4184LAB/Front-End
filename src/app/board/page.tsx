import type { Metadata } from "next";
import { Suspense } from "react";
import BoardList from "@/components/BoardList";
import { Loading, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "국민참여 게시판" };

export default function BoardPage(props: PageProps<"/board">) {
  return (
    <>
      <PageHeader title="국민참여 게시판" description="자유롭게 의견을 남겨주세요." />
      <Suspense fallback={<Loading />}>
        <BoardList kind="GENERAL" searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}
