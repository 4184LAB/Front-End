import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { login } from "@/actions/auth";
import ActionForm from "@/components/ActionForm";
import { Field, Loading } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "로그인" };

export default function LoginPage(props: PageProps<"/login">) {
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-bold tracking-tight">로그인</h1>
      <p className="mt-2 text-sm text-muted">
        계정이 없으신가요?{" "}
        <Link href="/signup" className="text-accent hover:underline">
          회원가입
        </Link>
      </p>
      <div className="mt-8">
        <Suspense fallback={<Loading />}>
          <LoginForm searchParams={props.searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function LoginForm({
  searchParams,
}: {
  searchParams: PageProps<"/login">["searchParams"];
}) {
  if (await getCurrentUser()) redirect("/mypage");
  const { next } = await searchParams;

  return (
    <ActionForm action={login} submitLabel="로그인">
      <input type="hidden" name="next" value={typeof next === "string" ? next : ""} />
      <Field label="이메일">
        <input name="email" type="email" required autoComplete="email" className="input" />
      </Field>
      <Field label="비밀번호">
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="input"
        />
      </Field>
    </ActionForm>
  );
}
