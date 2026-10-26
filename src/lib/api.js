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
  sendOtp: (phone) => http("/auth/otp/send", { method: "POST", body: { phone } }),
  verifyOtp: (phone, code, extra = {}) => http("/auth/otp/verify", { method: "POST", body: { phone, code, ...extra } }), // -> { token, user }
  getMe: () => http("/me"),
  updateMe: (data) => http("/me", { method: "PUT", body: data }),
  uploadDocument: (slot, file) => {
    const form = new FormData();
    form.append("slot", String(slot));
    form.append("file", file);
    return http("/me/documents", { method: "POST", form }); // -> user
  },
  removeDocument: (slot) => http(`/me/documents/${slot}`, { method: "DELETE" }), // -> user
  getChallenge: (locale) => http(`/verification/challenge?lang=${locale}`), // -> { id, sentence }
  getMyVerification: () => http("/verification/me"),
  submitVerification: ({ challengeId, video, selfie }, onProgress) => {
    const form = new FormData();
    form.append("challengeId", challengeId);
    form.append("selfie", selfie, `selfie.${ext(selfie)}`);
    form.append("video", video, `verification.${ext(video)}`);
    return uploadWithProgress("/verification", form, onProgress); // -> { status, trackingCode }
  },
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

const DB_KEY = "fida_mock_db_v2";
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
  return { users, verifications, otps: {}, challenges: {}, tickets: {} };
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
      user = { id: "u" + Date.now(), phone: p, role: "user", ...blank, firstName: "", lastName: "", createdAt: new Date().toISOString() };
      d.users.push(user);
    }
    save(d);
    return { token: "mock-" + user.id, user: publicUser(d, user) };
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
    u.documents[slot] = { name: file.name, size: file.size };
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
    const n = String(Math.floor(100 + Math.random() * 900));
    const list = SENTENCES[locale] || SENTENCES.fa;
    const sentence = list[Math.floor(Math.random() * list.length)].replace(
      "{n}",
      locale === "fa" ? n.replace(/\d/g, (x) => "۰۱۲۳۴۵۶۷۸۹"[x]) : n
    );
    const id = "c" + Date.now();
    d.challenges[id] = { userId: u.id, sentence };
    save(d);
    return { id, sentence };
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
