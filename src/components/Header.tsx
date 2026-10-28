import Link from "next/link";
import { Suspense } from "react";
import { logout } from "@/actions/auth";
import { getCurrentUser } from "@/lib/auth";
import { sections, site } from "@/data/site";
import NavLinks, { NavList } from "./NavLinks";

const navItems = sections.filter((s) => s.nav).map(({ href, title }) => ({ href, title }));

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3">
        <Link href="/" className="font-semibold tracking-tight">
          {site.name}
        </Link>
        <Suspense fallback={<NavList items={navItems} />}>
          <NavLinks items={navItems} />
        </Suspense>
        <div className="ml-auto flex items-center gap-3 text-sm">
          <Suspense fallback={<span className="text-muted">…</span>}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

// 로그인 상태는 요청마다 달라지므로 Suspense 안에서 따로 렌더링합니다.
async function UserMenu() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <>
        <Link href="/login" className="text-muted hover:text-foreground">
          로그인
        </Link>
        <Link href="/signup" className="btn btn-primary btn-sm">
          회원가입
        </Link>
      </>
    );
  }

  return (
    <>
      {user.role === "admin" && (
        <Link href="/admin" className="text-muted hover:text-foreground">
          관리자
        </Link>
      )}
      <Link href="/mypage" className="font-medium hover:text-accent">
        {user.name}님
      </Link>
      <form action={logout}>
        <button type="submit" className="btn btn-secondary btn-sm">
          로그아웃
        </button>
      </form>
    </>
  );
}
