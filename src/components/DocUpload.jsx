"use client";

import { useRef, useState } from "react";
import Button from "@/components/Button";
import { api } from "@/lib/api";
import { LIMITS } from "@/lib/constants";
import { compressImage } from "@/lib/media";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/i18n/I18nProvider";

/** A document page slot with a local preview; supports images and multi-page PDF files. */
export default function DocUpload({ slot, label, hint, required = false, disabled = false }) {
  const { t, n, errorText } = useI18n();
  const { user, setUser } = useAuth();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState("");
  const inputRef = useRef(null);
  const doc = user?.documents?.[slot];
  const previewSrc = preview || doc?.url || doc?.previewUrl;
  const id = `doc-${slot}`;

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    if (!/^image\/(jpeg|png)$/.test(file.type) && file.type !== "application/pdf") return setError(t("docUpload.badType"));
    if (preview) URL.revokeObjectURL(preview);
    setBusy(true);
    try {
      const uploadFile = file.type.startsWith("image/") ? await compressImage(file, LIMITS.maxFileKB * 1024) : file;
      if (uploadFile.size > LIMITS.maxFileKB * 1024) {
        setError(t("docUpload.tooLarge", { kb: n(LIMITS.maxFileKB) }));
        return;
      }
      setPreview(URL.createObjectURL(uploadFile));
      setUser(await api.uploadDocument(slot, uploadFile));
    } catch (err) {
      setError(err?.message === "IMAGE_TOO_LARGE" ? t("docUpload.tooLarge", { kb: n(LIMITS.maxFileKB) }) : errorText(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      setUser(await api.removeDocument(slot));
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-deep">
        {label}
        {required && <span className="ms-1 text-red-600" aria-hidden="true">*</span>}
      </p>
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-line bg-white p-3">
        {doc ? (
          <>
            {previewSrc && (doc.type === "application/pdf" || doc.name?.toLowerCase().endsWith(".pdf") ? <a href={previewSrc} target="_blank" rel="noreferrer" className="rounded bg-mist px-3 py-2 text-sm text-brand">پیش‌نمایش PDF</a> : <img src={previewSrc} alt="پیش‌نمایش مدرک" className="h-24 w-32 rounded object-cover" />)}
            <span className="min-w-0 flex-1 truncate text-sm" dir="ltr">{doc.name}</span>
            <span className="text-xs text-muted">{n(Math.max(1, Math.round(doc.size / 1024)))} KB</span>
            <Button variant="ghost" onClick={remove} disabled={busy || disabled} className="px-3 py-1.5">{t("docUpload.remove")}</Button>
          </>
        ) : (
          <>
            <input ref={inputRef} id={id} type="file" accept="image/jpeg,image/png,application/pdf" className="sr-only" onChange={onPick} disabled={busy || disabled} aria-describedby={`${id}-hint`} />
            <Button variant="secondary" onClick={() => inputRef.current?.click()} loading={busy} disabled={disabled}>
              {t("docUpload.choose")}
            </Button>
            <span className="text-xs text-muted">{t("docUpload.formats", { kb: n(LIMITS.maxFileKB) })}</span>
          </>
        )}
      </div>
      {error ? (
        <p role="alert" className="text-xs text-red-600">{error}</p>
      ) : (
        hint && <p id={`${id}-hint`} className="text-xs leading-6 text-muted">{hint}</p>
      )}
    </div>
  );
}
