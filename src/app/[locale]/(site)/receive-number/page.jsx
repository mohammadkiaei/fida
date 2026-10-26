"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";
import Field from "@/components/Field";
import OtpInput from "@/components/OtpInput";
import { Mark } from "@/components/Logo";
import { api, MOCK_OTP, MOCK_SAMPLE, USE_MOCK } from "@/lib/api";
import { useI18n } from "@/i18n/I18nProvider";
import { cn, isMobile, toEn } from "@/lib/utils";

export default function ReceiveNumberPage() {
  const { t, n, ltrInput, errorText, date } = useI18n();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [ticket, setTicket] = useState("");
  const [number, setNumber] = useState("");
  const [card, setCard] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    document.title = `${t("receive.title")} | ${t("common.siteName")}`;
  }, [t]);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const run = async (fn) => {
    setError("");
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  const sendCode = (e) => {
    e?.preventDefault();
    if (!isMobile(phone)) return setError(t("login.phoneInvalid"));
    run(async () => {
      const res = await api.receive.sendOtp(toEn(phone).trim());
      setSeconds(res.expiresIn || 120);
      setCode("");
      setStep(2);
    });
  };

  const verify = (value) =>
    run(async () => {
      const res = await api.receive.verifyOtp(toEn(phone).trim(), value);
      setTicket(res.ticket);
      setStep(3);
    }).then(() => setCode(""));

  const lookup = (e) => {
    e.preventDefault();
    const num = toEn(number).replace(/\s/g, "");
    if (!/^\d{8,16}$/.test(num)) return setError(t("receive.numberInvalid"));
    run(async () => {
      setCard(await api.receive.getCard(ticket, num));
      setStep(4);
    });
  };

  const restart = () => {
    setStep(1); setPhone(""); setCode(""); setNumber(""); setCard(null); setTicket(""); setError("");
  };

  const steps = t("receive.steps");

  return (
    <div className="container-page max-w-3xl py-14">
      <div className="print:hidden">
        <h1 className="text-4xl font-bold text-deep">{t("receive.title")}</h1>
        <p className="mt-4 leading-9 text-muted">{t("receive.intro")}</p>

        <ol className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label={t("receive.stepsLabel")}>
          {steps.map((s, i) => {
            const state = i + 1 < step ? "done" : i + 1 === step ? "current" : "todo";
            return (
              <li key={s} aria-current={state === "current" ? "step" : undefined} className={cn("rounded-xl border p-3 text-sm", state === "current" ? "border-brand bg-mist" : "border-line", state === "todo" && "opacity-60")}>
                <span className={cn("mb-2 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold", state === "todo" ? "bg-line text-deep" : "bg-brand text-white")}>
                  {state === "done" ? "✓" : n(i + 1)}
                </span>
                <span className="leading-6">{s}</span>
              </li>
            );
          })}
        </ol>
      </div>

      {step < 4 && (
        <div className="mt-8 rounded-2xl border border-line p-6 sm:p-8">
          {step === 1 && (
            <form onSubmit={sendCode} noValidate className="space-y-5">
              <Field id="r-phone" label={steps[0]} type="tel" inputMode="numeric" autoComplete="tel" placeholder="09123456789" maxLength={11} value={phone} onChange={(e) => setPhone(toEn(e.target.value))} error={error} {...ltrInput} />
              <Button type="submit" loading={busy}>{t("login.getCode")}</Button>
            </form>
          )}
          {step === 2 && (
            <div className="space-y-5">
              <p className="text-sm leading-7 text-muted">{t("login.codeText")} <bdi dir="ltr">{n(phone)}</bdi></p>
              <OtpInput value={code} onChange={setCode} onComplete={verify} disabled={busy} />
              <p role="alert" className="min-h-5 text-center text-sm text-red-600">{error}</p>
              <div className="text-center text-sm text-muted">
                {seconds > 0 ? (
                  <span>{t("login.resendIn", { time: n(`${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`) })}</span>
                ) : (
                  <button onClick={sendCode} disabled={busy} className="font-medium text-brand hover:underline">{t("login.resend")}</button>
                )}
              </div>
            </div>
          )}
          {step === 3 && (
            <form onSubmit={lookup} noValidate className="space-y-5">
              <Field id="r-number" label={steps[2]} inputMode="numeric" autoComplete="off" value={number} onChange={(e) => setNumber(toEn(e.target.value))} error={error} hint={t("receive.numberHint")} {...ltrInput} />
              <Button type="submit" loading={busy}>{t("receive.show")}</Button>
            </form>
          )}
          {USE_MOCK && (
            <p className="mt-6 rounded-lg bg-mist p-3 text-xs leading-6 text-deep">
              {t("receive.demo", { phone: n(MOCK_SAMPLE.phone), code: n(MOCK_OTP), number: n(MOCK_SAMPLE.number) })}
            </p>
          )}
        </div>
      )}

      {step === 4 && card && (
        <div className="mt-8">
          <article id="print-card" aria-label={t("receive.cardTitle")} className="rounded-2xl border-2 border-deep bg-white p-6 shadow-sm print:border-black print:shadow-none sm:p-8">
            <header className="flex items-center justify-between border-b border-line pb-4 text-deep">
              <span className="flex items-center gap-2 text-xl font-bold"><Mark /> {t("common.siteName")}</span>
              <span className="text-sm font-medium">{t("receive.cardTitle")}</span>
            </header>
            <p className="mt-6 text-sm text-muted">{t("receive.cardNumber")}</p>
            <p dir="ltr" className="mt-1 text-start text-3xl font-bold tracking-widest text-ink sm:text-4xl">{n(card.specialNumber)}</p>
            <dl className="mt-8 grid gap-5 text-sm sm:grid-cols-2">
              {[
                [t("receive.cardName"), card.fullName],
                [t("receive.cardNationality"), card.nationality],
                [t("receive.cardDoc"), `${t(`docTypes.${card.docType}`)} — ${card.docNumber}`],
                [t("receive.cardDate"), date(card.issuedAt)],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-muted">{k}</dt>
                  <dd className="mt-0.5 font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-8 border-t border-line pt-4 text-xs leading-6 text-muted">{t("receive.cardNote")}</p>
          </article>
          <div className="mt-6 flex flex-wrap gap-3 print:hidden">
            <Button onClick={() => window.print()}>{t("receive.print")}</Button>
            <Button variant="outline" onClick={restart}>{t("receive.again")}</Button>
          </div>
        </div>
      )}
    </div>
  );
}
