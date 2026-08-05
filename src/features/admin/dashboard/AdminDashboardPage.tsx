import { useCallback } from 'react';
import { Link } from 'react-router';
import { CalendarClock, CalendarRange, PackageX, Tag, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { productRepository, bookingRepository, resetDemoData } from '@/data/repositories';
import { useLiveQuery } from '@/lib/useLiveQuery';
import { Card, Button } from '@/design-system/primitives';
import { addIsoDays, todayIsoDate, nowInBusinessTz } from '@/lib/datetime';

export function AdminDashboardPage() {
  const productsFetcher = useCallback(() => productRepository.list(), []);
  const bookingsFetcher = useCallback(() => bookingRepository.list(), []);
  const { data: products } = useLiveQuery('products', productsFetcher);
  const { data: bookings } = useLiveQuery('bookings', bookingsFetcher);

  const today = todayIsoDate(nowInBusinessTz());
  const weekAhead = addIsoDays(today, 7);

  const todayCount =
    bookings?.filter((b) => b.date === today && b.status === 'scheduled').length ?? 0;
  const weekCount =
    bookings?.filter((b) => b.date >= today && b.date <= weekAhead && b.status === 'scheduled')
      .length ?? 0;
  const outOfStockCount = products?.filter((p) => !p.inStock).length ?? 0;
  const onSaleCount = products?.filter((p) => p.sale?.active).length ?? 0;

  const cards = [
    { icon: CalendarClock, label: 'Agendamentos hoje', value: todayCount, to: '/admin/agendamentos' },
    { icon: CalendarRange, label: 'Próximos 7 dias', value: weekCount, to: '/admin/agendamentos' },
    { icon: PackageX, label: 'Produtos esgotados', value: outOfStockCount, to: '/admin/produtos' },
    { icon: Tag, label: 'Promoções ativas', value: onSaleCount, to: '/admin/produtos' },
  ];

  return (
    <div>
      <title>Painel — Pet Studio Admin</title>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-charcoal">Painel</h1>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            resetDemoData();
            toast.success('Dados de demonstração reiniciados.');
          }}
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Reiniciar dados de demonstração
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const CardIcon = card.icon;
          return (
            <Link key={card.label} to={card.to}>
              <Card hoverable className="flex flex-col gap-2">
                <CardIcon className="size-6 text-teal" aria-hidden="true" />
                <p className="font-display text-2xl font-bold text-charcoal">{card.value}</p>
                <p className="text-sm text-muted">{card.label}</p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
