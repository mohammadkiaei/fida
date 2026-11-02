"use client";

import AuthGuard from "@/components/AuthGuard";
import PanelShell from "@/components/PanelShell";
import { useI18n } from "@/i18n/I18nProvider";

export default function PanelLayout({ children }) {
  const { t } = useI18n();
  const nav = [
    { path: "/panel", label: t("panel.nav.home"), exact: true },
    { path: "/panel/verify", label: t("panel.nav.verify") },
    { path: "/panel/legal-entity", label: "شخصیت حقوقی" },
    { path: "/panel/support", label: "پشتیبانی" },
  ];
  return (
    <AuthGuard role="user">
      <PanelShell nav={nav}>{children}</PanelShell>
    </AuthGuard>
  );
}
