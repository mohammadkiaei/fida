import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { createI18n } from "@/i18n";

export default function SiteLayout({ children, params }) {
  const i18n = createI18n(params.locale);
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3">
        {i18n.t("common.skip")}
      </a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter i18n={i18n} />
    </>
  );
}
