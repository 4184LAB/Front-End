"use client";

import { useFormStatus } from "react-dom";

// <form action={serverAction}> 안에서 사용하는 확인창 달린 제출 버튼입니다.
export default function ConfirmButton({
  message,
  className = "btn btn-danger btn-sm",
  children,
}: {
  message?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      onClick={(event) => {
        if (message && !window.confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
