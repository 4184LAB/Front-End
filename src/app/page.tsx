import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import HeroSlider from "@/components/HeroSlider";
import { Empty, Loading } from "@/components/ui";
import { sections } from "@/data/site";
import { formatDate } from "@/lib/format";
import { listPosts } from "@/lib/queries";

const quickLinks = [
  { href: "/signup", label: "회원가입" },
  { href: "/board/new", label: "의견 남기기" },
  { href: "/search", label: "정보공개 검색" },
  { href: "/mypage", label: "마이페이지" },
];

export default function Home() {
  return (
    <>
      <HeroSlider />

      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between border-b-2 border-primary pb-3">
            <h2 className="text-xl font-bold">국방소식</h2>
            <Link href="/board" className="text-sm text-muted hover:text-accent">
              더보기 +
            </Link>
          </div>
          <Suspense fallback={<Loading />}>
            <LatestPosts />
          </Suspense>
        </section>

        <section>
          <h2 className="border-b-2 border-primary pb-3 text-xl font-bold">민원 · 국민참여</h2>
          <ul className="mt-3 grid grid-cols-2 gap-3">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-md bg-surface px-3 py-5 text-center text-sm font-medium transition-colors hover:text-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="band mt-12 -mb-12 py-10 [--band:var(--surface)]">
        <h2 className="text-xl font-bold">주요정보 바로가기</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group rounded-md border border-line bg-background p-5 transition-colors hover:border-accent"
            >
              <h3 className="font-semibold group-hover:text-accent">{section.title} →</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{section.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

// 새 글이 바로 보이도록 요청 시점에 읽습니다.
async function LatestPosts() {
  await connection();
  const { items } = await listPosts({});

  if (items.length === 0) return <Empty>게시글이 없습니다.</Empty>;

  return (
    <ul>
      {items.slice(0, 5).map((post) => (
        <li key={post.id} className="flex justify-between gap-4 border-b border-line py-3 text-sm">
          <Link href={`/board/${post.id}`} className="truncate hover:text-accent">
            {post.title}
          </Link>
          <span className="shrink-0 text-muted">{formatDate(post.createdAt)}</span>
        </li>
      ))}
    </ul>
  );
}
