import Link from "next/link";
import { listArticles } from "@/content/articles";
import { createI18n } from "@/i18n";

export function generateMetadata({ params }) {
  const { t } = createI18n(params.locale);
  return { title: t("meta.learnTitle"), description: t("meta.learnDesc") };
}

export default function LearnPage({ params }) {
  const { t, n, href, locale, date } = createI18n(params.locale);
  return (
    <div className="container-page py-16">
      <h1 className="text-4xl font-bold text-deep">{t("learn.title")}</h1>
      <p className="mt-4 max-w-2xl leading-9 text-muted">{t("learn.intro")}</p>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {listArticles(locale).map((a) => (
          <article key={a.slug} className="rounded-xl border border-line p-6 transition-colors hover:border-brand">
            <h2 className="text-xl font-bold text-deep">
              <Link href={href(`/learn/${a.slug}`)} className="hover:text-brand">{a.title}</Link>
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted">{a.excerpt}</p>
            <p className="mt-4 text-xs text-muted">
              {t("learn.minutes", { m: n(a.readingMinutes) })} · {t("learn.updated")}: {date(a.updatedAt)}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
