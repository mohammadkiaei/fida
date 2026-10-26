"use client";

import AuthGuard from "@/components/AuthGuard";
import PanelShell from "@/components/PanelShell";
import { useI18n } from "@/i18n/I18nProvider";

export default function AdminLayout({ children }) {
  const { t } = useI18n();
  const nav = [
    { path: "/admin", label: t("admin.nav.home"), exact: true },
    { path: "/admin/requests", label: t("admin.nav.requests") },
    { path: "/admin/users", label: t("admin.nav.users") },
  ];
  return (
    <AuthGuard role="admin">
      <PanelShell nav={nav}>{children}</PanelShell>
    </AuthGuard>
  );
}
