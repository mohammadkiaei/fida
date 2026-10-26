"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

/** nav: [{ path: "/panel", label: "…", exact?: true }] — paths are locale-less. */
export default function PanelShell({ nav, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { t, n, href, fullName } = useI18n();

  const isActive = (item) => (item.exact ? pathname === href(item.path) : pathname.startsWith(href(item.path)));
  const logout = () => {
    signOut();
    router.replace(href("/login"));
  };

  return (
    <div className="min-h-screen bg-mist/60 md:flex">
      <aside className="bg-ink text-white md:sticky md:top-0 md:flex md:h-screen md:w-64 md:flex-col md:justify-between">
        <div>
          <div className="flex items-center justify-between px-5 py-4 md:py-6">
            <Logo className="text-white" />
            <div className="flex items-center gap-2 md:hidden">
              <LocaleSwitcher className="text-white" />
              <button onClick={logout} className="rounded-md px-3 py-1 text-xs text-white/80 hover:bg-white/10">
                {t("panel.shell.logout")}
              </button>
            </div>
          </div>
          <nav aria-label={t("panel.shell.navLabel")} className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
            {nav.map((item) => (
              <Link
                key={item.path}
                href={href(item.path)}
                aria-current={isActive(item) ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap rounded-lg px-4 py-2.5 text-sm transition-colors",
                  isActive(item) ? "bg-brand text-white" : "text-white/75 hover:bg-white/10"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="hidden space-y-3 border-t border-white/10 p-5 md:block">
          <LocaleSwitcher className="w-full text-center text-white" />
          <div>
            <p className="text-sm font-medium">{fullName(user)}</p>
            <p className="text-xs text-white/60">
              <bdi dir="ltr">{n(user?.phone || "")}</bdi>
            </p>
          </div>
          <button onClick={logout} className="w-full rounded-lg border border-white/20 px-3 py-2 text-sm hover:bg-white/10">
            {t("panel.shell.logoutFull")}
          </button>
        </div>
      </aside>
      <main className="flex-1 px-5 py-8 md:px-10 md:py-10">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
