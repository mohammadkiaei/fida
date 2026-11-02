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

Mock password login uses the demo password `fida-demo` for seeded users. This is only for local UI demonstration; production credentials and password reset/creation are owned by the backend.

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
| `/login` | **پاپ‌آپ قوانین + چک‌باکس تأیید** ← ورود با OTP یا نام کاربری/گذرواژه |
| `/receive-number` | دریافت شماره اختصاصی در ۴ مرحله: موبایل ← کد ← شماره اختصاصی ← دریافت و چاپ کارت |
| `/panel` | داشبورد، وضعیت، شناسه‌ی پیگیری، شماره‌ی اختصاصی |
| `/panel/verify` | **ویزارد ۴ مرحله‌ای:** ۱) مدارک هویتی که هنگام انتخاب آپلود می‌شوند (تا ۶ صفحه با پیش‌نمایش) ← ۲) ذخیره‌ی مشخصات هنگام ادامه ← ۳) آپلود و اعتبارسنجی جداگانه‌ی سلفی پیش از ادامه ← ۴) ویدیوی کامل پس از تأیید ضبط ارسال می‌شود. هنگام ضبط سه الگوی تصادفی دست از تصاویر `public/images/hand-patterns/`، دستور گفتن عدد، فلش چرخش سر و علامت لبخند روی پیش‌نمایش دوربین نمایش داده می‌شوند. |
| `/panel/legal-entity` | فهرست پرونده‌های شخصیت حقوقی قبلی با وضعیت تکمیل/پیش‌نویس؛ ساخت پرونده‌ی جدید؛ بازکردن فرم جداگانه برای نمایش و تکمیل هر پرونده و مدارک آن |
| ابزار شناور پشتیبانی در همه‌ی صفحات | چت شبیه پیام‌رسان با تاریخچه‌ی محلی، انتخاب دستیار هوشمند یا پشتیبانی انسانی؛ برای مهمان و کاربر واردشده |
| `/panel/support` | صفحه‌ی راهنما برای بازکردن ابزار پشتیبانی شناور |
| `/panel/payment-result` | استعلام نتیجه‌ی پرداخت از بک‌اند و نمایش وضعیت و کد رهگیری |
| `/admin`, `/admin/requests[/id]`, `/admin/users` | آمار، بررسی درخواست (سلفی، ویدیو، مدارک) و تأیید/رد، نقش کاربران |

## اتصال به بک‌اند · Backend contract
`NEXT_PUBLIC_API_BASE_URL` را در `.env.local` بگذارید؛ همه‌ی فراخوانی‌ها در `src/lib/api.js` هستند.

