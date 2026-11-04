import { site } from "@/data/site";
import { Emblem } from "./ui";

// 빌드 시점의 연도로 프리렌더링되어 캐시됩니다.
async function CurrentYear() {
  "use cache";
  return new Date().getFullYear();
}

export default function Footer() {
  return (
    <footer className="bg-navy-deep text-sm text-white/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <Emblem className="h-12 w-auto shrink-0" />
          <div className="space-y-1">
            <p className="font-semibold text-white">{site.name}</p>
            <p>{site.address}</p>
            <p>
              © <CurrentYear /> {site.owner}. All rights reserved.
            </p>
          </div>
        </div>
        <ul className="flex flex-wrap gap-4">
          <li>
            <a href={`mailto:${site.email}`} className="hover:text-white">
              {site.email}
            </a>
          </li>
          {site.links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a href="#top" className="hover:text-white">
              맨위로 ↑
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
