"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/i18n/I18nProvider";
import { Spinner } from "@/components/Button";

/** Client-side guard. `role` is "user" or "admin"; admins are sent to /admin, users to /panel. */
export default function AuthGuard({ role, children }) {
  const { user, loading } = useAuth();
  const { href, t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace(`${href("/login")}?next=${encodeURIComponent(pathname)}`);
    else if (user.role !== role) router.replace(href(user.role === "admin" ? "/admin" : "/panel"));
  }, [loading, user, role, router, pathname, href]);

  if (loading || !user || user.role !== role) {
    return (
      <div className="flex min-h-screen items-center justify-center text-brand">
        <Spinner className="h-8 w-8" />
        <span className="sr-only">{t("common.loading")}</span>
      </div>
    );
  }
  return children;
}
