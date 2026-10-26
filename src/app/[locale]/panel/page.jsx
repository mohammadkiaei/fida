"use client";

import Button from "@/components/Button";
import StatusBadge from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useAsync } from "@/lib/hooks";
import { useI18n } from "@/i18n/I18nProvider";
import { isProfileComplete } from "@/lib/utils";

export default function PanelHome() {
  const { user } = useAuth();
  const { t, n, href, dateTime, fullName, errorText } = useI18n();
  const { data: v, loading, error } = useAsync(() => api.getMyVerification(), []);
  const profileDone = isProfileComplete(user);
  const status = v?.status || "not_started";

  let cta = null;
  if (!profileDone) cta = { to: "/panel/verify", label: t("panel.home.ctaProfile"), text: t("panel.home.ctaProfileText") };
  else if (status === "not_started") cta = { to: "/panel/verify", label: t("panel.home.ctaStart"), text: t("panel.home.ctaStartText") };
  else if (status === "rejected") cta = { to: "/panel/verify", label: t("panel.home.ctaRetry"), text: t("panel.home.ctaRetryText") };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-deep">{t("panel.home.hello", { name: fullName(user) })}</h1>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-line" aria-labelledby="st">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="st" className="font-bold text-deep">{t("panel.home.statusTitle")}</h2>
          {!loading && <StatusBadge status={status} />}
        </div>
        {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
        {v?.submittedAt && <p className="mt-3 text-sm text-muted">{t("panel.home.lastSubmit")}: {dateTime(v.submittedAt)}</p>}
        {v?.trackingCode && (
          <p className="mt-2 text-sm">
            {t("panel.home.tracking")}: <bdi dir="ltr" className="font-bold">{n(v.trackingCode)}</bdi>
          </p>
        )}
        {status === "pending" && <p className="mt-3 text-sm leading-7 text-muted">{t("panel.home.pendingText")}</p>}
        {status === "approved" && (
          <div className="mt-4 space-y-3 rounded-xl bg-emerald-50 p-4 text-emerald-900">
            <p className="text-sm">{t("panel.home.numberReady")}</p>
            <p dir="ltr" className="text-start text-2xl font-bold tracking-widest">{n(v?.specialNumber || user?.specialNumber || "")}</p>
            <p className="text-sm leading-7">{t("panel.home.simNote")}</p>
            <Button href={href("/receive-number")} variant="secondary">{t("panel.home.getSheet")}</Button>
          </div>
        )}
        {status === "rejected" && v?.rejectionReason && (
          <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm leading-7 text-red-800">{t("panel.home.reason")}: {v.rejectionReason}</p>
        )}
        {cta && (
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <Button href={href(cta.to)}>{cta.label}</Button>
            <p className="text-sm text-muted">{cta.text}</p>
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-line" aria-labelledby="cl">
        <h2 id="cl" className="mb-4 font-bold text-deep">{t("panel.home.stepsTitle")}</h2>
        <ul className="space-y-3 text-sm">
          {[
            [t("panel.home.s1"), true],
            [t("panel.home.s2"), profileDone],
            [t("panel.home.s3"), status !== "not_started"],
            [t("panel.home.s4"), status === "approved"],
          ].map(([label, done]) => (
            <li key={label} className="flex items-center gap-3">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${done ? "bg-brand text-white" : "border border-line text-transparent"}`} aria-hidden="true">✓</span>
              <span className={done ? "text-ink" : "text-muted"}>{label}</span>
              <span className="sr-only">{done ? t("panel.home.done") : t("panel.home.notDone")}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
