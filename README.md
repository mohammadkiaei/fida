# فرانت‌اند فیدا · Fida frontend

وبسایت و سامانه‌ی ثبت‌نام و دریافت **شماره اختصاصی** اتباع غیرایرانی (فارسی و انگلیسی) با **Next.js 14 (App Router) + JSX + Tailwind CSS**.
Bilingual (fa / en) website and panel for non-Iranian nationals to register and obtain their *special number*.

## اجرا · Run

```bash
npm install
npm run dev      # http://localhost:3000  (→ /fa یا /en)
npm run build && npm start
```

بدون بک‌اند هم کار می‌کند: اگر `NEXT_PUBLIC_API_BASE_URL` خالی باشد، یک API نمایشی (ذخیره در localStorage) فعال است.
Without a backend it runs on a built-in mock API (data in the browser's localStorage).

| حساب نمایشی · Demo | شماره · Phone | کد · Code |
|---|---|---|
| ادمین · Admin | 09120000000 | 12345 |
| متقاضی در انتظار · Pending applicant | 09121111111 | 12345 |
| متقاضی تأییدشده · Approved applicant | 09122222222 (شماره اختصاصی · number `9901234567890`) | 12345 |
| هر شماره‌ی دیگر · any other number | → new applicant | 12345 |

## زبان · Languages
- مسیرها با پیشوند زبان: `/fa/...` و `/en/...` (middleware زبان را از کوکی `NEXT_LOCALE`، سپس زبان مرورگر، و در نهایت فارسی تعیین می‌کند).
- متن‌ها در `src/i18n/dictionaries/fa.js` و `en.js` هستند؛ کلیدها در هر دو فایل یکسان‌اند. `t("کلید")` در کد استفاده می‌شود.
- مقاله‌ها: `src/content/articles.js`؛ قوانین پاپ‌آپ و مقاله‌ی «مدارک معتبر»: `src/content/rules.js` (یک منبع برای هر دو).
- فارسی راست‌چین با ارقام فارسی و تاریخ شمسی نمایش؛ انگلیسی چپ‌چین با ارقام و تاریخ میلادی. تاریخ‌های فرم‌ها (تولد، صدور مدرک) میلادی و با تقویم مرورگر انتخاب می‌شوند.

## صفحات · Pages

| مسیر · Route | محتوا · Content |
|---|---|
| `/` | معرفی، «شماره اختصاصی چیست؟»، خدمات، ۱۱ مرحله‌ی ثبت‌نام، ویدیوی آپارات، پیگیری سیم‌کارت، پرسش‌های متداول، درباره‌ی ما، تماس |
| `/learn`, `/learn/[slug]` | مقاله‌های آموزشی (مراحل ثبت‌نام، ۱۲ نکته‌ی سیم‌کارت، مدارک معتبر، نکات سلفی/ویدیو، وضعیت‌ها) |
| `/login` | **پاپ‌آپ قوانین + چک‌باکس تأیید** ← ورود با OTP |
| `/receive-number` | دریافت شماره اختصاصی در ۴ مرحله: موبایل ← کد ← شماره اختصاصی ← دریافت و چاپ کارت |
| `/panel` | داشبورد، وضعیت، شناسه‌ی پیگیری، شماره‌ی اختصاصی |
| `/panel/verify` | **ویزارد ۴ مرحله‌ای:** ۱) مدارک هویتی (نوع مدرک، شماره، تاریخ صدور، تاریخ انقضا، تصویر مدرک تا ۲ صفحه ≤ ۵۰۰KB) ← ۲) مشخصات فردی و آدرس (فقط حروف و عدد؛ سقف ۳ ویرایش؛ تایمر ۳۰ دقیقه) ← ۳) سلفی زنده ← ۴) ضبط ویدیو با جمله‌ی تصادفی. مسیر `/panel/profile` به همین صفحه هدایت می‌شود. |
| `/admin`, `/admin/requests[/id]`, `/admin/users` | آمار، بررسی درخواست (سلفی، ویدیو، مدارک) و تأیید/رد، نقش کاربران |

