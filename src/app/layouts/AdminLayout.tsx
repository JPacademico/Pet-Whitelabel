import { useCallback, useEffect, useState } from 'react';
import { NavLink, Navigate, Outlet, useLocation } from 'react-router';
import {
  ArrowUp,
  CalendarClock,
  CalendarCog,
  ExternalLink,
  Images,
  LayoutDashboard,
  LogOut,
  PawPrint,
  ShoppingBag,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { productRepository, bookingRepository } from '@/data/repositories';
import { useLiveQuery } from '@/lib/useLiveQuery';
import { nowInBusinessTz, todayIsoDate } from '@/lib/datetime';
import { cn } from '@/lib/cn';
import { PageLoadingFallback } from './PageLoadingFallback';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
  /** Which live counter feeds this item's badge, if any. */
  badge?: 'todayBookings' | 'outOfStock';
}

const NAV_ITEMS: NavItem[] = [
  { to: '/admin', label: 'Painel', icon: LayoutDashboard, end: true },
  { to: '/admin/produtos', label: 'Loja', icon: ShoppingBag, badge: 'outOfStock' },
  { to: '/admin/agendamentos', label: 'Banho & Tosa', icon: CalendarClock, badge: 'todayBookings' },
  { to: '/admin/calendario', label: 'Calendário', icon: CalendarCog },
  { to: '/admin/galeria', label: 'Galeria', icon: Images },
];

export function AdminLayout() {
  const { session, status, checkSession } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (status === 'idle') void checkSession();
  }, [status, checkSession]);

  if (status !== 'ready') {
    return <PageLoadingFallback />;
  }

  if (!session) {
    const from = encodeURIComponent(location.pathname);
    return <Navigate to={`/admin/login?from=${from}`} replace />;
  }

  // The shell owns the live counters, so it only mounts (and only queries) once a session exists.
  return <AdminShell user={session.user} />;
}

