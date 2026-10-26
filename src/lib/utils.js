export const cn = (...a) => a.filter(Boolean).join(" ");

const FA = "۰۱۲۳۴۵۶۷۸۹";
const AR = "٠١٢٣٤٥٦٧٨٩";

/** ۱۲۳ / ١٢٣ -> 123 (used to normalise what people type) */
export const toEn = (v) =>
  String(v)
    .replace(/[۰-۹]/g, (d) => FA.indexOf(d))
    .replace(/[٠-٩]/g, (d) => AR.indexOf(d));

export const isMobile = (v) => /^09\d{9}$/.test(toEn(v).trim());

/** Address field: letters, digits and spaces only (no punctuation). */
export const isPlainAddress = (v) => /^[\p{L}\p{N}\s]+$/u.test(v.trim());

export const isProfileComplete = (u) =>
  Boolean(
    u?.firstName && u?.lastName && u?.gender && u?.nationality && u?.docType && u?.docNumber &&
      u?.docIssueDate && u?.docExpiryDate && u?.birthDate && u?.address && u?.documents?.[0]
  );
