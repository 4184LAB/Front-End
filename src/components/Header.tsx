import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { logout } from "@/actions/auth";
import { getCurrentUser } from "@/lib/auth";
import { sections, site } from "@/data/site";
import NavLinks, { NavList } from "./NavLinks";
import { Emblem } from "./ui";

const navItems = sections.filter((s) => s.nav).map(({ href, title }) => ({ href, title }));

export default function Header() {
  return (
    <>
      <div id="top" className="bg-navy-deep text-xs text-white/80">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-6 py-2">
          <p>{site.notice}</p>
          <div className="flex items-center gap-4">
            <Suspense fallback={<span>…</span>}>
              <UserMenu />
            </Suspense>
          </div>
        </div>
      </div>

      <header className="border-b border-line bg-background">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Emblem className="h-12 w-auto shrink-0" />
            <span>
              <span className="block text-xl font-bold tracking-tight">{site.name}</span>
              <span className="block text-xs text-muted">{site.nameEn}</span>
            </span>
          </Link>
          <Form action="/search" className="flex w-full gap-2 sm:w-auto">
            <input name="q" placeholder="통합검색" aria-label="통합검색" className="input sm:w-60" />
            <button type="submit" className="btn btn-primary">
              검색
            </button>
          </Form>
        </div>
      </header>

      <Suspense fallback={<NavList items={navItems} />}>
        <NavLinks items={navItems} />
      </Suspense>
    </>
  );
}

// 로그인 상태는 요청마다 달라지므로 Suspense 안에서 따로 렌더링합니다.
async function UserMenu() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <>
        <Link href="/login" className="hover:text-white">
          로그인
        </Link>
        <Link href="/signup" className="hover:text-white">
          회원가입
        </Link>
      </>
    );
  }

  return (
    <>
      {user.role === "admin" && (
        <Link href="/admin" className="hover:text-white">
          관리자
        </Link>
      )}
      <Link href="/mypage" className="font-medium hover:text-white">
        {user.name}님
      </Link>
      <form action={logout}>
        <button type="submit" className="hover:text-white">
          로그아웃
        </button>
      </form>
    </>
  );
}
