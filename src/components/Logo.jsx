"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";

/** Wordmark: the four corner brackets are the viewfinder of the video check. */
export function Mark({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-7 w-7", className)} fill="none" aria-hidden="true">
      <path d="M3 11V5a2 2 0 0 1 2-2h6M21 3h6a2 2 0 0 1 2 2v6M29 21v6a2 2 0 0 1-2 2h-6M11 29H5a2 2 0 0 1-2-2v-6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="16" cy="16" r="4.5" fill="#F2A93B" />
    </svg>
  );
}

export default function Logo({ className }) {
  const { t, href } = useI18n();
  return (
    <Link href={href("/")} className={cn("inline-flex items-center gap-2 text-xl font-bold", className)} aria-label={t("nav.logoLabel")}>
      <Mark />
      <span>{t("common.siteName")}</span>
    </Link>
  );
}
