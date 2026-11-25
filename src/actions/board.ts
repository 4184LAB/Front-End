"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { actionError, apiFetch, ApiError, type BoardKind } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { field, type FormState } from "@/lib/form-state";

// 권한 판단은 백엔드가 다시 합니다. 여기서는 로그인 여부와 입력값만 먼저 확인합니다.

const MAX_FILE_BYTES = 10 * 1024 * 1024;

const apiPath = (kind: BoardKind) => (kind === "NOTICE" ? "/notices" : "/posts");
const pagePath = (kind: BoardKind) => (kind === "NOTICE" ? "/notices" : "/board");

async function requireLogin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

function validatePost(formData: FormData) {
  const title = field(formData, "title");
  const content = field(formData, "content");
  if (!title || title.length > 100) return { error: "제목은 1~100자로 입력하세요." } as const;
  if (!content || content.length > 5000) return { error: "내용은 1~5000자로 입력하세요." } as const;
  return { title, content } as const;
}

function pickFile(formData: FormData) {
  const file = formData.get("file");
  return file instanceof File && file.size > 0 ? file : null;
}

function checkFile(file: File | null) {
  if (file && file.size > MAX_FILE_BYTES) return "첨부파일은 10MB 이하만 올릴 수 있습니다.";
  return null;
}

async function uploadFile(kind: BoardKind, postId: number, file: File) {
  const form = new FormData();
  form.append("file", file, file.name);
  await apiFetch(`${apiPath(kind)}/${postId}/files`, { method: "POST", form });
}

export async function createPost(kind: BoardKind, _: FormState, formData: FormData): Promise<FormState> {
  await requireLogin();

  const input = validatePost(formData);
  if ("error" in input) return input;
  const file = pickFile(formData);
  const fileError = checkFile(file);
  if (fileError) return { error: fileError };

  let id: number;
  try {
    ({ id } = await apiFetch<{ id: number }>(apiPath(kind), { method: "POST", json: input }));
  } catch (error) {
    return actionError(error);
  }

  let uploadFailed = false;
  if (file) {
    // 글은 이미 등록됐으므로 업로드가 실패해도 글 화면으로 이동해 알려 줍니다.
    uploadFailed = await uploadFile(kind, id, file).then(
      () => false,
      () => true,
    );
  }

  redirect(`${pagePath(kind)}/${id}${uploadFailed ? "?upload=failed" : ""}`);
}

export async function updatePost(
  kind: BoardKind,
  postId: number,
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireLogin();

  const input = validatePost(formData);
  if ("error" in input) return input;
  const file = pickFile(formData);
  const fileError = checkFile(file);
  if (fileError) return { error: fileError };

  try {
    await apiFetch(`${apiPath(kind)}/${postId}`, { method: "PATCH", json: input });
    if (file) await uploadFile(kind, postId, file);
  } catch (error) {
    return actionError(error);
  }

  redirect(`${pagePath(kind)}/${postId}`);
}

export async function deletePost(kind: BoardKind, postId: number) {
  const user = await requireLogin();

  // 관리자는 남의 일반 게시글도 관리자 API로 삭제합니다.
  const path =
    kind === "GENERAL" && user.role === "admin" ? `/admin/posts/${postId}` : `${apiPath(kind)}/${postId}`;
  try {
    await apiFetch(path, { method: "DELETE" });
  } catch (error) {
    if (!(error instanceof ApiError) || error.status === 503) throw error;
    // 이미 삭제됐거나 권한이 없으면 목록으로 돌아갑니다.
  }

  redirect(pagePath(kind));
}

export async function uploadAttachment(
  kind: BoardKind,
  postId: number,
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireLogin();

  const file = pickFile(formData);
  if (!file) return { error: "파일을 선택하세요." };
  const fileError = checkFile(file);
  if (fileError) return { error: fileError };

  try {
    await uploadFile(kind, postId, file);
  } catch (error) {
    return actionError(error);
  }

  refresh();
  return { ok: true, message: "첨부파일을 올렸습니다." };
}

export async function addComment(postId: number, _: FormState, formData: FormData): Promise<FormState> {
  await requireLogin();

  const content = field(formData, "content");
  if (!content || content.length > 1000) return { error: "댓글은 1~1000자로 입력하세요." };

  try {
    await apiFetch(`/posts/${postId}/comments`, { method: "POST", json: { content } });
  } catch (error) {
    return actionError(error);
  }

  refresh();
  return { ok: true };
}

export async function deleteComment(postId: number, commentId: number) {
  await requireLogin();

  try {
    await apiFetch(`/posts/${postId}/comments/${commentId}`, { method: "DELETE" });
  } catch (error) {
    if (!(error instanceof ApiError) || error.status === 503) throw error;
  }

  refresh();
}
