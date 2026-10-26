"use client";

import Link from "next/link";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import { useI18n } from "@/i18n/I18nProvider";

export default function AdminHome() {
  const { t, n, href } = useI18n();
  const { data, loading, error } = useAsync(() => api.admin.stats(), []);
  const cards = [
    { key: "pending", to: "/admin/requests?status=pending", tone: "text-[#7a4b00]" },
    { key: "approved", to: "/admin/requests?status=approved", tone: "text-emerald-700" },
    { key: "rejected", to: "/admin/requests?status=rejected", tone: "text-red-700" },
    { key: "users", to: "/admin/users", tone: "text-deep" },
  ];
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-deep">{t("admin.home.title")}</h1>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link key={c.key} href={href(c.to)} className="rounded-2xl bg-white p-6 ring-1 ring-line transition-shadow hover:shadow-md">
            <p className="text-sm text-muted">{t(`admin.home.${c.key}`)}</p>
            <p className={`mt-2 text-4xl font-bold ${c.tone}`}>{loading ? "…" : n(data?.[c.key] ?? 0)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
