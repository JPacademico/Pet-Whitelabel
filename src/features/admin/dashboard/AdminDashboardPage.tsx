import { useCallback, useState } from 'react';
import { Link } from 'react-router';
import {
  CalendarClock,
  CalendarRange,
  ExternalLink,
  Home,
  Hotel,
  Images,
  LayoutDashboard,
  LayoutList,
  PackageX,
  RotateCcw,
  Scissors,
  ShoppingBag,
  Stethoscope,
  Tag,
} from 'lucide-react';
import type {
  ClinicDemand,
  DateOverride,
  DemandLevel,
  HotelAvailability,
  ServiceKind,
  WeeklyTemplate,
} from '@/domain/types';
import {
  productRepository,
  bookingRepository,
  availabilityRepository,
  galleryRepository,
  resetDemoData,
} from '@/data/repositories';
import { useLiveQuery } from '@/lib/useLiveQuery';
import { Badge, Button, EmptyState, Modal, Skeleton } from '@/design-system/primitives';
import { AdminPageHeader, AdminSection, StatCard, SiteSectionCard } from '@/features/admin/shared';
import type { SectionMetric, SectionStatus } from '@/features/admin/shared';
import { baseSlotsForDate, resolveDemandLevel } from '@/domain/availability';
import { addIsoDays, todayIsoDate, nowInBusinessTz } from '@/lib/datetime';
import { useIsOpenNow } from '@/features/home/useIsOpenNow';
import { notify } from '@/lib/notify';

interface AvailabilitySnapshot {
  templates: Record<ServiceKind, WeeklyTemplate>;
  overrides: Record<ServiceKind, DateOverride[]>;
  clinicDemand: ClinicDemand[];
  hotelAvailability: HotelAvailability[];
}

const CLINIC_DEMAND_COPY: Record<DemandLevel, { label: string; tone: SectionMetric['tone'] }> = {
  free: { label: 'demanda', tone: 'good' },
  moderate: { label: 'demanda', tone: 'warn' },
  high: { label: 'demanda', tone: 'danger' },
  closed: { label: 'demanda', tone: 'danger' },
};

const CLINIC_DEMAND_VALUE: Record<DemandLevel, string> = {
  free: 'Livre',
  moderate: 'Moderada',
  high: 'Alta',
  closed: 'Fechada',
};

const HOTEL_VACANCY_VALUE: Record<DemandLevel, string> = {
  free: 'Com vagas',
  moderate: 'Poucas vagas',
  high: 'Quase lotado',
  closed: 'Fechado',
};

