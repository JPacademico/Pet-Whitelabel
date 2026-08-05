import { Suspense } from 'react';
import { Outlet, useLocation, ScrollRestoration } from 'react-router';
import { Header } from './Header';
import { Footer } from './Footer';
import { WhatsAppFab } from './WhatsAppFab';
import { PageLoadingFallback } from './PageLoadingFallback';

export function PublicLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden bg-cream">
      <Header />
      {/* Keying on pathname remounts <main> per route, which restarts the CSS enter animation.
       * `prefers-reduced-motion` neutralises it globally (see tokens.css). */}
      <main key={location.pathname} className="ds-page-enter flex-1">
        <Suspense fallback={<PageLoadingFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <WhatsAppFab />
      <ScrollRestoration />
    </div>
  );
}
