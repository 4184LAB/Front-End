import type { Metadata } from "next";
import { Suspense } from "react";
import { purgeExpiredSessions } from "@/actions/admin";
import ConfirmButton from "@/components/ConfirmButton";
import DevTools from "@/components/DevTools";
import { Card, Loading, PageHeader } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { formatBytes, formatDateTime, formatDuration } from "@/lib/format";
import { getDbCounts } from "@/lib/queries";
import { getSystemInfo } from "@/lib/system";

export const metadata: Metadata = { title: "시스템 도구" };

export default function ToolsPage() {
  return (
    <>
      <PageHeader
        title="시스템 도구"
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

  const [info, counts] = await Promise.all([getSystemInfo(), getDbCounts()]);
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
          <dt className="text-muted">DB 파일</dt>
          <dd className="font-mono text-xs break-all">{info.dbPath}</dd>
          <dt className="text-muted">파일 크기</dt>
          <dd>{formatBytes(info.dbSize)}</dd>
          <dt className="text-muted">회원 / 글 / 댓글</dt>
          <dd>
            {counts.users} / {counts.posts} / {counts.comments}
          </dd>
          <dt className="text-muted">세션 (만료됨)</dt>
          <dd>
            {counts.sessions} ({counts.expiredSessions})
          </dd>
        </dl>
        <div className="mt-6 flex flex-wrap gap-2">
          <a href="/api/admin/backup" className="btn btn-primary btn-sm">
            DB 백업 다운로드
          </a>
          <form action={purgeExpiredSessions}>
            <ConfirmButton message="만료된 세션을 모두 삭제할까요?" className="btn btn-secondary btn-sm">
              만료 세션 정리
            </ConfirmButton>
          </form>
        </div>
      </Card>
    </div>
  );
}
