import { useState } from 'react';
import { NavLink, Link } from 'react-router';
import { Menu, X, PawPrint } from 'lucide-react';
import { cn } from '@/lib/cn';
import { InstallButton } from '@/pwa/InstallButton';
import { prefetchRoute } from '@/app/routePrefetch';

const NAV_ITEMS = [
  { to: '/', label: 'Início', end: true },
  { to: '/loja', label: 'Loja' },
  { to: '/banho-e-tosa', label: 'Banho & Tosa' },
  { to: '/clinica', label: 'Clínica' },
  { to: '/hotel', label: 'Hotel' },
  { to: '/galeria', label: 'Galeria' },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-cream-deep bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-charcoal">
          <PawPrint className="size-6 text-teal" aria-hidden="true" />
          Pet Studio
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onMouseEnter={() => prefetchRoute(item.to)}
              onFocus={() => prefetchRoute(item.to)}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                  isActive ? 'bg-amber-brand text-charcoal' : 'text-charcoal hover:bg-cream-deep',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-1 md:flex">
          <InstallButton />
        </div>

        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-full text-charcoal hover:bg-cream-deep md:hidden"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" aria-hidden="true" /> : <Menu className="size-6" aria-hidden="true" />}
        </button>
      </div>

      {open && (
        <nav
          className="flex flex-col gap-1 border-t border-cream-deep bg-cream px-4 py-3 md:hidden"
          aria-label="Navegação principal (mobile)"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  'rounded-xl px-4 py-3 text-base font-semibold transition-colors',
                  isActive ? 'bg-amber-brand text-charcoal' : 'text-charcoal hover:bg-cream-deep',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
          <div className="pt-2">
            <InstallButton 
              showLabel 
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold text-charcoal transition-colors hover:bg-cream-deep" 
            />
          </div>
        </nav>
      )}
    </header>
  );
}
