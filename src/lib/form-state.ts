export type FormState = { ok?: boolean; error?: string; message?: string } | undefined;

export type FormAction = (state: FormState, formData: FormData) => Promise<FormState>;

export function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}
