"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

const FILTERS = ["", "pending", "approved", "rejected"];

function RequestsList() {
  const params = useSearchParams();
  const router = useRouter();
  const { t, n, href, dateTime, fullName } = useI18n();
  const status = params.get("status") || "";
  const { data, loading, error } = useAsync(() => api.admin.listVerifications(status), [status]);
  const heads = [t("admin.col.applicant"), t("admin.col.phone"), t("admin.col.nationality"), t("admin.col.submitted"), t("admin.col.status"), ""];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-deep">{t("admin.requests.title")}</h1>
      <div role="tablist" aria-label={t("admin.requests.filter")} className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f || "all"}
            role="tab"
            aria-selected={status === f}
            onClick={() => router.replace(f ? `${href("/admin/requests")}?status=${f}` : href("/admin/requests"))}
            className={cn("rounded-full px-4 py-1.5 text-sm transition-colors", status === f ? "bg-deep text-white" : "bg-white text-deep ring-1 ring-line hover:bg-mist")}
          >
            {f ? t(`status.${f}`) : t("admin.requests.all")}
          </button>
        ))}
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-line">
        <table className="w-full min-w-[40rem] text-sm">
          <thead className="bg-mist text-muted">
            <tr>
              {heads.map((h, i) => (
                <th key={i} scope="col" className="px-4 py-3 text-start font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted">{t("common.loading")}</td></tr>}
            {!loading && data?.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted">{t("admin.requests.empty")}</td></tr>}
            {data?.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 font-medium">{fullName(r.user)}</td>
                <td className="px-4 py-3"><bdi dir="ltr">{n(r.user?.phone || "")}</bdi></td>
                <td className="px-4 py-3">{r.user?.nationality || "—"}</td>
                <td className="px-4 py-3 text-muted">{dateTime(r.submittedAt)}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3 text-end">
                  <Link href={href(`/admin/requests/${r.id}`)} className="font-medium text-brand hover:underline">{t("admin.requests.review")}</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function RequestsPage() {
  return (
    <Suspense fallback={null}>
      <RequestsList />
    </Suspense>
  );
}