| متد و مسیر | بدنه / پاسخ |
|---|---|
| `GET /public/martyr-of-day` | بدون ورود؛ روایت روز جاری در منطقه‌ی زمانی مورد استفاده‌ی سامانه: `{id, date, name, nationality, birthDate?, deathDate?, imageUrl?, biography, sourceTitle?, sourceUrl?}`. بک‌اند هر روز رکورد همان روز را برگرداند؛ در نبود داده UI پیام «هنوز منتشر نشده» نشان می‌دهد. |
| `POST /auth/otp/send` | `{phone}` → `{expiresIn}` |
| `POST /auth/otp/verify` | `{phone, code, termsAcceptedAt}` → `{token, user}` |
| `POST /auth/login` | `{identifier, password}` → `{token, user}` |
| `GET /me` · `PUT /me` | user: `{id, phone, role, firstName, lastName, firstNameFa, lastNameFa, fatherName, fatherNameFa, motherName, motherNameFa, grandfatherName, grandfatherNameFa, motherTongue, challengeLanguage, birthCountry, province, city, gender, nationality, docType, docNumber, docIssueDate, docExpiryDate, birthDate, address, documents:[{name,size,type,url}\|null ×6], editsLeft, verificationStatus, specialNumber?}` |
| `PUT /verification/steps/:step` | ذخیره‌ی مستقل هر مرحله (documents/details/selfie) و پاسخ `{ok, step}` |
| `POST /me/documents` | multipart `slot` (0..5), `file` (JPG/PNG/PDF) → user؛ تصاویر در مرورگر به JPEG و حداکثر ۵۰۰KB فشرده می‌شوند. PDF نیز حداکثر ۵۰۰KB است؛ بک‌اند باید تعداد صفحات را کنترل کند |
| `DELETE /me/documents/:slot` | → user |
| `GET /verification/challenge?lang=` | → `{id, sentence, gestures:{handPatterns:[3 numbers], headSequence:[left/right, left/right], smile:true}}`; جمله به زبان انتخاب‌شده‌ی متقاضی ساخته می‌شود |
| `POST /verification/selfie` | بعد از ثبت سلفی و پیش از رفتن به مرحله‌ی بعد، multipart `selfie` (JPEG ≤ 500KB) → `{accepted, next}`؛ بررسی کیفیت و تطبیق چهره با تصویر مدارک. در رد، خطا برگرداند و مرحله‌ی ویدیو را مسدود کند |
| `POST /verification/video` | multipart `challengeId`, `video` (≤ 2MB) → `{status, trackingCode}`؛ ویدیو فقط پس از پذیرش سلفی ارسال شود |
| `POST /payments/start` | `{trackingCode, returnUrl?}` → `{paymentId, checkoutUrl}`؛ ایجاد تراکنش و انتقال به درگاه پرداخت |
| `GET /payments/:id/result` | → `{status:"paid"|"failed"|"pending", trackingCode, paidAt?}`؛ وضعیت را از درگاه/دفتر تراکنش سمت سرور استعلام کند و به query بازگشتی اعتماد نکند |
| `GET /legal-entities/me` · `POST /legal-entities/me` | فهرست پرونده‌های کاربر · ایجاد پرونده‌ی پیش‌نویس → entity شامل `id` |
| `GET /legal-entities/me/:id` · `PUT /legal-entities/me/:id` | نمایش/تکمیل یک پرونده و دریافت لینک‌های پیش‌نمایش مدارک · ذخیره‌ی مشخصات همان پرونده |
| `POST /legal-entities/me/:id/documents` | multipart `entityId`, `category`, `pageIndex`, `file` برای هر صفحه؛ مدارک اجباری: مدرک هویتی نماینده، معرفی‌نامه، مدرک تأسیس/ثبت، مجوز فعالیت و اساسنامه |
| `POST /support/messages` | بدون نیاز به ورود برای مهمان؛ `{message, channel: "ai"|"human", visitorId, conversationId?}` → `{conversationId, reply}` یا شناسه/وضعیت صف انسانی. سمت سرور باید گفتگو را به هویت کاربر وصل کند اگر توکن معتبر موجود است و برای مهمان از `visitorId` استفاده کند. |
| `GET /support/conversations/:id/messages?visitorId=&after=` | دریافت پیام‌های تازه‌ی کارشناس برای پنجره‌ی چت مهمان/کاربر؛ UI در حالت پشتیبانی انسانی هر ۵ ثانیه آن را بررسی می‌کند. سرور باید مالکیت گفتگو را با توکن یا `visitorId` بررسی کند. |
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
- برای کاهش حجم رسانه، تصاویر در مرورگر به JPEG با سقف ۵۰۰KB فشرده می‌شوند؛ سلفی پس از ثبت و قبل از ادامه به شکل باینری multipart جداگانه ارسال می‌شود. ویدیو با وضوح هدف 480×640 و نرخ حدود 20fps ضبط و حین ضبط با نرخ بیت 600kbps تصویر و 32kbps صدا فشرده می‌شود؛ ارسال ویدیوهای بزرگ‌تر از ۲MB در رابط و API مسدود است. بک‌اند همچنان باید نوع/حجم واقعی، تعداد صفحات PDF، اسکن بدافزار، نگهداری امن و حذف زمان‌دار فایل‌ها را کنترل کند. برای تطبیق چهره و حرکات دست/سر/لبخند، بک‌اند باید challenge را صادر و محتوای ارسالی را بررسی کند؛ رابط کاربر فقط الگوی درخواست‌شده را نمایش می‌دهد.
- پرداخت در mock فقط برای نمایش رابط تأیید می‌شود؛ پرداخت عملیاتی به اتصال `/payments/start` و callback امن و استعلام سمت بک‌اند از ارائه‌دهنده‌ی درگاه نیاز دارد.
- توکن فعلاً در localStorage است؛ برای محیط واقعی کوکی `httpOnly` بهتر است.
- اطلاعات تماس (`src/config/site.js`) نمونه‌اند؛ متن پاپ‌آپ و مقاله‌ها از محتوای ارسالی شما آمده و ترجمه‌ی انگلیسی آن‌ها را مرور کنید.
- فونت: فایل‌های `IRANYekan-Regular/Medium/Bold.woff2` را در `public/fonts/` بگذارید.
- ضبط دوربین فقط روی HTTPS (یا localhost) کار می‌کند؛ در آیفون از Safari استفاده کنید.
