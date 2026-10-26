"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";
import { LIMITS } from "@/lib/constants";
import { useI18n } from "@/i18n/I18nProvider";

const KEY = "fida_reg_deadline";
const fresh = () => Date.now() + LIMITS.registrationWindowMinutes * 60_000;

/**
 * Shows the 30-minute registration window. This is a visual aid; the backend is the
 * authority on the time limit and on the "wait half an hour" rule.
 */
export default function RegistrationTimer() {
  const { t, n, clock } = useI18n();
  const [deadline, setDeadline] = useState(null);
  const [left, setLeft] = useState(null);

  useEffect(() => {
    let d = Number(localStorage.getItem(KEY));
    if (!d) {
      d = fresh();
      localStorage.setItem(KEY, String(d));
    }
    setDeadline(d);
  }, []);

  useEffect(() => {
    if (!deadline) return;
    const tick = () => setLeft(Math.max(0, Math.round((deadline - Date.now()) / 1000)));
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [deadline]);

  if (left === null) return null;

  if (left === 0) {
    return (
      <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-900 ring-1 ring-red-200">
        <p className="leading-7">{t("timer.expired")}</p>
        <Button
          variant="danger"
          onClick={() => {
            const d = fresh();
            localStorage.setItem(KEY, String(d));
            setDeadline(d);
          }}
        >
          {t("timer.restart")}
        </Button>
      </div>
    );
  }

  return (
    <p className="rounded-xl bg-signal/15 p-4 text-sm leading-7 text-[#7a4b00]">
      {t("timer.left", { time: clock(left), min: n(LIMITS.registrationWindowMinutes) })}
    </p>
  );
}
