import Link from "next/link";
import { sections, site } from "@/data/site";

export default function Home() {
  return (
    <>
      <section className="py-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{site.name}</h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">{site.description}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/board" className="btn btn-primary">
            게시판 둘러보기
          </Link>
          <Link href="/signup" className="btn btn-secondary">
            회원가입
          </Link>
        </div>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group rounded-xl border border-line p-5 transition-colors hover:border-accent"
          >
            <h2 className="font-semibold group-hover:text-accent">{section.title} →</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{section.description}</p>
          </Link>
        ))}
      </section>
    </>
  );
}
