"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Button from "@/components/Button";
import Field from "@/components/Field";
import StatusBadge from "@/components/StatusBadge";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import { useI18n } from "@/i18n/I18nProvider";

export default function RequestDetail() {
  const { id } = useParams();
  const toast = useToast();
  const { t, n, href, dateTime, fullName, errorText } = useI18n();
  const { data: r, loading, error, reload } = useAsync(() => api.admin.getVerification(id), [id]);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [busy, setBusy] = useState("");

  const decide = async (decision) => {
    if (decision === "reject" && reason.trim().length < 5) {
      setReasonError(t("admin.detail.reasonRequired"));
      return;
    }
    setReasonError("");
    setBusy(decision);
    try {
      await api.admin.decide(id, decision, reason.trim());
      toast(decision === "approve" ? t("admin.detail.approvedToast") : t("admin.detail.rejectedToast"));
      await reload();
    } catch (e) {
      toast(errorText(e), "error");
    } finally {
      setBusy("");
    }
  };

  if (loading) return <p className="text-muted">{t("common.loading")}</p>;
  if (error) return <p role="alert" className="text-red-600">{error}</p>;

  const u = r.user;
  const rows = [
    [t("profile.firstName"), u.firstName],
    [t("profile.lastName"), u.lastName],
    [t("profile.fatherName"), u.fatherName || "—"],
    [t("profile.gender"), u.gender ? t(`gender.${u.gender}`) : "—"],
    [t("profile.nationality"), u.nationality],
    [t("profile.birthDate"), <bdi key="b" dir="ltr">{n(u.birthDate)}</bdi>],
    [t("profile.docType"), u.docType ? t(`docTypes.${u.docType}`) : "—"],
    [t("profile.docNumber"), <bdi key="d" dir="ltr">{u.docNumber}</bdi>],
    [t("profile.docIssue"), <bdi key="i" dir="ltr">{n(u.docIssueDate)}</bdi>],
    [t("profile.docExpiry"), <bdi key="e" dir="ltr">{u.docExpiryDate ? n(u.docExpiryDate) : "—"}</bdi>],
    [t("profile.phone"), <bdi key="p" dir="ltr">{n(u.phone)}</bdi>],
    [t("profile.address"), u.address],
    [t("panel.home.tracking"), <bdi key="t" dir="ltr">{n(r.trackingCode || "—")}</bdi>],
    [t("admin.col.submitted"), dateTime(r.submittedAt)],
  ];

  const noMedia = (
    <div className="flex aspect-[3/4] items-center justify-center rounded-xl bg-ink p-6 text-center text-sm leading-7 text-white/70">{t("admin.detail.noMedia")}</div>
  );

  return (
    <div className="space-y-6">
      <Link href={href("/admin/requests")} className="text-sm text-brand hover:underline">{t("admin.detail.back")}</Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-deep">{t("admin.detail.title")}</h1>
        <StatusBadge status={r.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-6 ring-1 ring-line" aria-labelledby="sf">
            <h2 id="sf" className="mb-4 font-bold text-deep">{t("admin.detail.selfie")}</h2>
            {r.selfieUrl ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={r.selfieUrl} alt={t("selfie.previewAlt")} className="aspect-[3/4] w-full rounded-xl object-cover" /> : noMedia}
          </section>
          <section className="rounded-2xl bg-white p-6 ring-1 ring-line" aria-labelledby="vid">
            <h2 id="vid" className="mb-4 font-bold text-deep">{t("admin.detail.video")}</h2>
            {r.videoUrl ? <video src={r.videoUrl} controls playsInline className="aspect-[3/4] w-full rounded-xl bg-ink object-cover" /> : noMedia}
            <p className="mt-4 text-sm text-muted">{t("admin.detail.sentence")}</p>
            <p className="mt-1 rounded-lg bg-mist p-3 leading-8">{r.sentence}</p>
          </section>
          <section className="rounded-2xl bg-white p-6 ring-1 ring-line" aria-labelledby="dc">
            <h2 id="dc" className="mb-4 font-bold text-deep">{t("admin.detail.documents")}</h2>
            <div className="grid grid-cols-2 gap-3">
              {[0, 1].map((s) =>
                u.documents?.[s] ? (
                  <figure key={s} className="space-y-2 text-xs text-muted">
                    {r.documentUrls?.[s] ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={r.documentUrls[s]} alt={u.documents[s].name} className="w-full rounded-lg ring-1 ring-line" /> : <div className="flex aspect-[4/3] items-center justify-center rounded-lg bg-mist p-2 text-center">{t("admin.detail.noImage")}</div>}
                    <figcaption dir="ltr" className="truncate text-start">{u.documents[s].name}</figcaption>
                  </figure>
                ) : null
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-6 ring-1 ring-line" aria-labelledby="inf">
            <h2 id="inf" className="mb-4 font-bold text-deep">{t("admin.detail.applicant")}</h2>
            <dl className="space-y-3 text-sm">
              {rows.map(([k, v]) => (
                <div key={k} className="flex gap-4">
                  <dt className="w-32 shrink-0 text-muted">{k}</dt>
                  <dd className="min-w-0 break-words font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-2xl bg-white p-6 ring-1 ring-line" aria-labelledby="dec">
            <h2 id="dec" className="mb-4 font-bold text-deep">{t("admin.detail.decision")}</h2>
            {r.status === "pending" ? (
              <div className="space-y-4">
                <Field id="reason" as="textarea" rows={3} label={t("admin.detail.reason")} value={reason} onChange={(e) => setReason(e.target.value)} error={reasonError} />
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => decide("approve")} loading={busy === "approve"} disabled={!!busy}>{t("admin.detail.approve")}</Button>
                  <Button variant="danger" onClick={() => decide("reject")} loading={busy === "reject"} disabled={!!busy}>{t("admin.detail.reject")}</Button>
                </div>
              </div>
            ) : (
              <div className="text-sm leading-8">
                <p>{t(r.status === "approved" ? "admin.detail.decidedApproved" : "admin.detail.decidedRejected", { date: dateTime(r.decidedAt) })}</p>
                {r.rejectionReason && <p className="text-muted">{t("panel.home.reason")}: {r.rejectionReason}</p>}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
