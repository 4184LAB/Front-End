"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import type { FormAction } from "@/lib/form-state";

type Props = {
  action: FormAction;
  submitLabel: string;
  pendingLabel?: string;
  variant?: "primary" | "danger";
  // 성공했을 때 입력값을 비웁니다 (예: 댓글 작성).
  resetOnSuccess?: boolean;
  className?: string;
  children: React.ReactNode;
};

export default function ActionForm({
  action,
  submitLabel,
  pendingLabel = "처리 중…",
  variant = "primary",
  resetOnSuccess = false,
  className = "space-y-4",
  children,
}: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok && resetOnSuccess) formRef.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <form
      ref={formRef}
      action={formAction}
      // 기본 동작(제출 후 폼 초기화)을 막아 오류가 나도 입력한 내용이 남도록 합니다.
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(() => formAction(formData));
      }}
      className={className}
    >
      {children}
      {state?.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
      {state?.message && <p className="text-sm text-success">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className={variant === "danger" ? "btn btn-danger" : "btn btn-primary"}
      >
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
