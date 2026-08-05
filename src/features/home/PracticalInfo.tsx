import { Phone, Clock, MapPin } from 'lucide-react';
import { SITE } from '@/config/site';
import { useIsOpenNow } from './useIsOpenNow';
import { Badge } from '@/design-system/primitives';
import { Icon, Blob } from '@/design-system/decorative';
import { Reveal, FloatingObject } from '@/design-system/motion';
import { groupBusinessHours, formatRanges } from '@/lib/businessHours';
import { cn } from '@/lib/cn';

export function PracticalInfo() {
  const isOpen = useIsOpenNow();
  // Days sharing the same hours collapse into one line ("Seg a Sex — 08:00 às 18:00").
  const hourGroups = groupBusinessHours();

  return (
    <section className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <Blob className="bg-amber-brand/12" size={300} top="10%" right="-10%" delay={2} />

      <div className="relative grid gap-5 md:grid-cols-5">
        {/* Hours — the wider panel, deliberately offset from the contact column. */}
        <Reveal direction="left" className="md:col-span-3">
          <div className="h-full rounded-3xl border-2 border-cream-deep bg-white p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Clock className="size-5 text-teal" aria-hidden="true" />
              <h3 className="font-display text-lg font-bold text-charcoal">Funcionamento</h3>
              <Badge variant={isOpen ? 'success' : 'neutral'}>
                {isOpen ? 'Aberto agora' : 'Fechado agora'}
              </Badge>
            </div>

            <ul className="mt-4 flex flex-col gap-2">
              {hourGroups.map((group) => (
                <li
                  key={group.label}
                  className={cn(
                    'flex items-center justify-between gap-4 rounded-xl px-3 py-2 text-sm',
                    group.closed ? 'bg-cream-deep/50 text-muted' : 'bg-cream-deep/80 text-charcoal',
                  )}
                >
                  <span className="font-bold">{group.label}</span>
                  <span className={cn('tabular-nums', group.closed && 'italic')}>
                    {formatRanges(group.ranges)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* Contact */}
        <Reveal direction="right" delay={120} className="md:col-span-2">
          <div className="relative flex h-full flex-col justify-center gap-3 rounded-3xl bg-charcoal p-6 text-cream">
            <FloatingObject
              shape="paw"
              top="8%"
              left="82%"
              size={40}
              className="text-white/10"
            />
            <a
              href={`tel:${SITE.whatsapp}`}
              className="group flex items-center gap-3 rounded-2xl bg-white/8 px-4 py-3 font-bold transition-colors hover:bg-amber-brand hover:text-charcoal"
            >
              <Phone className="size-5 shrink-0 transition-transform duration-300 group-hover:rotate-12" aria-hidden="true" />
              {SITE.phoneDisplay}
            </a>
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-2xl bg-white/8 px-4 py-3 font-bold transition-colors hover:bg-amber-brand hover:text-charcoal"
            >
              <Icon name="social" className="size-5 shrink-0 transition-transform duration-300 group-hover:rotate-12" />
              @petstudio
            </a>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${SITE.coords.lat},${SITE.coords.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-2xl bg-white/8 px-4 py-3 font-bold transition-colors hover:bg-amber-brand hover:text-charcoal"
            >
              <MapPin className="size-5 shrink-0 transition-transform duration-300 group-hover:rotate-12" aria-hidden="true" />
              Como chegar
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
