"use client";

import { useRef } from "react";
import { OTP_LENGTH } from "@/lib/api";
import { toEn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";

/** Five boxes; paste, backspace and auto-advance supported. Always left-to-right, like the SMS. */
export default function OtpInput({ value, onChange, onComplete, disabled }) {
  const { t, n } = useI18n();
  const refs = useRef([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] || "");

  const setAt = (i, d) => {
    const next = digits.slice();
    next[i] = d;
    const joined = next.join("");
    onChange(joined);
    if (next.every(Boolean)) onComplete(joined);
  };

  const handleChange = (i, e) => {
    const d = toEn(e.target.value).replace(/\D/g, "").slice(-1);
    if (!d) return;
    setAt(i, d);
    if (i < OTP_LENGTH - 1) refs.current[i + 1]?.focus();
  };

  const handleKey = (i, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[i]) setAt(i, "");
      else if (i > 0) {
        setAt(i - 1, "");
        refs.current[i - 1]?.focus();
      }
    }
  };

  const handlePaste = (e) => {
    const text = toEn(e.clipboardData.getData("text")).replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!text) return;
    e.preventDefault();
    onChange(text);
    refs.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
    if (text.length === OTP_LENGTH) onComplete(text);
  };

  return (
    <div dir="ltr" className="flex justify-center gap-2" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          value={d ? n(d) : ""}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          onFocus={(e) => e.target.select()}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={t("otp.digit", { i: n(i + 1) })}
          disabled={disabled}
          className="h-14 w-12 rounded-lg border border-line text-center text-xl font-bold text-ink focus:border-brand disabled:opacity-60"
        />
      ))}
    </div>
  );
}
