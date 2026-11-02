"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Button from "@/components/Button";
import { api } from "@/lib/api";
import { useI18n } from "@/i18n/I18nProvider";

function PaymentResult() {
  const params = useSearchParams();
  const { t, href, n, errorText } = useI18n();
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const paymentId = params.get("paymentId");
  useEffect(() => {
    if (!paymentId) { setError(t("payment.notFound")); return; }
    api.getPaymentResult(paymentId).then(setResult).catch((e) => setError(errorText(e)));
  }, [paymentId, errorText, t]);
  return <main className="mx-auto max-w-xl space-y-5 rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-line">
    <h1 className="text-2xl font-bold text-deep">{t("payment.title")}</h1>
    {!result && !error && <p className="text-muted">{t("payment.checking")}</p>}
    {error && <p role="alert" className="text-red-700">{error || t("payment.failed")}</p>}
    {result?.status === "paid" ? <><p className="text-lg font-bold text-emerald-700">{t("payment.success")}</p><p className="leading-7">{t("payment.successText")}</p>{result.trackingCode && <p>{t("payment.tracking")}: <bdi dir="ltr" className="font-bold">{n(result.trackingCode)}</bdi></p>}</> : result && <p className="text-amber-700">{t("payment.failed")}</p>}
    <Button href={href("/panel")} variant="secondary">{t("payment.back")}</Button>
  </main>;
}

export default function PaymentResultPage() {
  return <Suspense fallback={<p className="text-muted">در حال بررسی پرداخت…</p>}><PaymentResult /></Suspense>;
}
