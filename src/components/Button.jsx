import Link from "next/link";
import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary: "bg-brand text-white hover:bg-brand-dark",
  signal: "bg-signal text-ink hover:bg-signal-dark",
  secondary: "bg-mist text-deep hover:bg-line",
  outline: "border border-line text-deep hover:bg-mist",
  ghost: "text-deep hover:bg-mist",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

export function Spinner({ className }) {
  return (
    <svg className={cn("h-4 w-4 animate-spin", className)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function Button({ href, variant = "primary", loading = false, className, children, ...props }) {
  const cls = cn(base, variants[variant], className);
  if (href) {
    return (
      <Link href={href} className={cls} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} disabled={loading || props.disabled} {...props}>
      {loading && <Spinner />}
      {children}
    </button>
  );
}
