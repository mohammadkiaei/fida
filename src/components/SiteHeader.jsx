"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import Button from "@/components/Button";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/i18n/I18nProvider";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, loading } = useAuth();
  const { t, href } = useI18n();
  const panelHref = href(user?.role === "admin" ? "/admin" : "/panel");

  const links = [
    { to: href("/"), label: t("nav.home") },
    { to: href("/#what"), label: t("nav.what") },
    { to: href("/learn"), label: t("nav.learn") },
    { to: href("/receive-number"), label: t("nav.receive") },
    { to: href("/#contact"), label: t("nav.contact") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur print:hidden">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo className="text-deep" />
        <nav aria-label={t("nav.mainLabel")} className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link key={l.to} href={l.to} className="rounded-lg px-3 py-2 text-sm text-deep hover:bg-mist">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LocaleSwitcher className="text-deep" />
          {!loading && (
            <Button href={user ? panelHref : href("/login")} className="hidden sm:inline-flex">
              {user ? t("nav.panel") : t("nav.login")}
            </Button>
          )}
          <button
            className="rounded-lg p-2 text-deep hover:bg-mist lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? t("nav.menuClose") : t("nav.menuOpen")}</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-menu" aria-label={t("nav.mobileLabel")} className="border-t border-line bg-white lg:hidden">
          <div className="container-page flex flex-col py-3">
            {links.map((l) => (
              <Link key={l.to} href={l.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-deep hover:bg-mist">
                {l.label}
              </Link>
            ))}
            {!loading && (
              <Button href={user ? panelHref : href("/login")} className="mt-2" onClick={() => setOpen(false)}>
                {user ? t("nav.panel") : t("nav.login")}
              </Button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
