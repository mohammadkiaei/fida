"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

/** Same page, other language. Remembers the choice in a cookie for the next visit. */
export default function LocaleSwitcher({ className }) {
  const { locale, t } = useI18n();
  const pathname = usePathname() || `/${locale}`;
  const other = locale === "fa" ? "en" : "fa";
  const target = pathname.replace(/^\/(fa|en)(?=\/|$)/, `/${other}`);

  return (
    <Link
      href={target}
      hrefLang={other}
      lang={other}
      onClick={() => {
        document.cookie = `NEXT_LOCALE=${other}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
      }}
      className={cn("rounded-lg border border-current/20 px-3 py-1.5 text-sm font-medium hover:bg-mist/60", className)}
      aria-label={t("nav.switchTo")}
    >
      {t("nav.otherLanguage")}
    </Link>
  );
}