function AdminShell({ user }: { user: string }) {
  const location = useLocation();
  const logout = useAuthStore((s) => s.logout);

  const productsFetcher = useCallback(() => productRepository.list(), []);
  const bookingsFetcher = useCallback(() => bookingRepository.list(), []);
  const { data: products } = useLiveQuery('products', productsFetcher);
  const { data: bookings } = useLiveQuery('bookings', bookingsFetcher);

  const today = todayIsoDate(nowInBusinessTz());
  const badgeCounts = {
    outOfStock: products?.filter((p) => !p.inStock).length ?? 0,
    todayBookings: bookings?.filter((b) => b.date === today && b.status === 'scheduled').length ?? 0,
  };

  function handleLogout() {
    void logout();
    toast.success('Sessão encerrada.');
  }

  return (
    <div className="flex min-h-dvh flex-col bg-cream-deep md:flex-row">
      {/* Mobile brand bar. Deliberately NOT sticky — it scrolls away so only the nav row below
       * occupies permanent screen space on a phone. */}
      <div className="flex items-center justify-between gap-3 bg-charcoal px-4 py-3 text-cream md:hidden">
        <span className="flex items-center gap-2 font-display text-lg font-bold">
          <PawPrint className="size-6 text-amber-brand" aria-hidden="true" />
          Pet Studio
        </span>
        <span className="text-xs text-cream/60">{user}</span>
      </div>

      {/*
       * The nav sticks on every breakpoint — this is the whole point of the sidebar: on desktop it
       * pins as a full-height rail, on mobile it pins as a scrolling pill row under the brand bar.
       * `self-start` is required alongside `h-dvh`: a stretched flex item can't stick.
       */}
      <aside
        className={cn(
          'sticky top-0 z-40 flex shrink-0 flex-col gap-1 border-b border-black/20 bg-charcoal text-cream',
          'px-3 py-2 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.9)]',
          'md:h-dvh md:w-64 md:self-start md:overflow-y-auto md:border-b-0 md:p-4',
        )}
      >
        <div className="mb-3 hidden items-center gap-2 px-2 md:flex">
          <PawPrint className="size-7 text-amber-brand" aria-hidden="true" />
          <span>
            <span className="block font-display text-lg leading-tight font-bold">Pet Studio</span>
            <span className="block text-[0.7rem] tracking-widest text-cream/50 uppercase">
              Painel
            </span>
          </span>
        </div>

        <div className="flex items-center gap-1 md:block">
          <nav
            className="flex flex-1 flex-row gap-1 overflow-x-auto md:flex-col md:overflow-visible [&::-webkit-scrollbar]:hidden"
            aria-label="Navegação do painel"
          >
            {NAV_ITEMS.map((item) => {
              const ItemIcon = item.icon;
              const count = item.badge ? badgeCounts[item.badge] : 0;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold',
                      'transition-all duration-200 ease-out-soft',
                      isActive
                        ? 'bg-amber-brand text-charcoal shadow-[0_8px_20px_-10px_rgba(240,178,29,0.9)]'
                        : 'text-cream/75 hover:bg-white/10 hover:text-cream md:hover:translate-x-1',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Active marker — only meaningful in the vertical desktop rail. */}
                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="ds-admin-nav-marker absolute -left-3 hidden h-6 w-1 rounded-r-full bg-amber-brand md:block"
                        />
                      )}
                      <ItemIcon
                        className={cn(
                          'size-4 shrink-0 transition-transform duration-300 ease-out-soft',
                          !isActive && 'group-hover:scale-115 group-hover:-rotate-12',
                        )}
                        aria-hidden="true"
                      />
                      {item.label}
                      {count > 0 && (
                        <span
                          className={cn(
                            'ml-auto min-w-5 rounded-full px-1.5 py-0.5 text-center text-[0.65rem] leading-none font-extrabold tabular-nums',
                            isActive ? 'bg-charcoal/15 text-charcoal' : 'bg-amber-brand text-charcoal',
                          )}
                        >
                          {count}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Logout stays inside the sticky bar on mobile so it never scrolls out of reach. */}
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Sair"
            title="Sair"
            className="flex size-11 shrink-0 items-center justify-center rounded-xl text-cream/70 transition-colors hover:bg-white/10 hover:text-cream md:hidden"
          >
            <LogOut className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-auto hidden flex-col gap-1 border-t border-white/10 pt-3 md:flex">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex min-h-11 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-cream/75 transition-colors hover:bg-white/10 hover:text-cream"
          >
            <ExternalLink className="size-4 transition-transform duration-200 ease-out-soft group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            Ver site público
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-11 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-cream/75 transition-colors hover:bg-urgent/20 hover:text-cream"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sair
          </button>
          <p className="px-3 pt-1 text-[0.7rem] text-cream/40">Conectado como {user}</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="bg-amber-soft px-4 py-2 text-center text-xs font-semibold text-charcoal">
          Ambiente de demonstração — os dados são salvos apenas neste navegador.
        </div>
        {/* Keying on pathname restarts the enter animation per route, same trick as PublicLayout. */}
        <main key={location.pathname} className="ds-page-enter flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      <ScrollToTopButton />
    </div>
  );
}

/** Appears once the page has scrolled far enough that the top is out of reach. The nav itself is
 * sticky, so this is only about getting back to a page's own heading and filters. */
function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      aria-label="Voltar ao topo"
      className={cn(
        'fixed right-4 bottom-4 z-40 flex size-11 items-center justify-center rounded-full bg-charcoal text-cream',
        'shadow-[0_10px_24px_-10px_rgba(43,42,40,0.8)] transition-all duration-200 ease-out-soft',
        'hover:-translate-y-1 hover:bg-teal-deep',
        visible ? 'scale-100 opacity-100' : 'pointer-events-none scale-75 opacity-0',
      )}
    >
      <ArrowUp className="size-5" aria-hidden="true" />
    </button>
  );
}
