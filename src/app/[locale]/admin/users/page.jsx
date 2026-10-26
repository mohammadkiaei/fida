"use client";

import { useEffect, useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useAsync } from "@/lib/hooks";
import { ROLE_KEYS } from "@/lib/constants";
import { useI18n } from "@/i18n/I18nProvider";

export default function UsersPage() {
  const { user: me } = useAuth();
  const toast = useToast();
  const { t, n, dateTime, fullName, errorText } = useI18n();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const { data, loading, error, reload } = useAsync(() => api.admin.listUsers(debounced), [debounced]);
  const heads = [t("admin.col.applicant"), t("admin.col.phone"), t("admin.col.nationality"), t("admin.col.joined"), t("admin.col.status"), t("admin.col.role")];

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const changeRole = async (u, role) => {
    try {
      await api.admin.setRole(u.id, role);
      toast(t("admin.users.roleChanged", { name: fullName(u), role: t(`roles.${role}`) }));
      reload();
    } catch (e) {
      toast(errorText(e), "error");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-deep">{t("admin.users.title")}</h1>
      <div className="max-w-sm">
        <label htmlFor="q" className="sr-only">{t("admin.users.searchLabel")}</label>
        <input id="q" className="input" placeholder={t("admin.users.search")} value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-line">
        <table className="w-full min-w-[44rem] text-sm">
          <thead className="bg-mist text-muted">
            <tr>
              {heads.map((h) => (
                <th key={h} scope="col" className="px-4 py-3 text-start font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted">{t("common.loading")}</td></tr>}
            {!loading && data?.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted">{t("admin.users.empty")}</td></tr>}
            {data?.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium">{fullName(u)}</td>
                <td className="px-4 py-3"><bdi dir="ltr">{n(u.phone)}</bdi></td>
                <td className="px-4 py-3">{u.nationality || "—"}</td>
                <td className="px-4 py-3 text-muted">{dateTime(u.createdAt)}</td>
                <td className="px-4 py-3"><StatusBadge status={u.verificationStatus} /></td>
                <td className="px-4 py-3">
                  <select
                    aria-label={t("admin.users.roleOf", { name: fullName(u) })}
                    className="input w-auto py-1.5"
                    value={u.role}
                    disabled={u.id === me.id}
                    onChange={(e) => changeRole(u, e.target.value)}
                  >
                    {ROLE_KEYS.map((k) => (
                      <option key={k} value={k}>{t(`roles.${k}`)}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