export function AdminDashboardPage() {
  const productsFetcher = useCallback(() => productRepository.list(), []);
  const bookingsFetcher = useCallback(() => bookingRepository.list(), []);
  const galleryFetcher = useCallback(() => galleryRepository.list(), []);
  // One combined request instead of eight separate live queries — they all share the 'availability'
  // version counter, so they would refetch together anyway.
  const availabilityFetcher = useCallback(async (): Promise<AvailabilitySnapshot> => {
    const [grooming, clinic, hotel, groomingOv, clinicOv, hotelOv, clinicDemand, hotelAvailability] =
      await Promise.all([
        availabilityRepository.getWeeklyTemplate('grooming'),
        availabilityRepository.getWeeklyTemplate('clinic'),
        availabilityRepository.getWeeklyTemplate('hotel'),
        availabilityRepository.listOverrides('grooming'),
        availabilityRepository.listOverrides('clinic'),
        availabilityRepository.listOverrides('hotel'),
        availabilityRepository.listClinicDemand(),
        availabilityRepository.listHotelAvailability(),
      ]);
    return {
      templates: { grooming, clinic, hotel },
      overrides: { grooming: groomingOv, clinic: clinicOv, hotel: hotelOv },
      clinicDemand,
      hotelAvailability,
    };
  }, []);

  const { data: products } = useLiveQuery('products', productsFetcher);
  const { data: bookings } = useLiveQuery('bookings', bookingsFetcher);
  const { data: availability } = useLiveQuery('availability', availabilityFetcher);
  const { data: galleryPhotos } = useLiveQuery('gallery', galleryFetcher);

  const [confirmReset, setConfirmReset] = useState(false);
  const isOpenNow = useIsOpenNow();

  const today = todayIsoDate(nowInBusinessTz());
  const weekAhead = addIsoDays(today, 7);

  const todaysBookings = (bookings ?? [])
    .filter((b) => b.date === today && b.status === 'scheduled')
    .sort((a, b) => a.time.localeCompare(b.time));
  const weekCount = (bookings ?? []).filter(
    (b) => b.date >= today && b.date <= weekAhead && b.status === 'scheduled',
  ).length;
  const outOfStockCount = (products ?? []).filter((p) => !p.inStock).length;
  const onSaleCount = (products ?? []).filter((p) => p.sale?.active).length;

  /** Hours open today for a service, after weekly template + date exceptions are resolved. */
  const openSlotsToday = (service: ServiceKind): number =>
    availability
      ? baseSlotsForDate(today, availability.templates[service], availability.overrides[service])
          .length
      : 0;

  const groomingSlots = openSlotsToday('grooming');
  const clinicSlots = openSlotsToday('clinic');
  const hotelSlots = openSlotsToday('hotel');
  const clinicLevel = availability ? resolveDemandLevel(today, availability.clinicDemand) : 'free';
  const hotelLevel = availability ? resolveDemandLevel(today, availability.hotelAvailability) : 'free';

  const serviceStatus = (slots: number): SectionStatus => (slots === 0 ? 'closed' : 'live');

  const siteSections = [
    {
      icon: Home,
      name: 'Início',
      path: '/',
      status: (isOpenNow ? 'live' : 'closed') as SectionStatus,
      tone: 'amber' as const,
      metrics: [
        { label: 'agora', value: isOpenNow ? 'Aberto' : 'Fechado', tone: isOpenNow ? 'good' : 'danger' },
      ] satisfies SectionMetric[],
    },
    {
      icon: ShoppingBag,
      name: 'Loja',
      path: '/loja',
      manageTo: '/admin/produtos',
      status: (outOfStockCount > 0 ? 'attention' : 'live') as SectionStatus,
      tone: 'teal' as const,
      metrics: [
        { label: 'produtos', value: String(products?.length ?? 0) },
        {
          label: 'esgotados',
          value: String(outOfStockCount),
          tone: outOfStockCount > 0 ? 'danger' : 'good',
        },
        { label: 'em promoção', value: String(onSaleCount), tone: 'warn' },
      ] satisfies SectionMetric[],
    },
    {
      icon: Scissors,
      name: 'Banho & Tosa',
      path: '/banho-e-tosa',
      manageTo: '/admin/agendamentos',
      manageLabel: 'Agendamentos',
      status: serviceStatus(groomingSlots),
      tone: 'success' as const,
      metrics: [
        {
          label: 'horários hoje',
          value: String(groomingSlots),
          tone: groomingSlots === 0 ? 'danger' : 'neutral',
        },
        {
          label: 'reservados',
          value: String(todaysBookings.length),
          tone: todaysBookings.length > 0 ? 'warn' : 'neutral',
        },
      ] satisfies SectionMetric[],
    },
    {
      icon: Stethoscope,
      name: 'Clínica',
      path: '/clinica',
      manageTo: '/admin/calendario',
      manageLabel: 'Calendário',
      status: serviceStatus(clinicSlots),
      tone: 'urgent' as const,
      metrics: [
        {
          label: 'horários hoje',
          value: String(clinicSlots),
          tone: clinicSlots === 0 ? 'danger' : 'neutral',
        },
        {
          label: CLINIC_DEMAND_COPY[clinicLevel].label,
          value: CLINIC_DEMAND_VALUE[clinicLevel],
          tone: CLINIC_DEMAND_COPY[clinicLevel].tone,
        },
      ] satisfies SectionMetric[],
    },
    {
      icon: Hotel,
      name: 'Hotel',
      path: '/hotel',
      manageTo: '/admin/calendario',
      manageLabel: 'Calendário',
      status: serviceStatus(hotelSlots),
      tone: 'teal' as const,
      metrics: [
        {
          label: 'check-ins hoje',
          value: String(hotelSlots),
          tone: hotelSlots === 0 ? 'danger' : 'neutral',
        },
        {
          label: 'hoje',
          value: HOTEL_VACANCY_VALUE[hotelLevel],
          tone: CLINIC_DEMAND_COPY[hotelLevel].tone,
        },
      ] satisfies SectionMetric[],
    },
    {
      icon: Images,
      name: 'Galeria',
      path: '/galeria',
      manageTo: '/admin/galeria',
      manageLabel: 'Gerenciar fotos',
      status: (galleryPhotos?.length ? 'live' : 'attention') as SectionStatus,
      tone: 'amber' as const,
      metrics: [
        { label: 'fotos', value: String(galleryPhotos?.length ?? 0) },
        {
          label: 'cães',
          value: String(galleryPhotos?.filter((p) => p.animalType === 'dog').length ?? 0),
        },
        {
          label: 'gatos',
          value: String(galleryPhotos?.filter((p) => p.animalType === 'cat').length ?? 0),
        },
      ] satisfies SectionMetric[],
    },
  ];

  return (
    <div>
      <title>Painel — Pet Studio Admin</title>

      <AdminPageHeader
        icon={LayoutDashboard}
        eyebrow="Visão geral"
        title="Painel"
        description="O estado do site agora: o que está aberto, o que precisa de atenção e o que já foi reservado."
        actions={
          <>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-cream/30 px-4 text-sm font-semibold text-cream transition-colors hover:border-cream hover:bg-white/10"
            >
              <ExternalLink className="size-4" aria-hidden="true" />
              Ver site
            </a>
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-cream/70 transition-colors hover:bg-white/10 hover:text-cream"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Reiniciar demonstração
            </button>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={CalendarClock}
          label="Agendamentos hoje"
          value={todaysBookings.length}
          hint="Banho & tosa confirmados"
          to="/admin/agendamentos"
          tone="teal"
          index={0}
        />
        <StatCard
          icon={CalendarRange}
          label="Próximos 7 dias"
          value={weekCount}
          hint="Inclui hoje"
          to="/admin/agendamentos"
          tone="success"
          index={1}
        />
        <StatCard
          icon={PackageX}
          label="Produtos esgotados"
          value={outOfStockCount}
          hint="Aparecem sem botão de compra"
          to="/admin/produtos"
          tone="urgent"
          index={2}
        />
        <StatCard
          icon={Tag}
          label="Promoções ativas"
          value={onSaleCount}
          hint="Com selo de desconto na loja"
          to="/admin/produtos"
          tone="amber"
          index={3}
        />
      </div>

      <div className="flex flex-col gap-5">
        <AdminSection
          icon={LayoutList}
          title="Seções do site"
          description="Cada página pública e como ela está agora. Vermelho significa fechado ou esgotado."
          index={0}
        >
          {availability ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {siteSections.map((section, index) => (
                <SiteSectionCard key={section.path} {...section} index={index} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          )}
        </AdminSection>

        <AdminSection
          icon={CalendarClock}
          title="Agenda de hoje"
          description="Banho & tosa marcados para hoje, na ordem em que chegam."
          index={1}
          actions={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/agendamentos">Ver todos</Link>
            </Button>
          }
        >
          {todaysBookings.length === 0 ? (
            <EmptyState
              icon={<CalendarClock className="size-9" />}
              title="Nenhum agendamento para hoje"
              description="Assim que um cliente reservar um horário, ele aparece aqui."
              className="py-8"
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {todaysBookings.map((booking, index) => (
                <li
                  key={booking.id}
                  style={{ '--enter-delay': `${index * 50}ms` } as React.CSSProperties}
                  className="ds-admin-enter flex flex-wrap items-center gap-3 rounded-xl border-2 border-cream-deep bg-white px-3 py-2.5 transition-colors hover:border-teal"
                >
                  <span className="rounded-lg bg-teal/12 px-2.5 py-1 font-display font-bold text-teal-deep tabular-nums">
                    {booking.time}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-charcoal">
                      {booking.petName}
                    </span>
                    <span className="block truncate text-xs text-muted">{booking.tutorName}</span>
                  </span>
                  <Badge variant="neutral" className="ml-auto">
                    {booking.animalType === 'dog' ? 'Cão' : 'Gato'}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </AdminSection>
      </div>

      <Modal
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Reiniciar dados de demonstração"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmReset(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                resetDemoData();
                setConfirmReset(false);
                notify.success('Dados de demonstração reiniciados.');
              }}
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Reiniciar
            </Button>
          </>
        }
      >
        <p className="text-sm text-charcoal">
          Isso apaga tudo o que você editou neste navegador — produtos, agendamentos e horários — e
          volta aos dados de exemplo. Não dá para desfazer.
        </p>
      </Modal>
    </div>
  );
}
