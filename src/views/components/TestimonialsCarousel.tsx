"use client";

import { useEffect, useState } from "react";

export interface TestimonialItem {
  id: string;
  authorName: string;
  authorRole: string | null;
  quote: string;
  rating: number | null;
}

function Stars({ value }: { value: number | null }) {
  if (!value) return null;
  return (
    <div className="mb-4 flex justify-center gap-0.5 text-[15px] text-seal" aria-label={`${value} sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < value ? "" : "text-line"}>
          ★
        </span>
      ))}
    </div>
  );
}

/**
 * Carrousel d'avis — ne s'affiche que s'il y a au moins un avis publié (voir
 * repositories/testimonials.ts et la note dans /admin/testimonials) : jamais de faux avis
 * inventés comme contenu par défaut.
 */
export default function TestimonialsCarousel({ testimonials }: { testimonials: TestimonialItem[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (testimonials.length <= 1 || paused) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % testimonials.length), 6000);
    return () => clearInterval(timer);
  }, [testimonials.length, paused]);

  if (testimonials.length === 0) return null;

  const current = testimonials[index % testimonials.length];

  return (
    <section className="bg-mist py-20">
      <div
        className="mx-auto max-w-[720px] px-[22px] text-center"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <span className="mb-3 inline-flex items-center gap-2 text-[13.5px] font-semibold text-blue">
          <span className="h-0.5 w-5.5 rounded bg-blue" />
          Avis clients
        </span>
        <h2 className="mb-10 text-[clamp(24px,3vw,32px)] text-navy">Ce qu&apos;en disent nos clients</h2>

        <div role="region" aria-live="polite">
          <svg className="mx-auto mb-5 h-9 w-9 text-seal opacity-70" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
            <path d="M10 8C5.6 8 2 11.6 2 16s3.6 8 8 8h1v-4h-1c-2.2 0-4-1.8-4-4s1.8-4 4-4h1V8h-1zm14 0c-4.4 0-8 3.6-8 8s3.6 8 8 8h1v-4h-1c-2.2 0-4-1.8-4-4s1.8-4 4-4h1V8h-1z" />
          </svg>

          <Stars value={current.rating} />

          <p className="min-h-[80px] font-serif text-[19px] italic leading-snug text-navy sm:text-[21px]">
            {current.quote}
          </p>

          <p className="mt-5 text-[14.5px] font-semibold text-navy">{current.authorName}</p>
          {current.authorRole && <p className="text-[13px] text-muted">{current.authorRole}</p>}
        </div>

        {testimonials.length > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length)}
              aria-label="Avis précédent"
              className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-navy transition-colors hover:border-blue"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>

            <div className="flex items-center gap-2">
              {testimonials.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Voir l'avis ${i + 1}`}
                  aria-current={i === index}
                  className={`h-2 rounded-full transition-all ${i === index ? "w-5 bg-blue" : "w-2 bg-line hover:bg-muted"}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIndex((i) => (i + 1) % testimonials.length)}
              aria-label="Avis suivant"
              className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-navy transition-colors hover:border-blue"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
