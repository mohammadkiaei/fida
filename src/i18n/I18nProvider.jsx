"use client";

import { createContext, useContext, useMemo } from "react";
import { createI18n } from "@/i18n";

const Ctx = createContext(null);

export function I18nProvider({ locale, children }) {
  const value = useMemo(() => createI18n(locale), [locale]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
