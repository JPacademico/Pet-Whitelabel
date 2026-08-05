import { useEffect } from 'react';
import { NavLink, Navigate, Outlet, useLocation } from 'react-router';
import { LayoutDashboard, ShoppingBag, CalendarClock, CalendarCog, LogOut, PawPrint } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/cn';
import { PageLoadingFallback } from './PageLoadingFallback';

const NAV_ITEMS = [
  { to: '/admin', label: 'Painel', icon: LayoutDashboard, end: true },
  { to: '/admin/produtos', label: 'Loja', icon: ShoppingBag },
  { to: '/admin/agendamentos', label: 'Banho & Tosa', icon: CalendarClock },
  { to: '/admin/calendario', label: 'Calendário', icon: CalendarCog },
];

export function AdminLayout() {
  const { session, status, checkSession, logout } = useAuthStore();
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

  return (
    <div className="flex min-h-dvh flex-col bg-cream-deep md:flex-row">
      <aside className="flex shrink-0 flex-col gap-2 border-b border-cream-deep bg-charcoal p-4 text-cream md:min-h-dvh md:w-60 md:border-b-0">
        <div className="mb-2 flex items-center gap-2 px-2 font-display text-lg font-bold">
          <PawPrint className="size-6 text-amber-brand" aria-hidden="true" />
          Pet Studio
        </div>
        <nav className="flex flex-row gap-1 overflow-x-auto md:flex-col md:overflow-visible" aria-label="Navegação do painel">
          {NAV_ITEMS.map((item) => {
            const ItemIcon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                    isActive ? 'bg-amber-brand text-charcoal' : 'text-cream/80 hover:bg-white/10',
                  )
                }
              >
                <ItemIcon className="size-4" aria-hidden="true" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={() => {
            void logout();
            toast.success('Sessão encerrada.');
          }}
          className="mt-auto flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-cream/80 transition-colors hover:bg-white/10"
        >
          <LogOut className="size-4" aria-hidden="true" />
          Sair
        </button>
      </aside>

      <div className="flex flex-1 flex-col">
        <div className="bg-amber-soft px-4 py-2 text-center text-xs font-semibold text-charcoal">
          Ambiente de demonstração — os dados são salvos apenas neste navegador.
        </div>
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
