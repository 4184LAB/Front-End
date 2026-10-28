import "server-only";
import { readDb, toPublicUser, type Data, type PublicUser } from "./db";

export const PAGE_SIZE = 10;

function authorName(data: Data, userId: string) {
  return data.users.find((u) => u.id === userId)?.name ?? "(탈퇴한 회원)";
}

export type PostSummary = {
  id: number;
  title: string;
  authorName: string;
  commentCount: number;
  createdAt: string;
};

function summarize(data: Data, post: Data["posts"][number]): PostSummary {
  return {
    id: post.id,
    title: post.title,
    authorName: authorName(data, post.authorId),
    commentCount: data.comments.filter((c) => c.postId === post.id).length,
    createdAt: post.createdAt,
  };
}

export async function listPosts({ q = "", page = 1 }: { q?: string; page?: number }) {
  const data = await readDb();
  const keyword = q.trim().toLowerCase();
  const filtered = data.posts
    .filter(
      (p) =>
        !keyword ||
        p.title.toLowerCase().includes(keyword) ||
        p.content.toLowerCase().includes(keyword),
    )
    .sort((a, b) => b.id - a.id);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(Math.max(1, page), totalPages);
  const items = filtered
    .slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
    .map((p) => summarize(data, p));

  return { items, total: filtered.length, page: current, totalPages };
}

export async function getPostDetail(id: number) {
  const data = await readDb();
  const post = data.posts.find((p) => p.id === id);
  if (!post) return null;
  return {
    ...post,
    authorName: authorName(data, post.authorId),
    comments: data.comments
      .filter((c) => c.postId === id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((c) => ({ ...c, authorName: authorName(data, c.authorId) })),
  };
}

export async function getUserActivity(userId: string) {
  const data = await readDb();
  return {
    posts: data.posts
      .filter((p) => p.authorId === userId)
      .sort((a, b) => b.id - a.id)
      .map((p) => summarize(data, p)),
    commentCount: data.comments.filter((c) => c.authorId === userId).length,
  };
}

export async function getAdminOverview() {
  const data = await readDb();
  const today = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
  const isToday = (iso: string) =>
    new Date(Date.parse(iso) + 9 * 3600 * 1000).toISOString().slice(0, 10) === today;

  return {
    stats: {
      users: data.users.length,
      posts: data.posts.length,
      comments: data.comments.length,
      postsToday: data.posts.filter((p) => isToday(p.createdAt)).length,
      activeSessions: data.sessions.filter((s) => Date.parse(s.expiresAt) > Date.now()).length,
    },
    users: data.users
      .map((u) => ({
        ...toPublicUser(u),
        postCount: data.posts.filter((p) => p.authorId === u.id).length,
      }))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    recentPosts: [...data.posts]
      .sort((a, b) => b.id - a.id)
      .slice(0, 10)
      .map((p) => summarize(data, p)),
  };
}

export async function getDbCounts() {
  const data = await readDb();
  return {
    users: data.users.length,
    sessions: data.sessions.length,
    expiredSessions: data.sessions.filter((s) => Date.parse(s.expiresAt) <= Date.now()).length,
    posts: data.posts.length,
    comments: data.comments.length,
  };
}

// ---- 통합 검색 / 데이터 조회 ----

export type SearchType = "posts" | "comments" | "users";
export type SearchSort = "latest" | "oldest";

export type SearchParams = {
  q: string;
  type: SearchType;
  sort: SearchSort;
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
};

export type SearchRow = {
  id: string;
  title: string;
  detail: string;
  author: string;
  createdAt: string;
  href?: string;
};

export function parseSearchParams(raw: Record<string, string | string[] | undefined>): SearchParams {
  const pick = (key: string) => {
    const value = raw[key];
    return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
  };
  const type = pick("type");
  const date = (v: string) => (/^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "");
  return {
    q: pick("q").slice(0, 100),
    type: type === "comments" || type === "users" ? type : "posts",
    sort: pick("sort") === "oldest" ? "oldest" : "latest",
    from: date(pick("from")),
    to: date(pick("to")),
  };
}

export async function search(params: SearchParams, viewer: PublicUser | null) {
  if (params.type === "users" && viewer?.role !== "admin") {
    return { error: "회원 검색은 관리자만 사용할 수 있습니다.", rows: [] as SearchRow[] };
  }

  const data = await readDb();
  const keyword = params.q.toLowerCase();
  const matches = (...fields: string[]) =>
    !keyword || fields.some((f) => f.toLowerCase().includes(keyword));

  // 날짜 범위는 한국 시간(KST) 기준으로 비교합니다.
  const fromMs = params.from ? Date.parse(`${params.from}T00:00:00+09:00`) : -Infinity;
  const toMs = params.to ? Date.parse(`${params.to}T23:59:59.999+09:00`) : Infinity;
  const inRange = (iso: string) => {
    const t = Date.parse(iso);
    return t >= fromMs && t <= toMs;
  };

  let rows: SearchRow[];
  if (params.type === "posts") {
    rows = data.posts
      .filter((p) => inRange(p.createdAt) && matches(p.title, p.content))
      .map((p) => ({
        id: String(p.id),
        title: p.title,
        detail: p.content.slice(0, 80),
        author: authorName(data, p.authorId),
        createdAt: p.createdAt,
        href: `/board/${p.id}`,
      }));
  } else if (params.type === "comments") {
    rows = data.comments
      .filter((c) => inRange(c.createdAt) && matches(c.content))
      .map((c) => ({
        id: c.id,
        title: data.posts.find((p) => p.id === c.postId)?.title ?? "(삭제된 글)",
        detail: c.content.slice(0, 80),
        author: authorName(data, c.authorId),
        createdAt: c.createdAt,
        href: `/board/${c.postId}`,
      }));
  } else {
    rows = data.users
      .filter((u) => inRange(u.createdAt) && matches(u.name, u.email))
      .map((u) => ({
        id: u.id,
        title: u.name,
        detail: u.email,
        author: u.role === "admin" ? "관리자" : "회원",
        createdAt: u.createdAt,
      }));
  }

  rows.sort((a, b) =>
    params.sort === "latest"
      ? b.createdAt.localeCompare(a.createdAt)
      : a.createdAt.localeCompare(b.createdAt),
  );
  return { error: null, rows };
}
