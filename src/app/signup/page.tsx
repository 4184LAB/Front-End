import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { signup } from "@/actions/auth";
import ActionForm from "@/components/ActionForm";
import { Field, Loading } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "회원가입" };

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-bold tracking-tight">회원가입</h1>
      <p className="mt-2 text-sm text-muted">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-accent hover:underline">
          로그인
        </Link>
      </p>
      <div className="mt-8">
        <Suspense fallback={<Loading />}>
          <SignupForm />
        </Suspense>
      </div>
    </div>
  );
}

async function SignupForm() {
  if (await getCurrentUser()) redirect("/mypage");

  return (
    <ActionForm action={signup} submitLabel="가입하기">
      <Field label="아이디" hint="50자 이하">
        <input name="username" required maxLength={50} autoComplete="username" className="input" />
      </Field>
      <Field label="이름" hint="2~20자">
        <input
          name="name"
          required
          minLength={2}
          maxLength={20}
          autoComplete="nickname"
          className="input"
        />
      </Field>
      <Field label="비밀번호" hint="8자 이상">
        <input
          name="password"
          type="password"
          required
          minLength={8}
          maxLength={128}
          autoComplete="new-password"
          className="input"
        />
      </Field>
      <Field label="비밀번호 확인">
        <input
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="input"
        />
      </Field>
      <p className="text-xs text-muted">처음 가입한 회원은 자동으로 관리자 권한을 받습니다.</p>
    </ActionForm>
  );
}
