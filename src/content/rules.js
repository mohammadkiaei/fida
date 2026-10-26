// Registration rules shown in the pre-login popup AND in the "valid documents" guide article.
// Source text supplied by the client; English is a faithful translation.
export const rules = {
  fa: {
    groups: [
      {
        title: "مدارک معتبر",
        items: [
          "امکان ثبت‌نام فقط با مدارک معتبر وجود دارد (گذرنامه، گذرنامه خانواری، کارت آمایش، دفترچه پناهندگی).",
          "در صورت داشتن دفترچه اقامت به دفاتر کفالت مراجعه نمایید.",
          "دفترچه اقامت باید دارای اعتبار باشد.",
          "برای گذرنامه‌های دارای اعتبار (اتباع افغانستان): در قسمت اول تصویر مدرک، صفحه‌ی اول گذرنامه و در قسمت دوم، روادید صادرشده یا تمدید روادید یا ویزای دارای اعتبار ارسال گردد.",
          "برای گذرنامه‌های فاقد اعتبار (اتباع افغانستان): در قسمت اول تصویر مدرک، صفحه‌ی اول گذرنامه و در قسمت دوم، تمدید گذرنامه به همراه تمدید روادید یا ویزای دارای اعتبار ارسال گردد.",
          "عنوان نوع مدرک در کارت آمایش‌های عراقی، «کارت هویت اتباع خارجی» درج می‌گردد.",
        ],
      },
      {
        title: "تصویر مدرک و تصویر چهره",
        items: [
          "تصویر چهره و مدرک به‌صورت صاف و خوانا ارسال شود.",
          "تصویر مدارک به‌صورت رنگی ارسال شود.",
          "تصویر گذرنامه به‌صورت کامل ارسال گردد.",
          "تصویر مدرک ارسالی بدون پس‌زمینه باشد (فقط کادر تصویر مدرک).",
          "لطفاً عکس فرد در قسمت تصویر مدارک ارسال نشود.",
          "عکس فرد به‌صورت سلفی و زنده ارسال شود و در قسمت عکس فرد فقط عکس فرد قرار گیرد.",
          "حجم تصویر عکس و تصویر مدرک حداکثر ۵۰۰ کیلوبایت باشد.",
        ],
      },
      {
        title: "نحوه‌ی ثبت نام و تاریخ‌ها",
        items: [
          "در گذرنامه‌های کشورهای عربی، چنانچه چند اسم به‌طور متوالی نوشته شده باشد، اسم اولیه به‌عنوان نام فرد، اسم دوم به‌عنوان نام پدر و مابقی به‌عنوان نام جد در نظر گرفته می‌شود.",
          "چنانچه در گذرنامه فقط نام باشد و قسمت نام خانوادگی خالی باشد، نام باید در نام خانوادگی تکرار شود و برعکس (اتباع هند، پاکستان و افغانستان).",
          "اگر گذرنامه‌ی خود را تمدید کرده‌اید، در قسمت تاریخ صدور باید تاریخ قدیمی‌تر (اولین بار صدور گذرنامه) را وارد کنید. مثال: اگر در ۱۰ اکتبر ۲۰۱۷ گذرنامه گرفته‌اید تا ۱۰ اکتبر ۲۰۲۲ و مجدد در ۱۰ اکتبر ۲۰۲۲ تا ۱۰ اکتبر ۲۰۲۶ تمدید کرده‌اید، در قسمت تاریخ صدور باید ۱۰ اکتبر ۲۰۱۷ را وارد کنید.",
        ],
      },
      {
        title: "مسئولیت و پیگیری",
        items: [
          "هرگونه مسئولیت اصالت مدارک هویتی ارائه‌شده بر عهده‌ی متقاضی (درخواست‌کننده) است.",
          "در صورت عدم ارسال صحیح اطلاعات، به دلیل لزوم بررسی کارشناسی و وقت صرف‌شده برای آن، امکان استرداد وجه وجود ندارد.",
          "در صورت عدم احراز هویت در دفاتر نمایندگی ایرانسل و همراه اول، به دفاتر مرکزی مراجعه نمایید.",
        ],
      },
    ],
  },
  en: {
    groups: [
      {
        title: "Valid documents",
        items: [
          "Registration is only possible with valid documents (passport, family passport, Amayesh card, refugee booklet).",
          "If you hold a residence booklet, please visit a Kafalat office.",
          "The residence booklet must be valid.",
          "For valid passports (Afghan nationals): in the first document-image field upload the first page of the passport, and in the second field upload the issued visa, the visa extension or a valid visa.",
          "For expired passports (Afghan nationals): in the first document-image field upload the first page of the passport, and in the second field upload the passport extension together with the visa extension or a valid visa.",
          "On Iraqi Amayesh cards, the document type is written as “Foreign Nationals Identity Card”.",
        ],
      },
      {
        title: "Document image and face photo",
        items: [
          "Send the face photo and the document image flat and clearly readable.",
          "Send the document images in colour.",
          "Send the complete image of the passport.",
          "The document image must have no background (only the frame of the document).",
          "Please do not upload the person's photo in the document-image field.",
          "The person's photo must be a live selfie, and the photo field must contain only the person.",
          "The file size of the photo and of each document image must be 500 KB at most.",
        ],
      },
      {
        title: "Names and dates",
        items: [
          "In passports from Arab countries, if several names are written in a row, the first is taken as the person's name, the second as the father's name and the rest as the grandfather's name.",
          "If the passport shows only a given name and the family-name field is empty, repeat the name in the family-name field, and vice versa (nationals of India, Pakistan and Afghanistan).",
          "If you have renewed your passport, enter the older issue date (when the passport was first issued). Example: if you got a passport on 10 October 2017 valid until 10 October 2022 and renewed it on 10 October 2022 until 10 October 2026, enter 10 October 2017 as the issue date.",
        ],
      },
      {
        title: "Responsibility and follow-up",
        items: [
          "The applicant is fully responsible for the authenticity of the identity documents provided.",
          "If information is not submitted correctly, no refund is possible because of the expert review and the time already spent on it.",
          "If your identity is not verified at Irancell or Hamrah-e-Avval (MCI) agency offices, please visit their central offices.",
        ],
      },
    ],
  },
};
