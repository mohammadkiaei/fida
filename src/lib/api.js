/**
 * Single entry point for every backend call.
 *
 * - NEXT_PUBLIC_API_BASE_URL empty  -> mock API (localStorage), so the whole UI works without a backend.
 * - NEXT_PUBLIC_API_BASE_URL set    -> real REST API; the contract is listed in README.md.
 *
 * Errors carry a `code` (e.g. INVALID_CODE). The UI translates codes, so the same error
 * reads correctly in Persian and English.
 */
import { isProfileComplete, toEn } from "@/lib/utils";
import { LIMITS } from "@/lib/constants";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
export const USE_MOCK = !BASE;
export const MOCK_OTP = "12345";
export const MOCK_SAMPLE = { phone: "09122222222", number: "9901234567890" };
export const OTP_LENGTH = 5;
export const OTP_TTL_SECONDS = 120;
export const TOKEN_KEY = "fida_token";

export class ApiError extends Error {
  constructor(code, status = 0, message) {
    super(message || code);
    this.code = code;
    this.status = status;
  }
}

/* ------------------------------------------------------------------ */
/* Real REST client                                                    */
/* ------------------------------------------------------------------ */

const getToken = () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY));

async function http(path, { method = "GET", body, form, token } = {}) {
  const headers = {};
  const tk = token || getToken();
  if (tk) headers.Authorization = `Bearer ${tk}`;
  if (body) headers["Content-Type"] = "application/json";
  let res;
  try {
    res = await fetch(BASE + path, { method, headers, body: form || (body ? JSON.stringify(body) : undefined) });
  } catch {
    throw new ApiError("NETWORK");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.code || "GENERIC", res.status, data.message);
  return data;
}

function uploadWithProgress(path, form, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", BASE + path);
    const token = getToken();
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      let data = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {}
      if (xhr.status >= 200 && xhr.status < 300) resolve(data);
      else reject(new ApiError(data.code || "UPLOAD_FAILED", xhr.status, data.message));
    };
    xhr.onerror = () => reject(new ApiError("NETWORK"));
    xhr.send(form);
  });
}

const ext = (blob) => (blob.type.includes("mp4") ? "mp4" : blob.type.includes("webm") ? "webm" : "jpg");

