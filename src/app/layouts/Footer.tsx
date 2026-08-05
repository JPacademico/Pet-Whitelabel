import { Link } from 'react-router';
import { MapPin, Phone } from 'lucide-react';
import { SITE } from '@/config/site';
import { Icon } from '@/design-system/decorative';

export function Footer() {
  return (
    <footer className="mt-auto bg-charcoal py-10 text-cream">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:justify-between">
        <div>
          <p className="font-display text-lg font-bold">{SITE.name}</p>
          <p className="mt-1 text-sm text-cream/70">
            {SITE.address.street} — {SITE.address.neighborhood}, {SITE.address.city}/{SITE.address.state}
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <a href={`tel:${SITE.whatsapp}`} className="flex items-center gap-2 hover:text-amber-soft">
            <Phone className="size-4" aria-hidden="true" />
            {SITE.phoneDisplay}
          </a>
          <a
            href={SITE.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-amber-soft"
          >
            <Icon name="social" className="size-4" aria-hidden="true" />
            Instagram
          </a>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${SITE.coords.lat},${SITE.coords.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-amber-soft"
          >
            <MapPin className="size-4" aria-hidden="true" />
            Traçar rota
          </a>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-6xl px-4 text-xs text-cream/50 sm:px-6">
        <p>
          © {new Date().getFullYear()} {SITE.name}. Todos os direitos reservados.
        </p>
        <Link to="/admin/login" className="mt-1 inline-block hover:text-cream/80">
          Área administrativa
        </Link>
      </div>
    </footer>
  );
}
