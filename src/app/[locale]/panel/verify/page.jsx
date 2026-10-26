"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/Button";
import DocUpload from "@/components/DocUpload";
import Field from "@/components/Field";
import RegistrationTimer from "@/components/RegistrationTimer";
import SelfieCapture from "@/components/SelfieCapture";
import StatusBadge from "@/components/StatusBadge";
import VideoRecorder from "@/components/VideoRecorder";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { DOC_TYPES, GENDERS, LIMITS } from "@/lib/constants";
import { useAsync } from "@/lib/hooks";
import { useI18n } from "@/i18n/I18nProvider";
import { cn, isPlainAddress, isProfileComplete, toEn } from "@/lib/utils";

const STEPS = ["documents", "details", "selfie", "video"];
const FIELDS = ["docType", "docNumber", "docIssueDate", "docExpiryDate", "firstName", "lastName", "fatherName", "birthDate", "gender", "nationality", "address"];
const DRAFT_KEY = "fida_draft_v1";
const today = () => new Date().toISOString().slice(0, 10);
const initialForm = (u) => Object.fromEntries(FIELDS.map((k) => [k, u?.[k] || ""]));

export default function VerifyPage() {
  const { user, setUser, refresh } = useAuth();
  const toast = useToast();
  const { t, n, href, locale, dateTime, ltrInput, errorText } = useI18n();
  const { data: v, loading, error, reload } = useAsync(() => api.getMyVerification(), []);

  const [step, setStep] = useState(() => (isProfileComplete(user) ? "selfie" : "documents"));
  const [form, setForm] = useState(() => initialForm(user));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [selfie, setSelfie] = useState(null);
  const [challenge, setChallenge] = useState(null);
  const [challengeError, setChallengeError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tracking, setTracking] = useState("");

  // Keep the typed (not yet saved) answers if the page is reloaded.
  useEffect(() => {
    try {
      const d = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "null");
      if (d) setForm((f) => ({ ...f, ...d }));
    } catch {}
  }, []);
  useEffect(() => {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    if (step !== "video" || challenge) return;
    api.getChallenge(locale).then(setChallenge).catch((e) => setChallengeError(errorText(e)));
  }, [step, challenge, locale, errorText]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const complete = isProfileComplete(user);
  const locked = complete && user.editsLeft === 0;
  const stepIndex = STEPS.indexOf(step);
  const req = t("profile.err.required");

  const validateDocs = () => {
    const e = {};
    ["docType", "docNumber", "docIssueDate", "docExpiryDate"].forEach((k) => !String(form[k]).trim() && (e[k] = req));
    if (form.docNumber && !/^[A-Za-z0-9]{5,20}$/.test(toEn(form.docNumber).trim())) e.docNumber = t("profile.err.docNumber");
    if (form.docIssueDate && form.docIssueDate > today()) e.docIssueDate = t("profile.err.future");
    if (form.docExpiryDate && form.docIssueDate && form.docExpiryDate <= form.docIssueDate) e.docExpiryDate = t("profile.err.expiry");
    if (!user.documents?.[0]) e.documents = t("profile.err.document");
    return e;
  };
  const validateDetails = () => {
    const e = {};
    if (form.firstName.trim().length < 2) e.firstName = req;
    if (form.lastName.trim().length < 2) e.lastName = req;
    ["birthDate", "gender", "nationality", "address"].forEach((k) => !String(form[k]).trim() && (e[k] = req));
    if (form.birthDate && form.birthDate >= today()) e.birthDate = t("profile.err.future");
    if (form.address && !isPlainAddress(form.address)) e.address = t("profile.err.address");
    else if (form.address && form.address.trim().length < 10) e.address = t("profile.err.addressShort");
    return e;
  };

  const focusFirstError = () => setTimeout(() => document.querySelector('[aria-invalid="true"]')?.focus(), 0);

  const nextFromDocs = () => {
    const e = validateDocs();
    setErrors(e);
    if (Object.keys(e).length) return focusFirstError();
    setStep("details");
  };

  const saveDetails = async () => {
    const e = { ...validateDetails(), ...validateDocs() };
    setErrors(e);
    if (Object.keys(e).length) {
      if (e.docType || e.docNumber || e.docIssueDate || e.docExpiryDate || e.documents) setStep("documents");
      return focusFirstError();
    }
    const changed = FIELDS.some((k) => String(user[k] || "") !== String(form[k] || "").trim());
    if (!locked && (changed || !complete)) {
      setSaving(true);
      try {
        setUser(await api.updateMe({ ...form, docNumber: toEn(form.docNumber) }));
        sessionStorage.removeItem(DRAFT_KEY);
        toast(t("profile.saved"));
      } catch (err) {
        toast(errorText(err), "error");
        setSaving(false);
        return;
      }
      setSaving(false);
    }
    setStep("selfie");
  };

  const submit = async (video) => {
    setSubmitting(true);
    setProgress(0);
    try {
      const res = await api.submitVerification({ challengeId: challenge.id, video, selfie }, setProgress);
      setTracking(res.trackingCode || "");
      setStep("done");
      setSelfie(null);
      setChallenge(null);
      await reload();
      refresh();
    } catch (e) {
      toast(errorText(e), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const status = v?.status || "not_started";
  const wizard = (status === "not_started" || status === "rejected") && step !== "done";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-deep">{t("verify.title")}</h1>
        {!loading && <StatusBadge status={status} />}
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      {step === "done" && (
        <div className="rounded-2xl bg-emerald-50 p-6 text-emerald-900 ring-1 ring-emerald-200">
          <p className="font-bold">{t("verify.sent")}</p>
          {tracking && <p className="mt-2">{t("panel.home.tracking")}: <bdi dir="ltr" className="font-bold">{n(tracking)}</bdi></p>}
          <p className="mt-2 text-sm leading-7">{t("verify.sentText")}</p>
        </div>
      )}
      {step !== "done" && status === "pending" && (
        <div className="rounded-2xl bg-white p-6 ring-1 ring-line">
          <p className="leading-8">{t("verify.pending", { date: dateTime(v.submittedAt) })}</p>
          {v.trackingCode && <p className="mt-2 text-sm">{t("panel.home.tracking")}: <bdi dir="ltr" className="font-bold">{n(v.trackingCode)}</bdi></p>}
          <p className="mt-2 text-sm leading-7 text-muted">{t("verify.noNewRequest")}</p>
        </div>
      )}
      {step !== "done" && status === "approved" && (
        <div className="rounded-2xl bg-emerald-50 p-6 text-emerald-900 ring-1 ring-emerald-200">
          <p className="leading-8">{t("verify.approved")}</p>
          <Button href={href("/receive-number")} variant="secondary" className="mt-4">{t("panel.home.getSheet")}</Button>
        </div>
      )}
      {step !== "done" && status === "rejected" && (
        <div className="rounded-2xl bg-red-50 p-6 text-red-900 ring-1 ring-red-200">
          <p className="font-bold">{t("verify.rejected")}</p>
          {v.rejectionReason && <p className="mt-2 leading-8">{v.rejectionReason}</p>}
          <p className="mt-2 text-sm leading-7">{t("verify.rejectedHelp")}</p>
        </div>
      )}

      {wizard && (
        <>
          <RegistrationTimer />

          <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label={t("verify.stepsLabel")}>
            {STEPS.map((k, i) => {
              const state = i < stepIndex ? "done" : i === stepIndex ? "current" : "todo";
              const content = (
                <>
                  <span className={cn("me-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold", state === "todo" ? "bg-line text-deep" : "bg-brand text-white")}>
                    {state === "done" ? "✓" : n(i + 1)}
                  </span>
                  {t(`verify.step.${k}`)}
                </>
              );
              return (
                <li key={k} aria-current={state === "current" ? "step" : undefined}>
                  {state === "done" ? (
                    <button type="button" onClick={() => setStep(k)} className="w-full rounded-lg border border-line bg-white px-3 py-2 text-start text-sm hover:border-brand">{content}</button>
                  ) : (
                    <div className={cn("rounded-lg border px-3 py-2 text-sm", state === "current" ? "border-brand bg-mist font-medium text-deep" : "border-line text-muted opacity-70")}>{content}</div>
                  )}
                </li>
              );
            })}
          </ol>

          {(step === "documents" || step === "details") && complete && (
            <p className={cn("rounded-xl p-4 text-sm leading-7", locked ? "bg-red-50 text-red-900" : "bg-mist text-deep")}>
              {locked ? t("profile.editLocked") : t("profile.editsLeft", { left: n(user.editsLeft), max: n(LIMITS.maxEdits) })}
            </p>
          )}

          {step === "documents" && (
            <section className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-line" aria-labelledby="s-doc">
              <div>
                <h2 id="s-doc" className="text-lg font-bold text-deep">{t("profile.docSection")}</h2>
                <p className="mt-1 text-sm leading-7 text-muted">{t("verify.docsIntro")}</p>
              </div>
              <fieldset disabled={locked} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="docType" as="select" required label={t("profile.docType")} value={form.docType} onChange={set("docType")} error={errors.docType} className="sm:col-span-2">
                    <option value="">{t("profile.choose")}</option>
                    {DOC_TYPES.map((d) => (
                      <option key={d} value={d}>{t(`docTypes.${d}`)}</option>
                    ))}
                  </Field>
                  <Field id="docNumber" required label={t("profile.docNumber")} value={form.docNumber} onChange={set("docNumber")} error={errors.docNumber} autoComplete="off" maxLength={20} {...ltrInput} />
                  <div className="hidden sm:block" aria-hidden="true" />
                  <Field id="docIssueDate" type="date" required label={t("profile.docIssue")} max={today()} value={form.docIssueDate} onChange={set("docIssueDate")} error={errors.docIssueDate} hint={t("profile.docIssueHint")} />
                  <Field id="docExpiryDate" type="date" required label={t("profile.docExpiry")} value={form.docExpiryDate} onChange={set("docExpiryDate")} error={errors.docExpiryDate} />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <DocUpload slot={0} required label={t("profile.doc1")} hint={t("profile.doc1Hint")} disabled={locked} />
                  <DocUpload slot={1} label={t("profile.doc2")} hint={t("profile.doc2Hint")} disabled={locked} />
                </div>
                {errors.documents && <p role="alert" className="text-xs text-red-600">{errors.documents}</p>}
              </fieldset>
              <p className="text-xs leading-6 text-muted">
                {t("profile.docRules")} <Link href={href("/learn/valid-documents")} className="text-brand hover:underline">{t("profile.docRulesLink")}</Link>
              </p>
              <Button onClick={nextFromDocs}>{t("verify.next")}</Button>
            </section>
          )}

          {step === "details" && (
            <section className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-line" aria-labelledby="s-det">
              <div>
                <h2 id="s-det" className="text-lg font-bold text-deep">{t("profile.personSection")}</h2>
                <p className="mt-1 text-sm leading-7 text-muted">{t("verify.detailsIntro")}</p>
              </div>
              <fieldset disabled={locked} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="firstName" required label={t("profile.firstName")} value={form.firstName} onChange={set("firstName")} error={errors.firstName} autoComplete="given-name" />
                  <Field id="lastName" required label={t("profile.lastName")} value={form.lastName} onChange={set("lastName")} error={errors.lastName} autoComplete="family-name" />
                  <p className="-mt-2 text-xs leading-6 text-muted sm:col-span-2">{t("profile.nameHint")}</p>
                  <Field id="fatherName" label={t("profile.fatherName")} value={form.fatherName} onChange={set("fatherName")} />
                  <Field id="birthDate" type="date" required label={t("profile.birthDate")} max={today()} value={form.birthDate} onChange={set("birthDate")} error={errors.birthDate} />
                  <Field id="gender" as="select" required label={t("profile.gender")} value={form.gender} onChange={set("gender")} error={errors.gender}>
                    <option value="">{t("profile.choose")}</option>
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>{t(`gender.${g}`)}</option>
                    ))}
                  </Field>
                  <div>
                    <Field id="nationality" required label={t("profile.nationality")} list="nationalities" value={form.nationality} onChange={set("nationality")} error={errors.nationality} />
                    <datalist id="nationalities">
                      {t("profile.nationalities").map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                </div>
                <Field id="address" as="textarea" rows={3} required label={t("profile.address")} value={form.address} onChange={set("address")} error={errors.address} hint={t("profile.addressHint")} />
              </fieldset>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => setStep("documents")}>{t("verify.back")}</Button>
                <Button onClick={saveDetails} loading={saving}>{t("verify.saveContinue")}</Button>
              </div>
            </section>
          )}

          {step === "selfie" && (
            <section className="rounded-2xl bg-white p-6 ring-1 ring-line" aria-labelledby="s-selfie">
              <h2 id="s-selfie" className="font-bold text-deep">{t("verify.beforeTitle")}</h2>
              <ul className="mt-3 list-disc space-y-1 ps-6 leading-8 marker:text-brand">
                {t("verify.checklist").map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <p className="my-5 text-sm leading-7 text-muted">{t("verify.selfieText")}</p>
              <SelfieCapture
                onConfirm={(blob) => {
                  setSelfie(blob);
                  setStep("video");
                }}
              />
              <button className="mt-5 text-sm text-muted hover:text-brand" onClick={() => setStep("details")}>{t("verify.back")}</button>
            </section>
          )}

          {step === "video" && (
            <section className="rounded-2xl bg-white p-6 ring-1 ring-line">
              {challengeError && <p role="alert" className="text-red-600">{challengeError}</p>}
              {!challenge && !challengeError && <p className="text-muted">{t("verify.gettingSentence")}</p>}
              {challenge && <VideoRecorder sentence={challenge.sentence} onSubmit={submit} submitting={submitting} progress={progress} />}
              <button className="mt-5 text-sm text-muted hover:text-brand" onClick={() => setStep("selfie")} disabled={submitting}>
                {t("verify.backToSelfie")}
              </button>
            </section>
          )}
        </>
      )}
    </div>
  );
}
