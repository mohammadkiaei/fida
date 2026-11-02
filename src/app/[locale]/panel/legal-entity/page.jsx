"use client";
import { useCallback, useEffect, useState } from "react";
import Field from "@/components/Field";
import Button from "@/components/Button";
import { api } from "@/lib/api";
import { LIMITS } from "@/lib/constants";
import { compressImage } from "@/lib/media";
import { useI18n } from "@/i18n/I18nProvider";

const fields = [
  ["companyNameFa", "نام فارسی شرکت", true], ["companyNameLatin", "نام لاتین شرکت", true],
  ["registrationNumber", "شماره ثبت شرکت / شناسه ملی معادل", true], ["registrationDate", "تاریخ ثبت شرکت", true],
  ["registrationCountry", "کشور محل ثبت", true], ["activityType", "نوع فعالیت شرکت", true],
  ["fixedPhone", "تلفن ثابت شرکت", true], ["ownershipType", "نوع مالکیت", true],
  ["mobile", "تلفن همراه", true], ["website", "آدرس سایت", false],
  ["managers", "نام و نام خانوادگی اعضای هیئت‌مدیره", true], ["managerIdentity", "مشخصات هویتی اعضای هیئت‌مدیره", true],
  ["representativeName", "نام نماینده‌ی شرکت", true], ["representativeNationality", "تابعیت نماینده", true],
  ["representativeDocument", "کد ملی / کد اختصاصی نماینده", true],
  ["proforma", "اطلاعات پروفورما", false], ["taxId", "شناسه‌ی مالیاتی / شناسه‌ی ملی معادل", false],
  ["address", "نشانی شرکت و اطلاعات تکمیلی کسب‌وکار", true],
];
const docs = [
  { key: "representativeIdentity", label: "تصویر مدرک هویتی نماینده / کد ملی معادل", required: true },
  { key: "companyIntroduction", label: "تصویر معرفی‌نامه‌ی شرکت", required: true },
  { key: "companyRegistration", label: "تصویر مدرک تأسیس / ثبت شرکت", required: true },
  { key: "businessLicense", label: "تصویر پروانه‌ی کسب / مجوز فعالیت", required: true },
  { key: "articlesOfAssociation", label: "تصویر اساسنامه‌ی شرکت", required: true },
  { key: "officialGazette", label: "روزنامه‌ی رسمی", required: false },
  { key: "managersIdentity", label: "مدارک هویتی مدیران", required: false },
  { key: "proforma", label: "پروفورما و مدارک تکمیلی", required: false },
];
const emptyData = () => Object.fromEntries(fields.map(([key]) => [key, ""]));