const realApi = {
  getMartyrOfDay: () => http("/public/martyr-of-day"),
  sendOtp: (phone) => http("/auth/otp/send", { method: "POST", body: { phone } }),
  verifyOtp: (phone, code, extra = {}) => http("/auth/otp/verify", { method: "POST", body: { phone, code, ...extra } }), // -> { token, user }
  loginPassword: (identifier, password) => http("/auth/login", { method: "POST", body: { identifier, password } }),
  getMe: () => http("/me"),
  updateMe: (data) => http("/me", { method: "PUT", body: data }),
  saveStep: (step, data) => http(`/verification/steps/${step}`, { method: "PUT", body: data }),
  uploadDocument: (slot, file) => {
    if (file.size > LIMITS.maxFileKB * 1024) throw new ApiError("FILE_TOO_LARGE", 413);
    const form = new FormData();
    form.append("slot", String(slot));
    form.append("file", file);
    return http("/me/documents", { method: "POST", form }); // -> user
  },
  removeDocument: (slot) => http(`/me/documents/${slot}`, { method: "DELETE" }), // -> user
  getChallenge: (locale) => http(`/verification/challenge?lang=${encodeURIComponent(locale)}`), // -> { id, sentence, gestures }
  getMyVerification: () => http("/verification/me"),
  submitVerification: ({ challengeId, video, selfie }, onProgress) => {
    if (video.size > LIMITS.maxVideoKB * 1024) throw new ApiError("FILE_TOO_LARGE", 413);
    const form = new FormData();
    form.append("challengeId", challengeId);
    form.append("video", video, `verification.${ext(video)}`);
    return uploadWithProgress("/verification/video", form, onProgress); // selfie has its own validated endpoint
  },
  submitSelfie: (selfie) => {
    if (selfie.size > LIMITS.maxFileKB * 1024) throw new ApiError("FILE_TOO_LARGE", 413);
    const form = new FormData(); form.append("selfie", selfie, "selfie.jpg"); return http("/verification/selfie", { method: "POST", form });
  },
  listLegalEntities: () => http("/legal-entities/me"),
  getLegalEntity: (id) => http(`/legal-entities/me/${encodeURIComponent(id)}`),
  createLegalEntity: (data = {}) => http("/legal-entities/me", { method: "POST", body: data }),
  saveLegalEntity: (id, data) => http(`/legal-entities/me/${encodeURIComponent(id)}`, { method: "PUT", body: data }),
  uploadLegalDocument: (entityId, category, file, pageIndex = 0) => {
    if (file.size > LIMITS.maxFileKB * 1024) throw new ApiError("FILE_TOO_LARGE", 413);
    const form = new FormData(); form.append("entityId", entityId); form.append("category", category); form.append("pageIndex", String(pageIndex)); form.append("file", file); return http(`/legal-entities/me/${encodeURIComponent(entityId)}/documents`, { method: "POST", form });
  },
  sendSupportMessage: (message, channel = "ai", context = {}) => http("/support/messages", { method: "POST", body: { message, channel, ...context } }),
  getSupportMessages: (conversationId, visitorId, after = "") => http(`/support/conversations/${encodeURIComponent(conversationId)}/messages?visitorId=${encodeURIComponent(visitorId)}&after=${encodeURIComponent(after)}`),
  startPayment: (data) => http("/payments/start", { method: "POST", body: data }),
  getPaymentResult: (paymentId) => http(`/payments/${encodeURIComponent(paymentId)}/result`),
  receive: {
    sendOtp: (phone) => http("/special-number/otp/send", { method: "POST", body: { phone } }),
    verifyOtp: (phone, code) => http("/special-number/otp/verify", { method: "POST", body: { phone, code } }), // -> { ticket }
    getCard: (ticket, number) => http("/special-number/card", { method: "POST", body: { ticket, number } }),
  },
  admin: {
    stats: () => http("/admin/stats"),
    listUsers: (search = "") => http(`/admin/users?search=${encodeURIComponent(search)}`),
    setRole: (id, role) => http(`/admin/users/${id}/role`, { method: "PATCH", body: { role } }),
    listVerifications: (status = "") => http(`/admin/verifications?status=${status}`),
    getVerification: (id) => http(`/admin/verifications/${id}`),
    decide: (id, decision, reason) =>
      http(`/admin/verifications/${id}/decision`, { method: "POST", body: { decision, reason } }),
  },
};

/* ------------------------------------------------------------------ */
/* Mock API (browser only)                                             */
/* ------------------------------------------------------------------ */

const DB_KEY = "fida_mock_db_v3";
const wait = (ms = 450) => new Promise((r) => setTimeout(r, ms));
const media = new Map(); // in-memory object URLs (live until the tab reloads): "v:<id>" -> {video, selfie}, "d:<userId>:<slot>"

const SENTENCES = {
  fa: [
    "من برای دریافت شماره اختصاصی در فیدا ویدیو ضبط می‌کنم و عدد {n} را تکرار می‌کنم.",
    "این ویدیو را خودم ضبط کرده‌ام و مشخصات من درست است، کد من {n} است.",
    "من صاحب این مدرک هستم و عدد {n} را با صدای بلند می‌خوانم.",
  ],
  en: [
    "I am recording this video myself to get my special number, and I repeat the number {n}.",
    "I confirm that my details are correct and this video is mine. My code is {n}.",
    "I am the owner of this document and I read the number {n} out loud.",
  ],
};

const ago = (h) => new Date(Date.now() - h * 3600_000).toISOString();
const blank = { fatherName: "", gender: "", nationality: "", docType: "", docNumber: "", docIssueDate: "", docExpiryDate: "", birthDate: "", address: "", documents: [null, null], editCount: 0 };

