"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; title: string };

export function NavList({ items, pathname }: { items: Item[]; pathname?: string }) {
  return (
    <nav className="order-last w-full overflow-x-auto sm:order-none sm:w-auto">
      <ul className="flex gap-5 text-sm whitespace-nowrap">
        {items.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={
                  active
                    ? "font-medium text-foreground"
                    : "text-muted transition-colors hover:text-foreground"
                }
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
