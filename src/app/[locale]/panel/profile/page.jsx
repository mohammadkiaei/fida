"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/I18nProvider";

// The applicant form is now step 1–2 of the verification wizard.
export default function ProfileRedirect() {
  const router = useRouter();
  const { href } = useI18n();
  useEffect(() => {
    router.replace(href("/panel/verify"));
  }, [router, href]);
  return null;
}
