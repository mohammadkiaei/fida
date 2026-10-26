import Link from "next/link";
import Logo from "@/components/Logo";
import { site } from "@/config/site";

export default function SiteFooter({ i18n }) {
  const { t, href, locale } = i18n;
  const c = site.contact[locale];
  return (
    <footer className="bg-ink text-white/80 print:hidden">
      <div className="container-page grid gap-8 py-12 md:grid-cols-3">
        <div className="space-y-3">
          <Logo className="text-white" />
          <p className="max-w-xs text-sm leading-7">{t("common.tagline")}</p>
        </div>
        <nav aria-label={t("footer.navLabel")} className="space-y-2 text-sm">
          <p className="mb-3 font-medium text-white">{t("footer.quick")}</p>
          <Link href={href("/learn")} className="block hover:text-white">{t("nav.learn")}</Link>
          <Link href={href("/receive-number")} className="block hover:text-white">{t("nav.receive")}</Link>
          <Link href={href("/#faq")} className="block hover:text-white">{t("footer.faq")}</Link>
          <Link href={href("/login")} className="block hover:text-white">{t("nav.login")}</Link>
        </nav>
        <div className="space-y-2 text-sm">
          <p className="mb-3 font-medium text-white">{t("footer.contact")}</p>
          <p>{c.phone}</p>
          <p>{c.email}</p>
          <p>{c.address}</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">{t("footer.rights")}</div>
    </footer>
  );
}
