import "server-only";
import {
  apiFetch,
  ApiError,
  authorName,
  orNull,
  toPublicUser,
  type BackendComment,
  type BackendPost,
  type BackendPostSummary,
  type BackendUser,
  type BoardKind,
} from "./api";

// 모든 읽기 작업은 백엔드 API를 호출합니다. (lib/api.ts)

export const PAGE_SIZE = 10;

export type PostSummary = {
  id: number;
  title: string;
  authorName: string;
  commentCount: number;
  createdAt: string;
};

function summarize(post: BackendPostSummary): PostSummary {
  return {
    id: post.id,
    title: post.title,
    authorName: authorName(post.author),
    commentCount: post._count?.comments ?? 0,
    createdAt: post.createdAt,
  };
}

function paginate<T>(all: T[], page: number) {
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const current = Math.min(Math.max(1, page), totalPages);
  return {
    items: all.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE),
    total: all.length,
    page: current,
    totalPages,
  };
}

const boardPath = (kind: BoardKind) => (kind === "NOTICE" ? "/notices" : "/posts");

// 백엔드는 최신 100건까지 돌려주고, 페이지는 화면에서 나눕니다.
export async function listBoard(kind: BoardKind, { q = "", page = 1 }: { q?: string; page?: number }) {
  const posts = await apiFetch<BackendPostSummary[]>(boardPath(kind), {
    query: kind === "GENERAL" ? { q: q.trim() } : undefined,
    auth: kind === "GENERAL",
  });
  const keyword = q.trim().toLowerCase();
  // 공지 API에는 검색 파라미터가 없어 제목으로만 거릅니다.
  const filtered =
    kind === "NOTICE" && keyword ? posts.filter((p) => p.title.toLowerCase().includes(keyword)) : posts;
  return paginate(filtered.map(summarize), page);
}

export type PostDetail = Omit<BackendPost, "author"> & { authorName: string };

export async function getBoardPost(kind: BoardKind, id: number): Promise<PostDetail | null> {
  if (!Number.isInteger(id) || id < 1) return null;
  const post = await orNull(
    apiFetch<BackendPost>(`${boardPath(kind)}/${id}`, { auth: kind === "GENERAL" }),
  );
  if (!post) return null;
  const { author, ...rest } = post;
  return { ...rest, authorName: authorName(author) };
}

export type CommentView = Omit<BackendComment, "author"> & { authorName: string };

export async function getComments(postId: number): Promise<CommentView[]> {
  const comments = await apiFetch<BackendComment[]>(`/posts/${postId}/comments`);
  return comments.map(({ author, ...rest }) => ({ ...rest, authorName: authorName(author) }));
}

export async function getUserActivity() {
  const data = await apiFetch<{ posts: BackendPostSummary[]; commentCount: number }>(
    "/users/me/activity",
  );
  return { posts: data.posts.map(summarize), commentCount: data.commentCount };
}

export async function getAdminOverview() {
  const data = await apiFetch<{
    stats: { users: number; posts: number; notices: number; comments: number; postsToday: number };
    users: (BackendUser & { postCount: number })[];
    recentPosts: BackendPostSummary[];
  }>("/admin/overview");

  return {
    stats: data.stats,
    users: data.users.map((u) => ({ ...toPublicUser(u), postCount: u.postCount })),
    recentPosts: data.recentPosts.map(summarize),
  };
}

// ---- 통합 검색 / 데이터 조회 (백엔드 GET /search) ----

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

type BackendSearchRow = Omit<SearchRow, "href"> & {
  postType: BoardKind | null;
  postId: number | null;
};

export async function search(params: SearchParams) {
  try {
    const data = await apiFetch<{ rows: BackendSearchRow[] }>("/search", {
      query: { ...params },
    });
    const rows: SearchRow[] = data.rows.map(({ postType, postId, ...row }) => ({
      ...row,
      href: postId ? `${postType === "NOTICE" ? "/notices" : "/board"}/${postId}` : undefined,
    }));
    return { error: null, status: 200, rows };
  } catch (error) {
    if (error instanceof ApiError && error.status !== 503) {
      return { error: error.message, status: error.status, rows: [] as SearchRow[] };
    }
    throw error;
  }
}
