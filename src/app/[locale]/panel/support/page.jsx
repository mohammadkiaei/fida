"use client";
import Button from "@/components/Button";
import { useI18n } from "@/i18n/I18nProvider";

export default function SupportPage() {
  const { t } = useI18n();
  const openChat = () => window.dispatchEvent(new Event("fida-support-open"));
  return <main className="mx-auto max-w-2xl space-y-5 rounded-2xl bg-white p-8 text-center ring-1 ring-line">
    <h1 className="text-3xl font-bold text-deep">{t("supportChat.title")}</h1>
    <p className="leading-7 text-muted">{t("supportChat.pageHint")}</p>
    <Button onClick={openChat}>{t("supportChat.open")}</Button>
  </main>;
}