## اتصال به بک‌اند · Backend contract
`NEXT_PUBLIC_API_BASE_URL` را در `.env.local` بگذارید؛ همه‌ی فراخوانی‌ها در `src/lib/api.js` هستند.

| متد و مسیر | بدنه / پاسخ |
|---|---|
| `POST /auth/otp/send` | `{phone}` → `{expiresIn}` |
| `POST /auth/otp/verify` | `{phone, code, termsAcceptedAt}` → `{token, user}` |
| `GET /me` · `PUT /me` | user: `{id, phone, role, firstName, lastName, fatherName, gender, nationality, docType, docNumber, docIssueDate, docExpiryDate, birthDate, address, documents:[{name,size}\|null ×2], editsLeft, verificationStatus, specialNumber?}` |
| `POST /me/documents` | multipart `slot` (0/1), `file` (JPG/PNG ≤ 500KB) → user |
| `DELETE /me/documents/:slot` | → user |
| `GET /verification/challenge?lang=fa\|en` | → `{id, sentence}` |
| `POST /verification` | multipart `challengeId`, `selfie`, `video` → `{status, trackingCode}` |
| `GET /verification/me` | → `{status, submittedAt, rejectionReason, trackingCode, specialNumber}` |
| `POST /special-number/otp/send` · `/otp/verify` | `{phone}` · `{phone, code}` → `{ticket}` |
| `POST /special-number/card` | `{ticket, number}` → `{fullName, nationality, docType, docNumber, specialNumber, issuedAt}` |
| `GET /admin/stats` | `{users, pending, approved, rejected}` |
| `GET /admin/users?search=` · `PATCH /admin/users/:id/role` | `{role: "user"\|"admin"}` |
| `GET /admin/verifications?status=` · `GET /admin/verifications/:id` | شامل `selfieUrl`, `videoUrl`, `documentUrls[]` |
| `POST /admin/verifications/:id/decision` | `{decision: "approve"\|"reject", reason}` — در تأیید، بک‌اند شماره‌ی اختصاصی را صادر می‌کند |

`docType`: `amayesh | passport | foreign_id_card | refugee_booklet | residence_booklet | smart_card`. وضعیت‌ها: `not_started | pending | approved | rejected`. خطا: `{code, message}` با کد HTTP مناسب؛ `code`های شناخته‌شده در `errors.*` دیکشنری ترجمه می‌شوند (مثل `INVALID_CODE`, `CODE_EXPIRED`, `SESSION_EXPIRED`, `EDIT_LIMIT`, `NUMBER_MISMATCH`).

## نکات · Notes
- **قوانین سمت سرور:** مهلت ۳۰ دقیقه، سقف ۳ ویرایش و «۳۰ دقیقه صبر پس از قطع شدن» در رابط نمایش داده می‌شوند، ولی اعمال واقعی‌شان با بک‌اند است. The 30-minute window, 3-edit limit and wait rule are shown in the UI but must be enforced by the backend.
- `middleware.js` فقط محافظ UX است؛ کنترل دسترسی واقعی باید در بک‌اند باشد. Real authorization belongs to the backend.
- توکن فعلاً در localStorage است؛ برای محیط واقعی کوکی `httpOnly` بهتر است.
- اطلاعات تماس (`src/config/site.js`) نمونه‌اند؛ متن پاپ‌آپ و مقاله‌ها از محتوای ارسالی شما آمده و ترجمه‌ی انگلیسی آن‌ها را مرور کنید.
- فونت: فایل‌های `IRANYekan-Regular/Medium/Bold.woff2` را در `public/fonts/` بگذارید.
- ضبط دوربین فقط روی HTTPS (یا localhost) کار می‌کند؛ در آیفون از Safari استفاده کنید.
