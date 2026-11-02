"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import Button from "@/components/Button";
import Field from "@/components/Field";
import OtpInput from "@/components/OtpInput";
import TermsGate from "@/components/TermsGate";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { api, MOCK_OTP, USE_MOCK } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/i18n/I18nProvider";
import { isMobile, toEn } from "@/lib/utils";

const TERMS_KEY = "fida_terms_v1";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading, signIn } = useAuth();
  const { t, n, href, ltrInput, errorText } = useI18n();

  const [termsAt, setTermsAt] = useState(undefined); // undefined = not read yet, null = not accepted
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [method, setMethod] = useState("phone");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setTermsAt(sessionStorage.getItem(TERMS_KEY));
  }, []);

  const goHome = useCallback(
    (u) => {
      const next = params.get("next");
      const safe = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
      router.replace(safe || href(u.role === "admin" ? "/admin" : "/panel"));
    },
    [params, router, href]
  );

  useEffect(() => {
    if (!loading && user) goHome(user);
  }, [loading, user, goHome]);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const acceptTerms = (iso) => {
    sessionStorage.setItem(TERMS_KEY, iso);
    setTermsAt(iso);
  };

  const sendCode = async (e) => {
    e?.preventDefault();
    if (!isMobile(phone)) {
      setError(t("login.phoneInvalid"));
      return;
    }
    setError("");
    setBusy(true);
    try {
      const res = await api.sendOtp(toEn(phone).trim());
      setSeconds(res.expiresIn || 120);
      setCode("");
      setStep("code");
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  const passwordLogin = async (e) => {
    e.preventDefault(); setError(""); setBusy(true);
    try { const res = await api.loginPassword(toEn(phone).trim(), password); signIn(res); goHome(res.user); }
    catch (err) { setError(errorText(err)); setBusy(false); }
  };

  const verify = async (value) => {
    setError("");
    setBusy(true);
    try {
      const res = await api.verifyOtp(toEn(phone).trim(), value, { termsAcceptedAt: termsAt });
      signIn(res);
      goHome(res.user);
    } catch (err) {
      setError(errorText(err));
      setCode("");
      setBusy(false);
    }
  };

  if (termsAt === undefined) return null;
  if (!termsAt) return <TermsGate onAccept={acceptTerms} />;

  return (
    <div className="w-full max-w-md rounded-2xl border border-line bg-white p-8 shadow-sm">
      {step === "phone" && method === "password" ? (
        <form onSubmit={passwordLogin} className="space-y-6">
          <div><h1 className="text-2xl font-bold text-deep">ورود با نام کاربری</h1><p className="mt-2 text-sm leading-7 text-muted">با شماره موبایل یا نام کاربری و گذرواژه وارد شوید.</p></div>
          <Field id="identifier" label="شماره موبایل یا نام کاربری" value={phone} onChange={(e) => setPhone(e.target.value)} error={error} />
          <Field id="password" type="password" label="گذرواژه" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" loading={busy} className="w-full">ورود</Button>
          <button type="button" className="text-sm text-brand" onClick={() => setMethod("phone")}>ورود با شماره موبایل و کد یکبارمصرف</button>
        </form>
      ) : step === "phone" ? (
        <form onSubmit={sendCode} noValidate className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-deep">{t("login.title")}</h1>
            <p className="mt-2 text-sm leading-7 text-muted">{t("login.text")}</p>
          </div>
          <Field
            id="phone"
            label={t("login.phone")}
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="09123456789"
            maxLength={11}
            value={phone}
            onChange={(e) => setPhone(toEn(e.target.value))}
            error={error}
            hint={t("login.simHint")}
            {...ltrInput}
          />
          <Button type="submit" loading={busy} className="w-full">{t("login.getCode")}</Button>
          <button type="button" className="w-full text-sm text-brand" onClick={() => { setMethod("password"); setError(""); }}>ورود با نام کاربری و گذرواژه</button>
          {USE_MOCK && <p className="rounded-lg bg-mist p-3 text-xs leading-6 text-deep">{t("login.demoPhone", { admin: n("09120000000") })}</p>}
        </form>
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-deep">{t("login.codeTitle")}</h1>
            <p className="mt-2 text-sm leading-7 text-muted">
              {t("login.codeText")} <bdi dir="ltr">{n(phone)}</bdi>.{" "}
              <button className="font-medium text-brand hover:underline" onClick={() => { setStep("phone"); setError(""); }}>
                {t("login.editPhone")}
              </button>
            </p>
          </div>
          <OtpInput value={code} onChange={setCode} onComplete={verify} disabled={busy} />
          <p role="alert" className="min-h-5 text-center text-sm text-red-600">{error}</p>
          <div className="text-center text-sm text-muted">
            {seconds > 0 ? (
              <span>{t("login.resendIn", { time: n(`${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`) })}</span>
            ) : (
              <button onClick={sendCode} disabled={busy} className="font-medium text-brand hover:underline">{t("login.resend")}</button>
            )}
          </div>
          {USE_MOCK && <p className="rounded-lg bg-mist p-3 text-center text-xs text-deep">{t("login.demoCode", { code: n(MOCK_OTP) })}</p>}
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  const { t, href } = useI18n();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-mist/60 px-4 py-10">
      <div className="flex w-full max-w-md items-center justify-between">
        <Logo className="text-deep" />
        <LocaleSwitcher className="text-deep" />
      </div>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
      <Link href={href("/")} className="text-sm text-muted hover:text-brand">{t("common.backHome")}</Link>
    </main>
  );
}
