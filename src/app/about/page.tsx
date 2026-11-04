import type { Metadata } from "next";
import { Card, Emblem, PageHeader } from "@/components/ui";
import { about, site } from "@/data/site";

export const metadata: Metadata = { title: "국방부 소개" };

function Heading({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 text-xl font-bold">{children}</h2>;
}

export default function AboutPage() {
  return (
    <>
      <PageHeader title="국방부 소개" description={site.slogan} />

      <div className="space-y-12">
        <section className="flex flex-col gap-8 sm:flex-row sm:items-start">
          <Emblem className="h-32 w-auto shrink-0 self-center sm:self-start" />
          <div>
            <Heading>인사말</Heading>
            <div className="space-y-3 leading-relaxed text-muted">
              {about.greeting.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <p className="mt-4 font-semibold">{site.name}</p>
          </div>
        </section>

        <section>
          <Heading>임무</Heading>
          <div className="grid gap-4 sm:grid-cols-3">
            {about.missions.map((mission) => (
              <Card key={mission.title} title={mission.title}>
                <p className="text-sm leading-relaxed text-muted">{mission.text}</p>
              </Card>
            ))}
          </div>
        </section>

        <div className="grid gap-12 lg:grid-cols-2">
          <section>
            <Heading>연혁</Heading>
            <ol className="border-t-2 border-primary">
              {about.history.map((item) => (
                <li key={item.year} className="flex gap-6 border-b border-line py-3 text-sm">
                  <span className="w-12 shrink-0 font-semibold text-accent">{item.year}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <Heading>조직</Heading>
            <ul className="border-t-2 border-primary">
              {about.organization.map((unit) => (
                <li key={unit.title} className="flex gap-6 border-b border-line py-3 text-sm">
                  <span className="w-24 shrink-0 font-semibold">{unit.title}</span>
                  <span className="text-muted">{unit.text}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section>
          <Heading>찾아오시는 길</Heading>
          <dl className="grid grid-cols-[4rem_1fr] gap-y-2 rounded-md bg-surface p-5 text-sm">
            <dt className="font-medium">주소</dt>
            <dd className="text-muted">{site.address}</dd>
            <dt className="font-medium">문의</dt>
            <dd>
              <a href={`mailto:${site.email}`} className="text-accent hover:underline">
                {site.email}
              </a>
            </dd>
          </dl>
        </section>
      </div>
    </>
  );
}
