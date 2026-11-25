import type { Metadata } from "next";
import { Suspense } from "react";
import BoardList from "@/components/BoardList";
import { Loading, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "공지사항" };

export default function NoticesPage(props: PageProps<"/notices">) {
  return (
    <>
      <PageHeader title="공지사항" description="국방부의 공식 공지와 첨부 자료를 안내합니다." />
      <Suspense fallback={<Loading />}>
        <BoardList kind="NOTICE" searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}
