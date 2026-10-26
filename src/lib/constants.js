export const STATUS_TONE = {
  not_started: "bg-mist text-deep",
  pending: "bg-signal/20 text-[#7a4b00]",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

export const ROLE_KEYS = ["user", "admin"];
export const DOC_TYPES = ["azmayesh", "passport", "foreign_id_card", "refugee_booklet", "residence_booklet", "smart_card"];
export const GENDERS = ["male", "female"];

export const RECORDING = { minSeconds: 4, maxSeconds: 20 };
export const LIMITS = {
  maxEdits: 3, // an application can be edited up to three times
  maxFileKB: 500, // identity-document and selfie images
  registrationWindowMinutes: 30,
};
