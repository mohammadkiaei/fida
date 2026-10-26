import { fa } from "./dictionaries/fa";
import { en } from "./dictionaries/en";
import { dirOf } from "./config";

const dicts = { fa, en };
const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

/**
 * Pure (server- and client-safe) i18n helpers bound to one locale.
 *   t("home.hero.title")            -> string (or array/object for lists)
 *   t("timer.left", { time: "10" }) -> {placeholders} are interpolated
 *   n(123)                          -> ۱۲۳ in Persian, 123 in English
 *   href("/panel")                  -> /fa/panel
 */
export function createI18n(locale) {
  const loc = dicts[locale] ? locale : "fa";
  const dict = dicts[loc];
  const rtl = loc === "fa";
  const intl = rtl ? "fa-IR" : "en-GB";

  const get = (key) => key.split(".").reduce((o, k) => (o == null ? undefined : o[k]), dict);

  const t = (key, vars) => {
    const v = get(key);
    if (v === undefined) {
      if (process.env.NODE_ENV !== "production") console.warn(`[i18n] missing key: ${key}`);
      return key;
    }
    if (typeof v === "string" && vars) return v.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ""));
    return v;
  };
  const has = (key) => get(key) !== undefined;

  const n = (v) => (rtl ? String(v).replace(/\d/g, (d) => FA_DIGITS[Number(d)]) : String(v));
  const href = (p = "/") => (p === "/" ? `/${loc}` : `/${loc}${p}`);
  const dateTime = (iso) =>
    iso ? new Intl.DateTimeFormat(intl, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso)) : "—";
  const date = (iso) => (iso ? new Intl.DateTimeFormat(intl, { dateStyle: "long" }).format(new Date(iso)) : "—");
  const clock = (s) => {
    const m = String(Math.floor(s / 60)).padStart(2, "0");
    const r = String(Math.floor(s % 60)).padStart(2, "0");
    return n(`${m}:${r}`);
  };
  const fullName = (u) => [u?.firstName, u?.lastName].filter(Boolean).join(" ") || t("common.user");

  /** Spread on inputs that hold Latin text / numbers (phone, document number...). */
  const ltrInput = { dir: "ltr", style: { textAlign: rtl ? "right" : "left" } };

  /** Turns an ApiError into a message in the active language. */
  const errorText = (err) => {
    if (err?.code && has(`errors.${err.code}`)) return t(`errors.${err.code}`);
    if (err?.message && err.message !== err.code) return err.message;
    return t("errors.GENERIC");
  };

  return { locale: loc, dir: dirOf(loc), rtl, t, has, n, href, dateTime, date, clock, fullName, ltrInput, errorText };
}
