import Link from "next/link";
import { notFound } from "next/navigation";
import Button from "@/components/Button";
import { articles, getArticle, listArticles } from "@/content/articles";
import { createI18n } from "@/i18n";
import { locales } from "@/i18n/config";

export function generateStaticParams() {
  return locales.flatMap((locale) => articles.map((a) => ({ locale, slug: a.slug })));
}

export function generateMetadata({ params }) {
  const a = getArticle(params.slug, params.locale);
  return a ? { title: a.title, description: a.excerpt } : {};
}

export default function ArticlePage({ params }) {
  const { t, n, href, date, locale } = createI18n(params.locale);
  const a = getArticle(params.slug, locale);
  if (!a) notFound();
  const others = listArticles(locale).filter((x) => x.slug !== a.slug).slice(0, 4);

  return (
    <div className="container-page py-14">
      <nav aria-label={t("learn.breadcrumb")} className="mb-8 text-sm text-muted">
        <Link href={href("/learn")} className="hover:text-brand">{t("nav.learn")}</Link>
        <span className="mx-2" aria-hidden="true">/</span>
        <span>{a.title}</span>
      </nav>
      <div className="grid gap-12 lg:grid-cols-[1fr_18rem]">
        <article className="max-w-2xl">
          <h1 className="text-3xl font-bold leading-[1.6] text-deep sm:text-4xl sm:leading-[1.6]">{a.title}</h1>
          <p className="mt-3 text-sm text-muted">
            {t("learn.minutes", { m: n(a.readingMinutes) })} · {t("learn.updated")}: {date(a.updatedAt)}
          </p>
          <p className="mt-6 text-lg leading-9 text-muted">{a.excerpt}</p>
          {a.sections.map((s) => {
            const List = s.ordered ? "ol" : "ul";
            return (
              <section key={s.heading} className="mt-10">
                <h2 className="text-2xl font-bold text-deep">{s.heading}</h2>
                {s.paragraphs?.map((p) => (
                  <p key={p} className="mt-4 leading-9">{p}</p>
                ))}
                {s.list && (
                  <List className={`mt-4 space-y-3 ps-6 leading-9 marker:text-brand ${s.ordered ? "list-decimal" : "list-disc"}`}>
                    {s.list.map((li) => (
                      <li key={li}>{li}</li>
                    ))}
                  </List>
                )}
              </section>
            );
          })}
          <div className="mt-12 rounded-xl bg-mist p-6">
            <p className="font-bold text-deep">{t("learn.cta")}</p>
            <Button href={href("/login")} className="mt-4">{t("nav.login")}</Button>
          </div>
        </article>
        <aside aria-label={t("learn.others")} className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="mb-4 font-bold text-deep">{t("learn.others")}</h2>
          <ul className="space-y-3">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={href(`/learn/${o.slug}`)} className="block rounded-lg border border-line p-4 text-sm hover:border-brand">{o.title}</Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
