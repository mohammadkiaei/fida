"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function DailyMartyr({ labels }) {
  const [martyr, setMartyr] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    api.getMartyrOfDay().then((data) => {
      if (active) setMartyr(data?.martyr || data || null);
    }).catch(() => {
      if (active) setMartyr(null);
    }).finally(() => {
      if (active) setLoaded(true);
    });
    return () => { active = false; };
  }, []);

  return (
    <section className="container-page py-12" aria-labelledby="daily-martyr-title">
      <div className="rounded-2xl bg-mist p-6 sm:p-8">
        <p className="text-sm font-semibold text-brand">{labels.eyebrow}</p>
        <h2 id="daily-martyr-title" className="mt-2 text-2xl font-bold text-deep">{labels.title}</h2>
        {martyr ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-[180px_1fr]">
            {martyr.imageUrl && <img src={martyr.imageUrl} alt={martyr.name || labels.title} className="aspect-square w-full rounded-xl object-cover" />}
            <div>
              <h3 className="text-xl font-bold text-ink">{martyr.name}</h3>
              {(martyr.nationality || martyr.birthDate || martyr.deathDate) && <p className="mt-2 text-sm text-muted">{[martyr.nationality, martyr.birthDate, martyr.deathDate].filter(Boolean).join(" · ")}</p>}
              <p className="mt-4 whitespace-pre-line leading-8 text-ink">{martyr.biography}</p>
              {martyr.sourceUrl && <a href={martyr.sourceUrl} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm font-medium text-brand underline">{martyr.sourceTitle || labels.source}</a>}
            </div>
          </div>
        ) : (
          <p className="mt-4 leading-8 text-muted">{loaded ? labels.empty : labels.loading}</p>
        )}
      </div>
    </section>
  );
}
