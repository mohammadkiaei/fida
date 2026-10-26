"use client";

import { STATUS_TONE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";

export default function StatusBadge({ status }) {
  const { t } = useI18n();
  const key = STATUS_TONE[status] ? status : "not_started";
  return <span className={cn("inline-flex rounded-full px-3 py-0.5 text-xs font-medium", STATUS_TONE[key])}>{t(`status.${key}`)}</span>;
}
