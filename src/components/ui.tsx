import Link from "next/link";

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-10">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {description && <p className="mt-2 text-muted">{description}</p>}
    </div>
  );
}

export function Card({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-line p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-4">
          {title && <h2 className="font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function Loading({ label = "불러오는 중…" }: { label?: string }) {
  return <p className="animate-pulse py-8 text-center text-sm text-muted">{label}</p>;
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-10 text-center text-sm text-muted">{children}</p>;
}

export function Notice({
  title,
  children,
  href,
  linkLabel,
}: {
  title: string;
  children?: React.ReactNode;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-line px-6 py-12 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children && <p className="mt-2 text-sm text-muted">{children}</p>}
      {href && (
        <Link href={href} className="btn btn-primary mt-6">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

export function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "accent";
}) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs ${
        tone === "accent" ? "bg-accent/15 text-accent" : "bg-surface text-muted"
      }`}
    >
      {children}
    </span>
  );
}
