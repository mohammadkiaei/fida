import Link from "next/link";
import Button from "@/components/Button";
import DailyMartyr from "@/components/DailyMartyr";
import { site } from "@/config/site";
import { listArticles } from "@/content/articles";
import { createI18n } from "@/i18n";

export function generateMetadata({ params }) {
  const { t } = createI18n(params.locale);
  return { title: { absolute: t("meta.title") }, description: t("meta.description") };
}

function ViewfinderDemo({ t, n }) {
  const corner = "absolute h-10 w-10 border-brand-light";
  return (
    <div className="relative mx-auto w-full max-w-sm p-6" aria-hidden="true">
      <span className={`${corner} left-0 top-0 rounded-tl-xl border-l-4 border-t-4`} />
      <span className={`${corner} right-0 top-0 rounded-tr-xl border-r-4 border-t-4`} />
      <span className={`${corner} bottom-0 left-0 rounded-bl-xl border-b-4 border-l-4`} />
      <span className={`${corner} bottom-0 right-0 rounded-br-xl border-b-4 border-r-4`} />
      <div className="rounded-lg bg-white/5 p-5 ring-1 ring-white/10">
        <div className="mb-4 flex items-center justify-between text-xs text-white/70">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" /> {t("home.demo.rec")}
          </span>
          <span>{n("00:07")}</span>
        </div>
        <p className="mb-2 text-xs text-white/60">{t("home.demo.label")}</p>
        <p className="text-lg font-bold leading-9 text-white">{t("home.demo.sentence", { n: n(472) })}</p>
        <div className="mt-5 flex h-8 items-end gap-1">
          {[40, 70, 30, 90, 55, 80, 35, 65, 45, 85, 50, 60].map((h, i) => (
            <span key={i} className="w-1.5 flex-1 rounded-full bg-brand-light/70" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomePage({ params }) {
  const { t, n, href, locale } = createI18n(params.locale);
  const c = site.contact[locale];
  const steps = t("home.steps.items");
  const services = t("home.services.items");
  const faqs = t("home.faq.items");
  const latest = listArticles(locale).slice(0, 3);

  return (
    <>
      <section className="bg-ink text-white">
        <div className="container-page grid items-center gap-12 py-16 md:grid-cols-2 md:py-24">
          <div>
            <h1 className="text-4xl font-bold leading-[1.5] sm:text-5xl sm:leading-[1.5]">{t("home.hero.title")}</h1>
            <p className="mt-5 max-w-lg text-lg leading-9 text-white/80">{t("home.hero.text")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={href("/login")} variant="signal" className="px-7 py-3 text-base">{t("home.hero.cta")}</Button>
              <Button href={href("/receive-number")} variant="outline" className="border-white/30 px-7 py-3 text-base text-white hover:bg-white/10">
                {t("nav.receive")}
              </Button>
            </div>
          </div>
          <ViewfinderDemo t={t} n={n} />
        </div>
      </section>

      <DailyMartyr labels={{ eyebrow: t("home.martyr.eyebrow"), title: t("home.martyr.title"), loading: t("home.martyr.loading"), empty: t("home.martyr.empty"), source: t("home.martyr.source") }} />

      <section id="what" className="container-page py-20">
        <div className="grid items-center gap-10 md:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <h2 className="text-3xl font-bold leading-[1.6] text-deep">{t("home.what.title")}</h2>
            <p className="mt-5 leading-9 text-muted">{t("home.what.text")}</p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/fida-portal.jpg"
            width={941}
            height={941}
            loading="lazy"
            alt={t("home.what.imageAlt")}
            className="mx-auto aspect-square w-full max-w-md rounded-2xl object-cover shadow-lg ring-1 ring-line"
          />
        </div>
        <div className="mt-12 rounded-2xl bg-mist p-7">
          <h3 className="font-bold text-deep">{t("home.services.title")}</h3>
          <ul className="mt-4 grid gap-x-10 gap-y-3 text-sm leading-7 md:grid-cols-2">
            {services.map((s) => (
              <li key={s} className="flex gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="steps" className="bg-mist py-20">
        <div className="container-page">
          <h2 className="text-3xl font-bold text-deep">{t("home.steps.title")}</h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-2">
            {steps.map((s, i) => (
              <li key={s} className="flex gap-4 rounded-xl bg-white p-5 ring-1 ring-line">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">{n(i + 1)}</span>
                <p className="text-sm leading-7">{s}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={href("/login")}>{t("home.hero.cta")}</Button>
            <Button href={href("/learn/valid-documents")} variant="outline">{t("home.steps.docs")}</Button>
          </div>
        </div>
      </section>

      <section id="video" className="container-page py-20">
        <h2 className="text-3xl font-bold text-deep">{t("home.video.title")}</h2>
        <p className="mt-3 max-w-2xl leading-8 text-muted">{t("home.video.text")}</p>
        <div className="mt-8 aspect-video w-full max-w-3xl overflow-hidden rounded-2xl bg-ink ring-1 ring-line">
          <iframe
            src={site.videoEmbed}
            title={t("home.video.title")}
            loading="lazy"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      </section>

      <section id="sim" className="bg-deep py-16 text-white">
        <div className="container-page grid items-center gap-6 md:grid-cols-[2fr_1fr]">
          <div>
            <h2 className="text-2xl font-bold">{t("home.sim.title")}</h2>
            <p className="mt-3 max-w-2xl leading-8 text-white/80">{t("home.sim.text")}</p>
          </div>
          <div className="md:text-end">
            <Button href={href("/learn/sim-card-follow-up")} variant="signal">{t("home.sim.cta")}</Button>
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl font-bold text-deep">{t("home.learn.title")}</h2>
          <Link href={href("/learn")} className="text-sm font-medium text-brand hover:underline">{t("home.learn.all")}</Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {latest.map((a) => (
            <Link key={a.slug} href={href(`/learn/${a.slug}`)} className="group rounded-xl border border-line p-6 transition-colors hover:border-brand">
              <h3 className="font-bold text-deep group-hover:text-brand">{a.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{a.excerpt}</p>
              <p className="mt-4 text-xs text-muted">{t("learn.minutes", { m: n(a.readingMinutes) })}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="receive" className="bg-mist py-16">
        <div className="container-page grid items-center gap-6 md:grid-cols-[2fr_1fr]">
          <div>
            <h2 className="text-2xl font-bold text-deep">{t("home.receive.title")}</h2>
            <p className="mt-3 max-w-2xl leading-8 text-muted">{t("home.receive.text")}</p>
          </div>
          <div className="md:text-end">
            <Button href={href("/receive-number")}>{t("home.receive.cta")}</Button>
          </div>
        </div>
      </section>

      <section id="faq" className="py-20">
        <div className="container-page max-w-3xl">
          <h2 className="text-3xl font-bold text-deep">{t("home.faq.title")}</h2>
          <div className="mt-8 divide-y divide-line rounded-xl ring-1 ring-line">
            {faqs.map((f) => (
              <details key={f.q} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-deep">
                  {f.q}
                  <span className="text-brand transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 text-sm leading-7 text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="container-page grid gap-10 pb-20 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold text-deep">{t("home.about.title")}</h2>
          <p className="mt-5 leading-9 text-muted">{t("home.about.text")}</p>
        </div>
        <div id="contact" className="rounded-xl border border-line p-6">
          <h2 className="text-xl font-bold text-deep">{t("home.contact.title")}</h2>
          <dl className="mt-5 space-y-4 text-sm">
            {[["phone", c.phone], ["email", c.email], ["address", c.address], ["hours", c.hours]].map(([k, v]) => (
              <div key={k} className="flex gap-4">
                <dt className="w-28 shrink-0 text-muted">{t(`home.contact.${k}`)}</dt>
                <dd className="font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