function seed() {
  const users = [
    { id: "u1", phone: "09120000000", role: "admin", ...blank, firstName: "Admin", lastName: "Fida", createdAt: ago(900) },
    { id: "u2", phone: "09121111111", role: "user", ...blank, firstName: "Ahmad", lastName: "Rahimi", fatherName: "Karim", gender: "male", nationality: "Afghanistan", docType: "passport", docNumber: "P1234567", docIssueDate: "2021-03-10", docExpiryDate: "2026-03-10", birthDate: "1994-05-12", address: "Tehran Shahrak Gharb Street 12 Unit 4", documents: [{ name: "passport-p1.jpg", size: 212000 }, null], editCount: 0, createdAt: ago(300) },
    { id: "u3", phone: "09122222222", role: "user", ...blank, firstName: "Fatima", lastName: "Al-Saadi", fatherName: "Hassan", gender: "female", nationality: "Iraq", docType: "amayesh", docNumber: "A9876543", docIssueDate: "2023-01-20", docExpiryDate: "2027-01-20", birthDate: "1990-11-03", address: "Qom Blvd Amin 7 Plaque 22", documents: [{ name: "amayesh.jpg", size: 180000 }, null], editCount: 1, specialNumber: MOCK_SAMPLE.number, specialNumberIssuedAt: ago(96), createdAt: ago(250) },
    { id: "u4", phone: "09123333333", role: "user", ...blank, firstName: "Rajesh", lastName: "Rajesh", gender: "male", nationality: "India", docType: "passport", docNumber: "K7654321", docIssueDate: "2019-07-01", docExpiryDate: "2029-07-01", birthDate: "1988-07-22", address: "Tehran Valiasr Street 100", documents: [{ name: "passport.jpg", size: 240000 }, null], editCount: 0, createdAt: ago(120) },
    { id: "u5", phone: "09124444444", role: "user", ...blank, firstName: "Maria", lastName: "Petrova", gender: "female", nationality: "Russia", docType: "passport", docNumber: "R5550011", docIssueDate: "2022-02-14", docExpiryDate: "2032-02-14", birthDate: "1993-02-28", address: "Mashhad Sajjad Blvd 5 Unit 9", documents: [{ name: "passport.jpg", size: 300000 }, null], editCount: 0, createdAt: ago(48) },
    { id: "u6", phone: "09125555555", role: "user", ...blank, firstName: "", lastName: "", createdAt: ago(5) },
  ];
  const verifications = [
    { id: "v1", userId: "u2", status: "pending", sentence: SENTENCES.en[0].replace("{n}", "472"), trackingCode: "FD104728351", submittedAt: ago(3), decidedAt: null, rejectionReason: "" },
    { id: "v2", userId: "u3", status: "approved", sentence: SENTENCES.en[1].replace("{n}", "308"), trackingCode: "FD104193377", submittedAt: ago(100), decidedAt: ago(96), rejectionReason: "" },
    { id: "v3", userId: "u4", status: "rejected", sentence: SENTENCES.en[2].replace("{n}", "915"), trackingCode: "FD104002264", submittedAt: ago(70), decidedAt: ago(60), rejectionReason: "The photo on the document was not readable. Please upload a clear colour image." },
  ];
  users.forEach((u) => { u.password = "fida-demo"; });
  return { users, verifications, otps: {}, challenges: {}, tickets: {}, payments: {} };
}

function db() {
  const raw = localStorage.getItem(DB_KEY);
  if (raw) return JSON.parse(raw);
  const fresh = seed();
  localStorage.setItem(DB_KEY, JSON.stringify(fresh));
  return fresh;
}
const save = (d) => localStorage.setItem(DB_KEY, JSON.stringify(d));

const statusOf = (d, userId) => d.verifications.find((v) => v.userId === userId)?.status || "not_started";
const publicUser = (d, u) => ({
  ...u,
  verificationStatus: statusOf(d, u.id),
  profileComplete: isProfileComplete(u),
  editsLeft: Math.max(0, LIMITS.maxEdits - (u.editCount || 0)),
});

function currentUser(d) {
  const token = getToken();
  const id = token?.startsWith("mock-") ? token.slice(5) : null;
  const u = d.users.find((x) => x.id === id);
  if (!u) throw new ApiError("SESSION_EXPIRED", 401);
  return u;
}
function requireAdmin(d) {
  const u = currentUser(d);
  if (u.role !== "admin") throw new ApiError("FORBIDDEN", 403);
  return u;
}