export default function LegalEntityPage() {
  const { t, n, errorText } = useI18n();
  const [view, setView] = useState("list");
  const [entities, setEntities] = useState([]);
  const [entityId, setEntityId] = useState("");
  const [data, setData] = useState(emptyData);
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const loadEntities = useCallback(async () => {
    setLoading(true); setError("");
    try { setEntities(await api.listLegalEntities()); }
    catch (err) { setError(errorText(err)); }
    finally { setLoading(false); }
  }, [errorText]);
  useEffect(() => { loadEntities(); }, [loadEntities]);

  const openExisting = async (id) => {
    setBusy(true); setError("");
    try {
      const entity = await api.getLegalEntity(id);
      setEntityId(entity.id);
      setData({ ...emptyData(), ...entity });
      setFiles(Object.fromEntries(Object.entries(entity.documents || {}).map(([category, pages]) => [category, (Array.isArray(pages) ? pages : []).map((page) => ({ file: { name: page.name, size: page.size, type: page.type }, url: page.url || page.previewUrl || "" }))])));
      setFieldErrors({}); setView("form");
    } catch (err) { setError(errorText(err)); }
    finally { setBusy(false); }
  };

  const createNew = async () => {
    setBusy(true); setError("");
    try {
      const entity = await api.createLegalEntity();
      setEntityId(entity.id); setData(emptyData()); setFiles({}); setFieldErrors({}); setView("form");
    } catch (err) { setError(errorText(err)); }
    finally { setBusy(false); }
  };

  const set = (key) => (e) => { setData((v) => ({ ...v, [key]: e.target.value })); };

  const upload = async (category, fileList) => {
    const selected = Array.from(fileList || []);
    if (!selected.length || !entityId) return;
    setBusy(true); setError("");
    try {
      const pages = [];
      for (const file of selected) {
        if (!/^image\/(jpeg|png)$/.test(file.type) && file.type !== "application/pdf") throw new Error("BAD_FILE_TYPE");
        const uploadFile = file.type.startsWith("image/") ? await compressImage(file, LIMITS.maxFileKB * 1024) : file;
        if (uploadFile.size > LIMITS.maxFileKB * 1024) throw new Error("FILE_TOO_LARGE");
        const pageIndex = (files[category]?.length || 0) + pages.length;
        await api.uploadLegalDocument(entityId, category, uploadFile, pageIndex);
        pages.push({ file: uploadFile, url: URL.createObjectURL(uploadFile) });
      }
      setFiles((v) => ({ ...v, [category]: [...(v[category] || []), ...pages] }));
    } catch (err) {
      setError(err?.message === "FILE_TOO_LARGE" || err?.message === "IMAGE_TOO_LARGE"
        ? t("docUpload.tooLarge", { kb: n(LIMITS.maxFileKB) })
        : err?.message === "BAD_FILE_TYPE" ? t("docUpload.badType") : errorText(err));
    } finally { setBusy(false); }
  };

  const save = async () => {
    const requiredFields = fields.filter(([, , required]) => required).map(([key]) => key);
    const nextErrors = Object.fromEntries(requiredFields.filter((key) => !String(data[key] || "").trim()).map((key) => [key, "تکمیل این فیلد الزامی است."]));
    const missingDocs = docs.filter((doc) => doc.required && !files[doc.key]?.length);
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length || missingDocs.length) {
      setError(missingDocs.length ? `بارگذاری این مدارک الزامی است: ${missingDocs.map((doc) => doc.label).join("، ")}` : "فیلدهای الزامی را تکمیل کنید.");
      setTimeout(() => document.querySelector('[aria-invalid="true"]')?.focus(), 0);
      return;
    }
    setBusy(true); setError("");
    try {
      await api.saveLegalEntity(entityId, data);
      await loadEntities();
      setView("list");
    } catch (err) { setError(errorText(err)); }
    finally { setBusy(false); }
  };

  if (view === "list") return (
    <main className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="text-3xl font-bold text-deep">پرونده‌های شخصیت حقوقی</h1><p className="mt-2 leading-7 text-muted">پرونده‌های قبلی را باز کنید یا برای یک شرکت/شخصیت حقوقی دیگر فرم تازه بسازید.</p></div>
        <Button onClick={createNew} loading={busy}>ایجاد پرونده‌ی جدید</Button>
      </header>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading ? <p className="text-muted">در حال دریافت پرونده‌ها…</p> : entities.length ? <div className="space-y-3">{entities.map((entity) => (
        <article key={entity.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-line">
          <div className="min-w-0"><h2 className="truncate text-lg font-bold text-deep">{entity.companyNameFa || entity.companyNameLatin || "پرونده‌ی بدون نام"}</h2><p className="mt-1 text-sm text-muted">{entity.companyNameLatin || ""}{entity.registrationNumber ? ` · ${entity.registrationNumber}` : ""}</p><div className="mt-2 flex gap-2 text-xs"><span className={`rounded-full px-2.5 py-1 ${entity.status === "complete" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{entity.status === "complete" ? "تکمیل‌شده" : "پیش‌نویس / نیازمند تکمیل"}</span><span className="rounded-full bg-mist px-2.5 py-1 text-deep">{n(entity.documentCount || 0)} مدرک</span></div></div>
          <Button variant="outline" onClick={() => openExisting(entity.id)} loading={busy}>نمایش / تکمیل فرم</Button>
        </article>
      ))}</div> : <section className="rounded-2xl bg-white p-8 text-center ring-1 ring-line"><p className="font-bold text-deep">هنوز پرونده‌ی حقوقی ثبت نکرده‌اید.</p><p className="mt-2 text-sm text-muted">با ایجاد پرونده می‌توانید اطلاعات شرکت و مدارک مربوط را جداگانه مدیریت کنید.</p><Button className="mt-4" onClick={createNew} loading={busy}>ایجاد اولین پرونده</Button></section>}
    </main>
  );

  return (
    <main className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div><h1 className="text-3xl font-bold text-deep">فرم شخصیت حقوقی</h1><p className="mt-2 leading-7 text-muted">مدارک الزامی با ستاره مشخص شده‌اند؛ هر مدرک می‌تواند چند صفحه داشته باشد و هر صفحه جداگانه برای همین پرونده ارسال می‌شود.</p></div>
        <Button variant="outline" onClick={() => { setError(""); setView("list"); loadEntities(); }}>بازگشت به فهرست پرونده‌ها</Button>
      </header>
      <section className="grid gap-5 rounded-2xl bg-white p-6 ring-1 ring-line sm:grid-cols-2">
        {fields.map(([key, label, required]) => <Field key={key} id={key} label={label} required={required} value={data[key] || ""} onChange={set(key)} error={fieldErrors[key]} type={key === "registrationDate" ? "date" : "text"} disabled={busy} />)}
      </section>
      <section className="space-y-4 rounded-2xl bg-white p-6 ring-1 ring-line">
        <h2 className="text-xl font-bold">مدارک شرکت و نماینده</h2>
        {docs.map(({ key, label, required }) => (
          <div key={key} className="rounded-lg border border-dashed border-line p-4 text-sm">
            <label className="font-medium" htmlFor={`legal-${key}`}>{label}{required && <span className="ms-1 text-red-600" aria-label="الزامی">*</span>}</label>
            <input id={`legal-${key}`} className="mt-2 block w-full" type="file" multiple accept="image/jpeg,image/png,application/pdf" onChange={(e) => upload(key, e.target.files)} disabled={busy} />
            <p className="mt-1 text-xs text-muted">تصاویر قبل از ارسال تا {n(LIMITS.maxFileKB)} کیلوبایت فشرده می‌شوند؛ هر صفحه‌ی PDF نیز حداکثر همین حجم را دارد.</p>
            {!!files[key]?.length && <div className="mt-3 flex flex-wrap gap-3">{files[key].map((page, index) => <div key={`${page.file.name}-${index}`} className="rounded border border-line p-2"><p className="max-w-48 truncate text-xs">صفحه {n(index + 1)}: {page.file.name}</p>{page.url && (page.file.type === "application/pdf" ? <a className="text-brand underline" href={page.url} target="_blank" rel="noreferrer">پیش‌نمایش PDF</a> : <img className="mt-2 h-20 w-28 rounded object-cover" src={page.url} alt={`پیش‌نمایش ${label}، صفحه ${index + 1}`} />)}</div>)}</div>}
          </div>
        ))}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <Button onClick={save} loading={busy}>ذخیره‌ی پرونده</Button>
      </section>
    </main>
  );
}
