import type { Metadata } from "next";
import { Suspense } from "react";
import DevTools from "@/components/DevTools";
import { Card, Loading, PageHeader } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { formatBytes, formatDateTime, formatDuration } from "@/lib/format";
import { API_BASE_URL, ApiError } from "@/lib/api";
import { getAdminOverview } from "@/lib/queries";
import { getSystemInfo } from "@/lib/system";

export const metadata: Metadata = { title: "사이버 방위 도구" };

export default function ToolsPage() {
  return (
    <>
      <PageHeader
        title="사이버 방위 도구"
        description="브라우저에서 바로 쓰는 개발 도구와 서버 상태 점검 도구입니다."
      />
      <div className="space-y-6">
        <Card title="개발 도구">
          <DevTools />
        </Card>

        <Card title="API 엔드포인트">
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/api/health" target="_blank" className="font-mono text-accent hover:underline">
                GET /api/health
              </a>
              <span className="ml-2 text-muted">서버 상태 확인 (누구나)</span>
            </li>
            <li>
              <a
                href="/api/search?type=posts"
                target="_blank"
                className="font-mono text-accent hover:underline"
              >
                GET /api/search
              </a>
              <span className="ml-2 text-muted">검색 결과를 JSON으로 조회</span>
            </li>
            <li>
              <span className="font-mono">GET /api/admin/backup</span>
              <span className="ml-2 text-muted">데이터베이스 백업 다운로드 (관리자)</span>
            </li>
          </ul>
        </Card>

        <Suspense fallback={<Card title="서버 상태"><Loading /></Card>}>
          <ServerStatus />
        </Suspense>
      </div>
    </>
  );
}

async function ServerStatus() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") {
    return (
      <Card title="서버 상태">
        <p className="text-sm text-muted">서버 상태와 데이터 관리 도구는 관리자만 볼 수 있습니다.</p>
      </Card>
    );
  }

  const info = await getSystemInfo();
  // 백엔드 연결 상태와 데이터 건수를 함께 보여 줍니다.
  const backend = await getAdminOverview().then(
    (overview) => ({ ok: true as const, stats: overview.stats }),
    (error: unknown) => {
      if (error instanceof ApiError) return { ok: false as const, message: error.message };
      throw error;
    },
  );
  const memoryPercent = Math.round(
    ((info.memory.systemTotal - info.memory.systemFree) / info.memory.systemTotal) * 100,
  );

  const rows: [string, React.ReactNode][] = [
    ["Node.js", info.node],
    ["운영체제", info.platform],
    ["호스트", info.hostname],
    ["실행 모드", info.env],
    ["CPU 코어", info.cpus],
    ["서버 가동 시간", formatDuration(info.processUptime)],
    ["시스템 가동 시간", formatDuration(info.systemUptime)],
    ["프로세스 메모리 (RSS)", formatBytes(info.memory.rss)],
    ["힙 사용량", `${formatBytes(info.memory.heapUsed)} / ${formatBytes(info.memory.heapTotal)}`],
    [
      "시스템 메모리",
      `${formatBytes(info.memory.systemTotal - info.memory.systemFree)} / ${formatBytes(info.memory.systemTotal)} (${memoryPercent}%)`,
    ],
    ["서버 시각", formatDateTime(info.serverTime)],
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="서버 상태">
        <dl className="grid grid-cols-[10rem_1fr] gap-y-2 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-muted">{label}</dt>
              <dd className="break-all">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card title="데이터 관리">
        <dl className="grid grid-cols-[10rem_1fr] gap-y-2 text-sm">
          <dt className="text-muted">백엔드 API</dt>
          <dd className="font-mono text-xs break-all">{API_BASE_URL}</dd>
          <dt className="text-muted">연결 상태</dt>
          <dd className={backend.ok ? "text-success" : "text-danger"}>
            {backend.ok ? "정상" : backend.message}
          </dd>
          {backend.ok && (
            <>
              <dt className="text-muted">회원 / 글 / 댓글</dt>
              <dd>
                {backend.stats.users} / {backend.stats.posts} / {backend.stats.comments}
              </dd>
              <dt className="text-muted">공지사항</dt>
              <dd>{backend.stats.notices}</dd>
            </>
          )}
        </dl>
        <p className="mt-4 text-xs text-muted">
          로그인은 백엔드 JWT로 처리하며 서버 세션을 따로 저장하지 않습니다.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <a href="/api/admin/backup" className="btn btn-primary btn-sm">
            DB 백업 다운로드
          </a>
        </div>
      </Card>
    </div>
  );
}