function checkOtp(d, phone, code) {
  const p = toEn(phone);
  const rec = d.otps[p];
  if (!rec || toEn(code) !== rec.code) throw new ApiError("INVALID_CODE", 400);
  if (rec.expiresAt < Date.now()) throw new ApiError("CODE_EXPIRED", 400);
  delete d.otps[p];
  return p;
}
function issueOtp(phone) {
  const d = db();
  d.otps[toEn(phone)] = { code: MOCK_OTP, expiresAt: Date.now() + OTP_TTL_SECONDS * 1000 };
  save(d);
  return { ok: true, expiresIn: OTP_TTL_SECONDS };
}

const mockApi = {
  async getMartyrOfDay() { await wait(150); return null; },
  async sendOtp(phone) {
    await wait();
    return issueOtp(phone);
  },
  async verifyOtp(phone, code) {
    await wait();
    const d = db();
    const p = checkOtp(d, phone, code);
    let user = d.users.find((u) => u.phone === p);
    if (!user) {
      user = { id: "u" + Date.now(), phone: p, role: "user", ...blank, firstName: "", lastName: "", password: "fida-demo", createdAt: new Date().toISOString() };
      d.users.push(user);
    }
    save(d);
    return { token: "mock-" + user.id, user: publicUser(d, user) };
  },
  async loginPassword(identifier, password) {
    await wait();
    const d = db();
    const user = d.users.find((u) => u.phone === toEn(identifier).trim() || u.username === identifier);
    if (!user || !user.password || user.password !== password) throw new ApiError("INVALID_CREDENTIALS", 401);
    return { token: `mock-${user.id}`, user: publicUser(d, user) };
  },
  async saveStep(step, data) {
    await wait(180);
    const d = db(); const u = currentUser(d);
    u.steps = { ...(u.steps || {}), [step]: { ...data, savedAt: new Date().toISOString() } };
    save(d); return { ok: true, step };
  },
  async submitSelfie(selfie) {
    await wait(300);
    if (selfie.size > LIMITS.maxFileKB * 1024) throw new ApiError("FILE_TOO_LARGE", 413);
    const d = db(); const u = currentUser(d);
    if (!u.documents?.some(Boolean)) throw new ApiError("DOCUMENT_REQUIRED", 400);
    media.set(`selfie:${u.id}`, URL.createObjectURL(selfie));
    return { accepted: true, next: "video" };
  },
  async listLegalEntities() {
    await wait(180); const d = db(); const u = currentUser(d);
    u.legalEntities = Array.isArray(u.legalEntities) ? u.legalEntities : (u.legalEntity ? [{ ...u.legalEntity, id: "legacy-legal-entity", status: "draft" }] : []);
    delete u.legalEntity;
    save(d);
    return u.legalEntities.map(({ id, companyNameFa, companyNameLatin, registrationNumber, status, updatedAt, documents = {} }) => ({ id, companyNameFa, companyNameLatin, registrationNumber, status: status || "draft", updatedAt, documentCount: Object.values(documents).reduce((sum, pages) => sum + (Array.isArray(pages) ? pages.length : pages ? 1 : 0), 0) }));
  },
  async getLegalEntity(id) {
    await wait(180); const d = db(); const u = currentUser(d); const entity = (u.legalEntities || []).find((item) => item.id === id);
    if (!entity) throw new ApiError("NOT_FOUND", 404);
    const documents = Object.fromEntries(Object.entries(entity.documents || {}).map(([category, value]) => [category, (Array.isArray(value) ? value : value ? [value] : []).map((page, index) => ({ ...page, url: media.get(`legal:${u.id}:${id}:${category}:${index}`) || page.url || "" }))]));
    return { ...entity, documents };
  },
  async createLegalEntity(data = {}) {
    await wait(180); const d = db(); const u = currentUser(d); u.legalEntities = u.legalEntities || [];
    const entity = { id: `le${Date.now()}`, ...data, documents: {}, status: "draft", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    u.legalEntities.push(entity); save(d); return entity;
  },
  async saveLegalEntity(id, data) {
    await wait(200); const d = db(); const u = currentUser(d); const entity = (u.legalEntities || []).find((item) => item.id === id);
    if (!entity) throw new ApiError("NOT_FOUND", 404);
    Object.assign(entity, data, { updatedAt: new Date().toISOString() });
    const requiredFields = ["companyNameFa", "companyNameLatin", "registrationNumber", "registrationDate", "registrationCountry", "activityType", "fixedPhone", "ownershipType", "mobile", "managers", "managerIdentity", "representativeName", "representativeNationality", "representativeDocument", "address"];
    const requiredDocs = ["representativeIdentity", "companyIntroduction", "companyRegistration", "businessLicense", "articlesOfAssociation"];
    entity.status = requiredFields.every((key) => String(entity[key] || "").trim()) && requiredDocs.every((key) => entity.documents?.[key]?.length) ? "complete" : "draft";
    save(d); return entity;
  },
  async uploadLegalDocument(entityId, category, file, pageIndex = 0) {
    await wait(250); if (file.size > LIMITS.maxFileKB * 1024) throw new ApiError("FILE_TOO_LARGE", 413);
    const d = db(); const u = currentUser(d); const entity = (u.legalEntities || []).find((item) => item.id === entityId);
    if (!entity) throw new ApiError("NOT_FOUND", 404);
    entity.documents = entity.documents || {}; const pages = entity.documents[category] || [];
    pages[pageIndex] = { name: file.name, size: file.size, type: file.type }; entity.documents[category] = pages;
    media.set(`legal:${u.id}:${entityId}:${category}:${pageIndex}`, URL.createObjectURL(file)); save(d); return { ok: true };
  },
  async sendSupportMessage(message, channel = "ai", context = {}) { await wait(350); return { id: `m${Date.now()}`, conversationId: context.conversationId || `chat-${context.visitorId || "guest"}`, channel, message, reply: channel === "ai" ? "پیامتان دریافت شد. دستیار فیدا به‌زودی راهنمایی‌تان می‌کند." : "پیامتان در صف پشتیبانی انسانی ثبت شد. پاسخ در همین گفت‌وگو نمایش داده می‌شود." }; },
  async getSupportMessages() { await wait(100); return []; },
  async startPayment({ trackingCode, locale = "fa" }) {
    await wait(300);
    const d = db(); const u = currentUser(d); const paymentId = `mp${Date.now()}`;
    d.payments = d.payments || {};
    d.payments[paymentId] = { userId: u.id, trackingCode, status: "paid", paidAt: new Date().toISOString() };
    save(d);
    return { paymentId, checkoutUrl: `${window.location.origin}/${locale}/panel/payment-result?paymentId=${paymentId}` };
  },
  async getPaymentResult(paymentId) {
    await wait(200);
    const d = db(); const u = currentUser(d); const payment = d.payments?.[paymentId];
    if (!payment || payment.userId !== u.id) throw new ApiError("NOT_FOUND", 404);
    return { status: payment.status, trackingCode: payment.trackingCode, paidAt: payment.paidAt };
  },
  async getMe() {
    await wait(200);
    const d = db();
    return publicUser(d, currentUser(d));
  },
  async updateMe(data) {
    await wait();
    const d = db();
    const u = currentUser(d);
    if (isProfileComplete(u)) {
      if ((u.editCount || 0) >= LIMITS.maxEdits) throw new ApiError("EDIT_LIMIT", 400);
      u.editCount = (u.editCount || 0) + 1;
    }
    const clean = (v) => String(v ?? "").trim();
    Object.assign(u, {
      firstName: clean(data.firstName),
      lastName: clean(data.lastName),
      fatherName: clean(data.fatherName),
      fatherNameFa: clean(data.fatherNameFa),
      firstNameFa: clean(data.firstNameFa),
      lastNameFa: clean(data.lastNameFa),
      motherTongue: clean(data.motherTongue),
      challengeLanguage: clean(data.challengeLanguage),
      motherName: clean(data.motherName),
      motherNameFa: clean(data.motherNameFa),
      grandfatherName: clean(data.grandfatherName),
      grandfatherNameFa: clean(data.grandfatherNameFa),
      birthCountry: clean(data.birthCountry),
      phone: clean(data.phone),
      province: clean(data.province),
      city: clean(data.city),
      passportCountry: clean(data.passportCountry),
      passportAuthority: clean(data.passportAuthority),
      gender: data.gender,
      nationality: clean(data.nationality),
      docType: data.docType,
      docNumber: clean(data.docNumber).toUpperCase(),
      docIssueDate: data.docIssueDate,
      docExpiryDate: data.docExpiryDate || "",
      birthDate: data.birthDate,
      address: clean(data.address).replace(/\s+/g, " "),
    });
    save(d);
    return publicUser(d, u);
  },
  async uploadDocument(slot, file) {
    await wait(350);
    const d = db();
    const u = currentUser(d);
    if (file.size > LIMITS.maxFileKB * 1024) throw new ApiError("FILE_TOO_LARGE", 400);
    u.documents = u.documents || [null, null];
    u.documents[slot] = { name: file.name, size: file.size, type: file.type };
    media.set(`d:${u.id}:${slot}`, URL.createObjectURL(file));
    save(d);
    return publicUser(d, u);
  },
  async removeDocument(slot) {
    await wait(200);
    const d = db();
    const u = currentUser(d);
    u.documents[slot] = null;
    media.delete(`d:${u.id}:${slot}`);
    save(d);
    return publicUser(d, u);
  },
  async getChallenge(locale = "fa") {
    await wait(250);
    const d = db();
    const u = currentUser(d);
    const code = String(Math.floor(10000 + Math.random() * 90000));
    const words = locale === "fa" ? ["دریا", "باران", "سپید", "بهار", "آفتاب", "امید", "آرام", "سبز", "روشن", "دوستی"] : ["river", "rain", "spring", "sunlight", "hope", "calm", "green", "bright", "kindness", "blue"];
    const spoken = Array.from({ length: 3 }, () => words[Math.floor(Math.random() * words.length)]);
    const name = `${u.firstName || "متقاضی"} ${u.lastName || "فیدا"}`.trim();
    const sentence = locale === "en"
      ? `I, ${name}, with Fida identity verification code ${code}, confirm my identity in the Fida system. I will now read these three words: ${spoken.join(", ")}.`
      : `من ${name} با کد احراز هویتی ${code}، تأیید احراز هویت خود را در سامانه فیدا اعلام می‌دارم. سه واژه: ${spoken.join("، ")}.`;
    const id = "c" + Date.now();
    const patternPool = [0, 1, 2, 3, 4, 5, 6, 9].sort(() => Math.random() - 0.5);
    const gestures = { handPatterns: patternPool.slice(0, 3), headSequence: Math.random() < 0.5 ? ["left", "right"] : ["right", "left"], smile: true };
    d.challenges[id] = { userId: u.id, sentence, code, words: spoken, gestures };
    save(d);
    return { id, sentence, gestures };
  },
  async getMyVerification() {
    await wait(250);
    const d = db();
    const u = currentUser(d);
    const v = d.verifications.find((x) => x.userId === u.id);
    return v
      ? { status: v.status, submittedAt: v.submittedAt, rejectionReason: v.rejectionReason, trackingCode: v.trackingCode, specialNumber: u.specialNumber || null }
      : { status: "not_started" };
  },
  async submitVerification({ challengeId, video, selfie }, onProgress) {
    if (video.size > LIMITS.maxVideoKB * 1024) throw new ApiError("FILE_TOO_LARGE", 413);
    const d = db();
    const u = currentUser(d);
    const ch = d.challenges[challengeId];
    if (!ch || ch.userId !== u.id) throw new ApiError("CHALLENGE_EXPIRED", 400);
    for (let p = 0; p <= 100; p += 10) {
      await wait(120);
      onProgress?.(p);
    }
    const id = "v" + Date.now();
    const trackingCode = "FD" + String(Math.floor(100000000 + Math.random() * 900000000));
    d.verifications = d.verifications.filter((v) => v.userId !== u.id);
    d.verifications.push({ id, userId: u.id, status: "pending", sentence: ch.sentence, trackingCode, submittedAt: new Date().toISOString(), decidedAt: null, rejectionReason: "" });
    delete d.challenges[challengeId];
    save(d);
    media.set(`v:${id}`, { video: URL.createObjectURL(video), selfie: URL.createObjectURL(selfie) });
    return { status: "pending", trackingCode };
  },
  receive: {
    async sendOtp(phone) {
      await wait();
      return issueOtp(phone);
    },
    async verifyOtp(phone, code) {
      await wait();
      const d = db();
      const p = checkOtp(d, phone, code);
      const ticket = "t" + Date.now();
      d.tickets[ticket] = p;
      save(d);
      return { ticket };
    },
    async getCard(ticket, number) {
      await wait(400);
      const d = db();
      const phone = d.tickets[ticket];
      if (!phone) throw new ApiError("SESSION_EXPIRED", 401);
      const u = d.users.find((x) => x.phone === phone);
      if (!u?.specialNumber || u.specialNumber !== toEn(number).trim()) throw new ApiError("NUMBER_MISMATCH", 400);
      return {
        fullName: `${u.firstName} ${u.lastName}`,
        nationality: u.nationality,
        docType: u.docType,
        docNumber: u.docNumber,
        specialNumber: u.specialNumber,
        issuedAt: u.specialNumberIssuedAt,
      };
    },
  },
  admin: {
    async stats() {
      await wait(250);
      const d = db();
      requireAdmin(d);
      const count = (s) => d.verifications.filter((v) => v.status === s).length;
      return { users: d.users.length, pending: count("pending"), approved: count("approved"), rejected: count("rejected") };
    },
    async listUsers(search = "") {
      await wait(250);
      const d = db();
      requireAdmin(d);
      const q = toEn(search).trim().toLowerCase();
      return d.users
        .filter((u) => !q || `${u.firstName} ${u.lastName} ${u.phone} ${u.docNumber}`.toLowerCase().includes(q))
        .map((u) => publicUser(d, u))
        .reverse();
    },
    async setRole(id, role) {
      await wait(300);
      const d = db();
      const me = requireAdmin(d);
      if (me.id === id) throw new ApiError("SELF_ROLE", 400);
      const u = d.users.find((x) => x.id === id);
      if (!u) throw new ApiError("NOT_FOUND", 404);
      u.role = role;
      save(d);
      return publicUser(d, u);
    },
    async listVerifications(status = "") {
      await wait(250);
      const d = db();
      requireAdmin(d);
      return d.verifications
        .filter((v) => !status || v.status === status)
        .map((v) => ({ ...v, user: d.users.find((u) => u.id === v.userId) }))
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    },
    async getVerification(id) {
      await wait(250);
      const d = db();
      requireAdmin(d);
      const v = d.verifications.find((x) => x.id === id);
      if (!v) throw new ApiError("NOT_FOUND", 404);
      const m = media.get(`v:${id}`);
      const user = d.users.find((u) => u.id === v.userId);
      return {
        ...v,
        user,
        videoUrl: m?.video || null,
        selfieUrl: m?.selfie || null,
        documentUrls: [0, 1].map((s) => media.get(`d:${user.id}:${s}`) || null),
      };
    },
    async decide(id, decision, reason = "") {
      await wait(350);
      const d = db();
      requireAdmin(d);
      const v = d.verifications.find((x) => x.id === id);
      if (!v) throw new ApiError("NOT_FOUND", 404);
      const u = d.users.find((x) => x.id === v.userId);
      v.status = decision === "approve" ? "approved" : "rejected";
      v.rejectionReason = decision === "approve" ? "" : reason;
      v.decidedAt = new Date().toISOString();
      if (decision === "approve" && !u.specialNumber) {
        u.specialNumber = "99" + String(Math.floor(Math.random() * 1e11)).padStart(11, "0");
        u.specialNumberIssuedAt = v.decidedAt;
      }
      save(d);
      return v;
    },
  },
};

export const api = USE_MOCK ? mockApi : realApi;
