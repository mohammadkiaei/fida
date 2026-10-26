"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Button from "@/components/Button";
import { rules } from "@/content/rules";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Pre-login popup: document & photo rules + a mandatory "I accept" checkbox.
 * Uses the native <dialog> so focus is trapped and the page behind is inert.
 * Esc does not dismiss it; the only ways out are accepting or going back home.
 */
export default function TermsGate({ onAccept }) {
  const { t, locale, href } = useI18n();
  const ref = useRef(null);
  const [checked, setChecked] = useState(false);
  const groups = rules[locale].groups;

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
    return () => d?.open && d.close();
  }, []);

  const accept = () => {
    ref.current?.close();
    onAccept(new Date().toISOString());
  };

  return (
    <dialog
      ref={ref}
      onCancel={(e) => e.preventDefault()}
      aria-labelledby="terms-title"
      className="m-auto w-[calc(100%-1.5rem)] max-w-2xl rounded-2xl bg-white p-0 text-ink shadow-2xl backdrop:bg-ink/75"
    >
      <div className="flex max-h-[90vh] flex-col">
        <div className="border-b border-line p-5">
          <h2 id="terms-title" className="text-xl font-bold text-deep">{t("terms.title")}</h2>
          <p className="mt-1 text-sm text-muted">{t("terms.intro")}</p>
        </div>

        <div className="space-y-6 overflow-y-auto p-5" tabIndex={0}>
          {groups.map((g) => (
            <section key={g.title}>
              <h3 className="mb-2 font-bold text-deep">{g.title}</h3>
              <ul className="list-disc space-y-2 ps-6 text-sm leading-7 marker:text-brand">
                {g.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="space-y-4 border-t border-line bg-mist/60 p-5">
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-7">
            <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-1.5 h-5 w-5 shrink-0 accent-brand" />
            <span>{t("terms.accept")}</span>
          </label>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button onClick={accept} disabled={!checked}>{t("terms.continue")}</Button>
            <Link href={href("/")} className="text-sm text-muted hover:text-brand">{t("common.backHome")}</Link>
          </div>
        </div>
      </div>
    </dialog>
  );
}
