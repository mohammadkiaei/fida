import { cn } from "@/lib/utils";

export default function Field({ label, error, hint, id, className, required = false, as = "input", children, ...props }) {
  const Tag = as;
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm font-medium text-deep">
        {label}
        {required && (
          <span className="ms-1 text-red-600" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <Tag id={id} className="input" required={required} aria-invalid={error ? "true" : "false"} aria-describedby={describedBy} {...props}>
        {children}
      </Tag>
      {error ? (
        <p id={`${id}-err`} className="text-xs text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs leading-6 text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
