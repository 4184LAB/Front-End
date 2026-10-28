import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { Card, Empty, Loading, PageHeader } from "@/components/ui";
import {
  CITIES,
  describeWeather,
  getKrwRates,
  getWeather,
  searchRepos,
  type CityKey,
} from "@/lib/external";

export const metadata: Metadata = { title: "외부 자료" };

type SP = PageProps<"/external">["searchParams"];

// 외부 API 호출 실패를 화면 렌더링과 분리해 처리합니다.
async function settle<T>(promise: Promise<T>) {
  try {
    return { data: await promise, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "알 수 없는 오류" };
  }
}

export default function ExternalPage(props: PageProps<"/external">) {
  return (
    <>
      <PageHeader
        title="외부 자료"
        description="공개 API에서 실시간 데이터를 가져와 보여줍니다. 응답은 잠시 캐시됩니다."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="날씨 (Open-Meteo)" className="lg:col-span-2">
          <Suspense fallback={<Loading />}>
            <WeatherSection searchParams={props.searchParams} />
          </Suspense>
        </Card>

        <Card title="환율 (ExchangeRate-API)">
          <Suspense fallback={<Loading />}>
            <RatesSection />
          </Suspense>
        </Card>

        <Card title="GitHub 저장소 검색">
          <Suspense fallback={<Loading />}>
            <RepoSection searchParams={props.searchParams} />
          </Suspense>
        </Card>
      </div>
    </>
  );
}

async function WeatherSection({ searchParams }: { searchParams: SP }) {
  const { city: rawCity, repo } = await searchParams;
  const city: CityKey =
    typeof rawCity === "string" && rawCity in CITIES ? (rawCity as CityKey) : "seoul";
  const { data: weather, error } = await settle(getWeather(city));

  const cityHref = (key: string) => {
    const sp = new URLSearchParams({ city: key });
    if (typeof repo === "string") sp.set("repo", repo);
    return `/external?${sp}`;
  };

  return (
    <>
      <div className="mb-5 flex flex-wrap gap-1.5">
        {Object.entries(CITIES).map(([key, info]) => (
          <Link
            key={key}
            href={cityHref(key)}
            scroll={false}
            className={`btn btn-sm ${key === city ? "btn-primary" : "btn-secondary"}`}
          >
            {info.name}
          </Link>
        ))}
      </div>

      {!weather ? (
        <Empty>날씨 정보를 불러오지 못했습니다: {error}</Empty>
      ) : (
        <>
          <div className="flex flex-wrap items-end gap-6">
            <div>
              <p className="text-sm text-muted">{CITIES[city].name} 현재</p>
              <p className="mt-1 text-4xl font-semibold tabular-nums">
                {describeWeather(weather.current.code).icon}{" "}
                {weather.current.temperature.toFixed(1)}°C
              </p>
            </div>
            <dl className="flex gap-6 text-sm">
              <div>
                <dt className="text-muted">날씨</dt>
                <dd>{describeWeather(weather.current.code).label}</dd>
              </div>
              <div>
                <dt className="text-muted">습도</dt>
                <dd className="tabular-nums">{weather.current.humidity}%</dd>
              </div>
              <div>
                <dt className="text-muted">풍속</dt>
                <dd className="tabular-nums">{weather.current.windSpeed} km/h</dd>
              </div>
            </dl>
          </div>
          <ul className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-7">
            {weather.daily.map((day) => {
              const d = describeWeather(day.code);
              return (
                <li key={day.date} className="rounded-lg bg-surface p-2 text-center text-xs">
                  <p className="text-muted">{day.date.slice(5).replace("-", "/")}</p>
                  <p className="my-1 text-xl" title={d.label}>
                    {d.icon}
                  </p>
                  <p className="tabular-nums">
                    {Math.round(day.max)}° /{" "}
                    <span className="text-muted">{Math.round(day.min)}°</span>
                  </p>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </>
  );
}

async function RatesSection() {
  const { data, error } = await settle(getKrwRates());
  if (!data) return <Empty>환율 정보를 불러오지 못했습니다: {error}</Empty>;

  return (
    <>
      <table className="table">
        <thead>
          <tr>
            <th>통화</th>
            <th className="text-right">원화 환산</th>
          </tr>
        </thead>
        <tbody>
          {data.rates.map((rate) => (
            <tr key={rate.code}>
              <td>
                {rate.unit} {rate.code}
              </td>
              <td className="text-right tabular-nums">
                {rate.krw.toLocaleString("ko-KR", { maximumFractionDigits: 2 })} 원
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-muted">기준 시각: {data.updatedAt}</p>
    </>
  );
}

async function RepoSection({ searchParams }: { searchParams: SP }) {
  const { repo, city } = await searchParams;
  const query = typeof repo === "string" && repo.trim() ? repo.trim().slice(0, 100) : "nextjs";
  const { data: repos, error } = await settle(searchRepos(query));

  return (
    <>
      <Form action="/external" scroll={false} className="mb-4 flex gap-2">
        {typeof city === "string" && <input type="hidden" name="city" value={city} />}
        <input name="repo" defaultValue={query} placeholder="저장소 검색" className="input" />
        <button type="submit" className="btn btn-secondary">
          검색
        </button>
      </Form>

      {!repos ? (
        <Empty>GitHub 검색에 실패했습니다: {error}</Empty>
      ) : repos.length === 0 ? (
        <Empty>검색 결과가 없습니다.</Empty>
      ) : (
        <ul className="divide-y divide-line">
          {repos.map((r) => (
            <li key={r.id} className="py-2.5">
              <a
                href={r.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium hover:text-accent"
              >
                {r.full_name}
              </a>
              {r.description && (
                <p className="mt-0.5 line-clamp-1 text-xs text-muted">{r.description}</p>
              )}
              <p className="mt-1 text-xs text-muted">
                ★ {r.stargazers_count.toLocaleString("ko-KR")}
                {r.language && ` · ${r.language}`}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
