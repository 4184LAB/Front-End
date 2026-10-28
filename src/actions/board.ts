"use server";

import { randomUUID } from "crypto";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { updateDb, type PublicUser } from "@/lib/db";
import { field, type FormState } from "@/lib/form-state";

function canModify(user: PublicUser, authorId: string) {
  return user.role === "admin" || user.id === authorId;
}

function validatePost(formData: FormData) {
  const title = field(formData, "title");
  const content = field(formData, "content");
  if (!title || title.length > 100) return { error: "제목은 1~100자로 입력하세요." } as const;
  if (!content || content.length > 5000) return { error: "내용은 1~5000자로 입력하세요." } as const;
  return { title, content } as const;
}

export async function createPost(_: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const input = validatePost(formData);
  if ("error" in input) return input;

  const id = await updateDb((data) => {
    const now = new Date().toISOString();
    const nextId = data.posts.reduce((max, p) => Math.max(max, p.id), 0) + 1;
    data.posts.push({ id: nextId, ...input, authorId: user.id, createdAt: now, updatedAt: now });
    return nextId;
  });

  redirect(`/board/${id}`);
}

export async function updatePost(
  postId: number,
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const input = validatePost(formData);
  if ("error" in input) return input;

  const error = await updateDb((data) => {
    const post = data.posts.find((p) => p.id === postId);
    if (!post) return "글을 찾을 수 없습니다.";
    if (!canModify(user, post.authorId)) return "수정 권한이 없습니다.";
    Object.assign(post, input, { updatedAt: new Date().toISOString() });
    return null;
  });
  if (error) return { error };

  redirect(`/board/${postId}`);
}

export async function deletePost(postId: number) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await updateDb((data) => {
    const post = data.posts.find((p) => p.id === postId);
    if (!post || !canModify(user, post.authorId)) return;
    data.posts = data.posts.filter((p) => p.id !== postId);
    data.comments = data.comments.filter((c) => c.postId !== postId);
  });

  redirect("/board");
}

export async function addComment(
  postId: number,
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const content = field(formData, "content");
  if (!content || content.length > 1000) return { error: "댓글은 1~1000자로 입력하세요." };

  const ok = await updateDb((data) => {
    if (!data.posts.some((p) => p.id === postId)) return false;
    data.comments.push({
      id: randomUUID(),
      postId,
      authorId: user.id,
      content,
      createdAt: new Date().toISOString(),
    });
    return true;
  });
  if (!ok) return { error: "글을 찾을 수 없습니다." };

  refresh();
  return { ok: true };
}

export async function deleteComment(commentId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await updateDb((data) => {
    const comment = data.comments.find((c) => c.id === commentId);
    if (!comment || !canModify(user, comment.authorId)) return;
    data.comments = data.comments.filter((c) => c.id !== commentId);
  });

  refresh();
}
