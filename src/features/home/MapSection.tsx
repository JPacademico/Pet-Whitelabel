import { lazy, Suspense, useState } from 'react';
import { MapPin } from 'lucide-react';
import { SITE } from '@/config/site';

const LazyLeafletMap = lazy(() => import('./LazyLeafletMap'));

// The interactive map only loads Leaflet + OSM tiles (a real network cost) once the visitor asks
// for it — a static preview keeps the Home page's LCP fast. See IMPLEMENTATION_PLAN.md §5.1.
export function MapSection() {
  const [showMap, setShowMap] = useState(false);

  return (
    <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <h2 className="text-center font-display text-2xl font-bold text-charcoal sm:text-3xl">
        Onde estamos
      </h2>
      <p className="mx-auto mt-2 max-w-md text-center text-muted">
        {SITE.address.street} — {SITE.address.neighborhood}, {SITE.address.city}/{SITE.address.state}
      </p>

      <div className="relative mt-6 overflow-hidden rounded-2xl">
        {showMap ? (
          <Suspense
            fallback={<div className="h-80 w-full animate-pulse rounded-2xl bg-cream-deep sm:h-96" />}
          >
            <LazyLeafletMap />
          </Suspense>
        ) : (
          <button
            type="button"
            onClick={() => setShowMap(true)}
            className="relative flex h-80 w-full flex-col items-center justify-center gap-3 rounded-2xl bg-cream-deep transition-colors hover:bg-amber-soft sm:h-96"
          >
            <MapPin className="size-10 text-teal" aria-hidden="true" />
            <span className="inline-flex min-h-11 items-center justify-center rounded-full bg-teal px-6 py-2.5 font-semibold text-white">
              Ver mapa interativo
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
