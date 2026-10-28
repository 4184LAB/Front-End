import { site } from "@/data/site";

// 빌드 시점의 연도로 프리렌더링되어 캐시됩니다.
async function CurrentYear() {
  "use cache";
  return new Date().getFullYear();
}

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-8 text-sm text-muted sm:flex-row sm:justify-between">
        <p>
          © <CurrentYear /> {site.owner}. All rights reserved.
        </p>
        <ul className="flex gap-4">
          <li>
            <a href={`mailto:${site.email}`} className="hover:text-foreground">
              {site.email}
            </a>
          </li>
          {site.links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
