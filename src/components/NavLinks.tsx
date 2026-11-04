"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; title: string };

export function NavList({ items, pathname }: { items: Item[]; pathname?: string }) {
  return (
    <nav className="sticky top-0 z-10 border-b border-white/15 bg-navy text-white">
      <ul className="mx-auto flex max-w-6xl gap-8 overflow-x-auto px-6 whitespace-nowrap">
        {items.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`block border-b-[3px] py-3.5 font-medium transition-colors ${
                  active
                    ? "border-gold"
                    : "border-transparent text-white/85 hover:border-gold/60 hover:text-white"
                }`}
              >
                {item.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// 현재 주소는 요청 시점에만 알 수 있으므로 Suspense 안에서 사용합니다.
export default function NavLinks({ items }: { items: Item[] }) {
  return <NavList items={items} pathname={usePathname()} />;
}
