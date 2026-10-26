"use client";

import Button from "@/components/Button";
import { useI18n } from "@/i18n/I18nProvider";

export default function NotFound() {
  const { t, href } = useI18n();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl font-bold text-deep">{t("notFound.title")}</h1>
      <p className="text-muted">{t("notFound.text")}</p>
      <Button href={href("/")}>{t("common.backHome")}</Button>
    </main>
  );
}
