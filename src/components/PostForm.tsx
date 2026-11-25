import ActionForm from "./ActionForm";
import { Field } from "./ui";
import type { FormAction } from "@/lib/form-state";

export default function PostForm({
  action,
  submitLabel,
  defaults,
}: {
  action: FormAction;
  submitLabel: string;
  defaults?: { title: string; content: string };
}) {
  return (
    <ActionForm action={action} submitLabel={submitLabel}>
      <Field label="제목">
        <input
          name="title"
          required
          maxLength={100}
          defaultValue={defaults?.title}
          className="input"
        />
      </Field>
      <Field label="내용">
        <textarea
          name="content"
          required
          maxLength={5000}
          rows={14}
          defaultValue={defaults?.content}
          className="input resize-y leading-relaxed"
        />
      </Field>
      <Field label="첨부파일 (선택)" hint="10MB 이하 파일 1개. 글 화면에서 더 추가할 수 있습니다.">
        <input name="file" type="file" className="input" />
      </Field>
    </ActionForm>
  );
}
