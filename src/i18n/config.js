export const locales = ["fa", "en"];
export const defaultLocale = "fa";
export const isLocale = (l) => locales.includes(l);
export const dirOf = (l) => (l === "fa" ? "rtl" : "ltr");
