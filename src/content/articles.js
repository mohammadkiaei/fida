import { rules } from "@/content/rules";

// Guide articles. Persian text is the client's; English is a translation.
// Replace/extend freely — or load these from the backend / a CMS later.
export const articles = [
  {
    slug: "registration-steps",
    readingMinutes: 4,
    updatedAt: "2026-10-14",
    fa: {
      title: "مراحل ثبت‌نام شماره اختصاصی",
      excerpt: "از تهیه‌ی سیم‌کارت تا دریافت شناسه‌ی پیگیری؛ یازده مرحله‌ی ثبت‌نام به ترتیب.",
      sections: [
        {
          heading: "مراحل",
          ordered: true,
          list: [
            "تهیه یک عدد سیم‌کارت ایرانی فعال و در دسترس و یک عدد گوشی تلفن همراه مجهز به دوربین.",
            "ورود به سایت www.fida.ir.",
            "انتخاب زبان برنامه.",
            "ثبت شماره تلفن همراه در بخش مربوطه و درج شناسه‌ی تأیید ارسالی از سوی سامانه.",
            "درج کامل و دقیق مشخصات مندرج بر روی مدرک شناسایی متقاضی (گذرنامه) در فیلدهای مربوطه.",
            "بارگذاری تصویر مدرک شناسایی متقاضی در محل تعیین‌شده؛ عکس و سایر مشخصات مندرج بر روی مدرک باید واضح و خوانا باشد و چنانچه اطلاعات مدرک در دو صفحه ثبت گردیده، بارگذاری هر دو صفحه ضروری است.",
            "تعیین جنسیت متقاضی در محل تعیین‌شده.",
            "تکمیل سایر اطلاعات مربوط به تابعیت و آدرس محل اسکان در ایران؛ پر کردن تمامی فیلدهایی که با علامت * یا رنگ قرمز مشخص شده الزامی است.",
            "اخذ تصویر برخط (Online) چهره‌ی متقاضی (Selfie) توسط دوربین گوشی مطابق با روش اعلامی توسط سامانه.",
            "ضبط فیلم برخط (Online) متقاضی توسط دوربین گوشی مطابق با روش اعلامی توسط سامانه.",
            "دریافت شناسه‌ی پیگیری مربوط به ثبت‌نام متقاضی که توسط سامانه ارسال می‌گردد.",
          ],
        },
      ],
    },
    en: {
      title: "Special number registration steps",
      excerpt: "From getting a SIM card to receiving your tracking ID — the eleven registration steps in order.",
      sections: [
        {
          heading: "Steps",
          ordered: true,
          list: [
            "Prepare an active Iranian SIM card and a mobile phone equipped with a camera.",
            "Go to www.fida.ir.",
            "Choose the application language.",
            "Enter your mobile phone number in the relevant field and enter the verification code sent by the system.",
            "Enter, completely and accurately, the details printed on the applicant's identification document (passport) in the relevant fields.",
            "Upload an image of the applicant's identification document in the designated place. The photo and other details on the document must be clear and legible, and if the document's information spans two pages, uploading both pages is mandatory.",
            "Select the applicant's gender in the designated place.",
            "Complete the other information about nationality and your residence address in Iran. All fields marked with * or in red are mandatory.",
            "Take a live (online) selfie of the applicant's face with the phone camera, following the method indicated by the system.",
            "Record a live (online) video of the applicant with the phone camera, following the method indicated by the system.",
            "Receive the tracking ID for the applicant's registration, which is sent by the system.",
          ],
        },
      ],
    },
  },
  {
    slug: "sim-card-follow-up",
    readingMinutes: 4,
    updatedAt: "2026-10-14",
    fa: {
      title: "نکات مهم برای پیگیری سیم‌کارت",
      excerpt: "اتباع متقاضی شماره اختصاصی به‌منظور پیگیری سیم‌کارت، این دوازده نکته را بخوانند.",
      sections: [
        {
          heading: "دوازده نکته",
          ordered: true,
          list: [
            "جهت ثبت‌نام یک سیم‌کارت فعال در دسترس باشد تا تمامی پیام‌ها به همان سیم‌کارت ارسال گردد.",
            "به هنگام شروع ثبت‌نام یک مهلت زمانی به شما تخصیص داده می‌شود که مجاز به انجام ثبت‌نام تا ۳۰ دقیقه هستید. اگر به دلایلی مانند قطع اینترنت یا زدن دکمه‌ی برگشت نتوانستید ثبت‌نام را کامل کنید، باید تا نیم ساعت صبر کنید و مجدداً ثبت‌نام نمایید.",
            "پس از دریافت پیامک کد پیگیری، منتظر تأیید یا عدم تأیید درخواست باشید. هرگز مجدداً درخواست جدید ثبت نگردد.",
            "ویرایش درخواست شما تا سه مرحله امکان‌پذیر است؛ پس از آن می‌بایست نسبت به ثبت درخواست جدید اقدام نمایید.",
            "در صورت مشاهده‌ی پیام «ثبت‌نام شما برای بار آخر ناموفق بود. مجدداً ثبت‌نام کنید.» از مرحله‌ی اول نسبت به ثبت درخواست اقدام فرمایید.",
            "پس از اخذ شماره اختصاصی، جهت فعال‌سازی سیم‌کارت به اپراتور مورد نظر مراجعه فرمایید. لازم به ذکر است شماره اختصاصی به‌صورت خودکار برای فعال‌سازی به مخابرات اعلام خواهد شد.",
            "اپراتور می‌بایست با مشاهده‌ی پیامک شماره اختصاصی، سیم‌کارت شما را فعال نماید؛ در غیر این‌صورت با شماره‌ی ۱۹۵ تماس بگیرید و شکایت خود را ثبت نمایید.",
            "در صورت داشتن گوشی آیفون، جهت ثبت‌نام حتماً از مرورگر سافاری استفاده نمایید.",
            "قبل از ثبت‌نام از فعال بودن دوربین عکاسی در مرورگر مورد نظر اطمینان پیدا کنید و سپس مراحل ثبت‌نام را آغاز نمایید.",
            "هنگام تکمیل فیلد آدرس، فقط از حروف و اعداد استفاده کنید و از هیچ‌یک از علائم نگارشی (نقطه، ویرگول، خط فاصله و سایر علامت‌ها) استفاده نفرمایید.",
            "هنگام تکمیل فیلدهای تاریخ، حتماً از تقویم استفاده نمایید.",
            "پس از دریافت شماره پیگیری، منتظر صدور شماره اختصاصی باشید. به دلیل صرف زمان جهت بررسی مدارک توسط کارشناسان و ارائه‌ی شماره اختصاصی، از ثبت‌نام مجدد خودداری نمایید.",
          ],
        },
      ],
    },
    en: {
      title: "Important notes for following up your SIM card",
      excerpt: "Nationals applying for a special number should read these twelve notes about following up on their SIM card.",
      sections: [
        {
          heading: "Twelve notes",
          ordered: true,
          list: [
            "Have an active SIM card available when registering, so that all messages are sent to that SIM card.",
            "When you start registering, a time limit is assigned to you: you may register for up to 30 minutes. If you could not complete registration — for example because the internet disconnected or you pressed the back button — you must wait half an hour and then register again.",
            "After you receive the SMS with your tracking code, wait for your request to be approved or rejected. Never submit a new request.",
            "Your request can be edited up to three times; after that you must submit a new request.",
            "If you see the message “Your registration was unsuccessful for the last time. Please register again.”, submit your request again from the first step.",
            "After you receive your special number, go to your chosen operator to activate the SIM card. The special number is automatically reported to the telecom company for activation.",
            "The operator must activate your SIM card once it sees the special-number SMS. Otherwise, call 195 and register your complaint.",
            "If you have an iPhone, be sure to use the Safari browser to register.",
            "Before registering, make sure the camera is enabled in your browser, then start the registration steps.",
            "When filling in the address field, use only letters and digits. Do not use any punctuation (period, comma, hyphen or other symbols).",
            "When filling in date fields, always use the calendar.",
            "After receiving the tracking number, wait for your special number to be issued. Because experts need time to review the documents and issue the special number, please do not register again.",
          ],
        },
      ],
    },
  },
  {
    slug: "valid-documents",
    readingMinutes: 4,
    updatedAt: "2026-10-14",
    fa: {
      title: "مدارک معتبر و نحوه‌ی ارسال تصاویر",
      excerpt: "پیش از شروع ثبت‌نام بخوانید: چه مدارکی معتبر است و تصاویر باید چگونه ارسال شود.",
      sections: rules.fa.groups.map((g) => ({ heading: g.title, list: g.items })),
    },
    en: {
      title: "Valid documents and how to submit images",
      excerpt: "Read before you start: which documents are accepted and how the images must be submitted.",
      sections: rules.en.groups.map((g) => ({ heading: g.title, list: g.items })),
    },
  },
  {
    slug: "selfie-and-video-tips",
    readingMinutes: 3,
    updatedAt: "2026-10-14",
    fa: {
      title: "نکاتی برای گرفتن سلفی و ضبط ویدیو",
      excerpt: "با رعایت چند نکته‌ی ساده، احتمال تأیید در بار اول بالاتر می‌رود.",
      sections: [
        {
          heading: "قبل از شروع",
          list: [
            "در جایی با نور کافی بنشینید و نور اصلی از روبه‌رو یا کنار باشد، نه از پشت سر.",
            "محیطی ساکت انتخاب کنید تا صدای شما واضح ضبط شود.",
            "هنگام درخواست مرورگر، اجازه‌ی دسترسی به دوربین و میکروفن را بدهید. در آیفون از Safari استفاده کنید.",
          ],
        },
        {
          heading: "هنگام ضبط",
          paragraphs: [
            "صورت‌تان کامل در قاب باشد و دوربین را مستقیم نگاه کنید. سلفی باید زنده گرفته شود؛ ارسال عکس قدیمی ممکن نیست.",
            "جمله‌ی نمایش‌داده‌شده را کامل، شمرده و با صدای بلند بخوانید. جمله هر بار تغییر می‌کند و باید همان را بخوانید.",
            "اگر از نتیجه راضی نبودید، پیش از ارسال می‌توانید دوباره بگیرید یا ضبط کنید.",
          ],
        },
      ],
    },
    en: {
      title: "Tips for taking the selfie and recording the video",
      excerpt: "A few simple habits make approval on the first try more likely.",
      sections: [
        {
          heading: "Before you start",
          list: [
            "Sit somewhere well lit, with the main light in front of or beside you — not behind you.",
            "Choose a quiet place so your voice is recorded clearly.",
            "Allow camera and microphone access when the browser asks. On iPhone, use Safari.",
          ],
        },
        {
          heading: "While recording",
          paragraphs: [
            "Keep your whole face inside the frame and look straight at the camera. The selfie must be taken live; uploading an old photo is not possible.",
            "Read the sentence shown on screen completely, slowly and out loud. The sentence changes every time, and you must read the one you are given.",
            "If you are not happy with the result, you can retake the photo or video before sending.",
          ],
        },
      ],
    },
  },
  {
    slug: "request-status",
    readingMinutes: 2,
    updatedAt: "2026-10-14",
    fa: {
      title: "وضعیت درخواست شما یعنی چه؟",
      excerpt: "درخواست شما پس از ارسال یکی از چهار وضعیت را دارد.",
      sections: [
        {
          heading: "وضعیت‌ها",
          list: [
            "شروع نشده: هنوز ثبت‌نام را کامل نکرده‌اید.",
            "در انتظار بررسی: مدارک، سلفی و ویدیو دریافت شده و کارشناسان در حال بررسی‌اند. درخواست جدید ثبت نکنید.",
            "تأییدشده: شماره اختصاصی شما صادر شده است.",
            "ردشده: دلیل رد در پنل نوشته می‌شود؛ مشکل را برطرف کنید و طبق قوانین ویرایش یا درخواست جدید ثبت کنید.",
          ],
        },
        {
          heading: "دریافت برگه‌ی شماره اختصاصی",
          paragraphs: ["پس از تأیید، از بخش «دریافت شماره اختصاصی» با شماره‌ی موبایل و کد پیامکی می‌توانید برگه‌ی خود را ببینید و چاپ کنید."],
        },
      ],
    },
    en: {
      title: "What does your request status mean?",
      excerpt: "After submission, your request has one of four statuses.",
      sections: [
        {
          heading: "Statuses",
          list: [
            "Not started: you have not completed the registration yet.",
            "Pending review: your documents, selfie and video were received and experts are reviewing them. Do not submit a new request.",
            "Approved: your special number has been issued.",
            "Rejected: the reason is written in your panel; fix the problem and edit or submit a new request according to the rules.",
          ],
        },
        {
          heading: "Getting your special-number sheet",
          paragraphs: ["Once approved, use the “Get your special number” section with your mobile number and SMS code to view and print your sheet."],
        },
      ],
    },
  },
];

export const getArticle = (slug, locale) => {
  const a = articles.find((x) => x.slug === slug);
  return a ? { slug: a.slug, readingMinutes: a.readingMinutes, updatedAt: a.updatedAt, ...(a[locale] || a.fa) } : null;
};

export const listArticles = (locale) => articles.map((a) => ({ slug: a.slug, readingMinutes: a.readingMinutes, updatedAt: a.updatedAt, ...(a[locale] || a.fa) }));
