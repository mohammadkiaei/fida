import "../globals.css";
import { AuthProvider } from "@/lib/auth";
import { ToastProvider } from "@/components/Toast";
import { I18nProvider } from "@/i18n/I18nProvider";
import { createI18n } from "@/i18n";
import { dirOf, locales } from "@/i18n/config";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }) {
  const { t } = createI18n(params.locale);
  return {
    title: { default: t("meta.title"), template: `%s | ${t("common.siteName")}` },
    description: t("meta.description"),
    alternates: { languages: { fa: "/fa", en: "/en" } },
  };
}

export const viewport = { themeColor: "#0B2530" };

export default function RootLayout({ children, params }) {
  const { locale } = params;
  return (
    <html lang={locale} dir={dirOf(locale)}>
      <body>
        <I18nProvider locale={locale}>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
