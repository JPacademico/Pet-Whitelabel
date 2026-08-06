import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  PackageX,
  PackageCheck,
  Tag,
  TagX,
  X,
  Drumstick,
  Bone,
  Droplets,
} from 'lucide-react';
import { productRepository } from '@/data/repositories';
import { useLiveQuery } from '@/lib/useLiveQuery';
import type { ItemType, Product } from '@/domain/types';
import { Button, DataTable, EmptyState, Badge, Modal, Input, FilterChip } from '@/design-system/primitives';
import type { DataTableColumn } from '@/design-system/primitives/DataTable';
import { formatCentsBRL } from '@/lib/money';
import { normalizeForSearch } from '@/lib/search';
import { ProductFormModal } from './ProductFormModal';

const ITEM_TYPE_OPTIONS: { value: ItemType; label: string; icon: typeof Drumstick }[] = [
  { value: 'food', label: 'Ração', icon: Drumstick },
  { value: 'toys', label: 'Brinquedos', icon: Bone },
  { value: 'hygiene', label: 'Higiene', icon: Droplets },
];

export function AdminProductsPage() {
  const fetcher = useCallback(() => productRepository.list(), []);
  const { data: products, loading, refetch } = useLiveQuery('products', fetcher);

  const [search, setSearch] = useState('');
  const [itemTypeFilter, setItemTypeFilter] = useState<ItemType | undefined>(undefined);
  const [onlyOutOfStock, setOnlyOutOfStock] = useState(false);
  const [onlyOnSale, setOnlyOnSale] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editingProduct, setEditingProduct] = useState<Product | null | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const hasActiveFilters = !!search.trim() || !!itemTypeFilter || onlyOutOfStock || onlyOnSale;

  const filtered = useMemo(() => {
    if (!products) return [];
    const q = normalizeForSearch(search);
    return products
      .filter((p) => (q ? normalizeForSearch(p.name).includes(q) : true))
      .filter((p) => (itemTypeFilter ? p.itemType === itemTypeFilter : true))
      .filter((p) => (onlyOutOfStock ? !p.inStock : true))
      .filter((p) => (onlyOnSale ? !!p.sale?.active : true));
  }, [products, search, itemTypeFilter, onlyOutOfStock, onlyOnSale]);

  function clearFilters() {
    setSearch('');
    setItemTypeFilter(undefined);
    setOnlyOutOfStock(false);
    setOnlyOnSale(false);
  }

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const removed = deleteTarget;
    await productRepository.remove(removed.id);
    setDeleteTarget(null);
    toast.success('Produto removido.', {
      action: {
        label: 'Desfazer',
        onClick: async () => {
          await productRepository.create({
            name: removed.name,
            description: removed.description,
            priceCents: removed.priceCents,
            itemType: removed.itemType,
            animalType: removed.animalType,
            imageUrl: removed.imageUrl,
            inStock: removed.inStock,
            sale: removed.sale,
          });
          toast.success('Produto restaurado.');
        },
      },
      duration: 5000,
    });
  }

  async function bulkToggleStock(inStock: boolean) {
    await Promise.all([...selected].map((id) => productRepository.update(id, { inStock })));
    toast.success(inStock ? 'Produtos marcados como disponíveis.' : 'Produtos marcados como esgotados.');
    setSelected(new Set());
  }

  async function bulkClearSale() {
    await Promise.all([...selected].map((id) => productRepository.update(id, { sale: null })));
    toast.success('Promoções removidas dos produtos selecionados.');
    setSelected(new Set());
  }

  const columns: DataTableColumn<Product>[] = [
    {
      key: 'select',
      header: '',
      hideOnMobile: true,
      render: (p) => (
        <input
          type="checkbox"
          checked={selected.has(p.id)}
          onChange={() => toggleSelected(p.id)}
          aria-label={`Selecionar ${p.name}`}
          className="size-4 accent-teal"
        />
      ),
    },
    {
      key: 'name',
      header: 'Produto',
      render: (p) => (
        <div className="flex items-center gap-2">
          <img src={p.imageUrl} alt="" className="size-10 rounded-lg object-cover" />
          <div>
            <p className="font-semibold text-charcoal">{p.name}</p>
            <div className="mt-0.5 flex gap-1">
              {!p.inStock && <Badge variant="out-of-stock">Esgotado</Badge>}
              {p.sale?.active && <Badge variant="sale">-{p.sale.percentOff}%</Badge>}
            </div>
          </div>
        </div>
      ),
    },
    { key: 'price', header: 'Preço', render: (p) => formatCentsBRL(p.priceCents) },
    {
      key: 'type',
      header: 'Tipo',
      hideOnMobile: true,
      render: (p) => ({ food: 'Ração', toys: 'Brinquedos', hygiene: 'Higiene' })[p.itemType],
    },
  ];

  return (
    <div>
      <title>Loja — Pet Studio Admin</title>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-charcoal">Loja</h1>
        <Button onClick={() => setEditingProduct(null)}>
          <Plus className="size-4" aria-hidden="true" />
          Novo produto
        </Button>
      </div>

      <div className="mb-4 flex flex-col gap-3 rounded-2xl border-2 border-cream-deep bg-white/70 p-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome…"
          aria-label="Buscar produtos"
          className="sm:max-w-xs"
        />

        <div className="flex flex-wrap items-center gap-2">
          {ITEM_TYPE_OPTIONS.map((opt) => (
            <FilterChip
              key={opt.value}
              icon={opt.icon}
              label={opt.label}
              active={itemTypeFilter === opt.value}
              onClick={() => setItemTypeFilter(itemTypeFilter === opt.value ? undefined : opt.value)}
            />
          ))}

          <span className="mx-0.5 hidden h-6 w-px bg-cream-deep sm:block" aria-hidden="true" />

          <FilterChip
            icon={PackageX}
            label="Esgotados"
            active={onlyOutOfStock}
            onClick={() => setOnlyOutOfStock((v) => !v)}
          />
          <FilterChip
            icon={Tag}
            label="Promoção"
            active={onlyOnSale}
            onClick={() => setOnlyOnSale((v) => !v)}
          />

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-bold text-urgent transition-colors hover:bg-urgent/10"
            >
              <X className="size-3.5" aria-hidden="true" />
              Limpar
            </button>
          )}
        </div>
      </div>

      {hasActiveFilters && !loading && (
        <p className="mb-4 -mt-2 text-sm text-muted">
          <strong className="font-bold text-charcoal tabular-nums">{filtered.length}</strong>{' '}
          {filtered.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
        </p>
      )}

      {selected.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl bg-amber-soft px-4 py-2">
          <span className="text-sm font-semibold text-charcoal">{selected.size} selecionado(s)</span>
          <Button size="sm" variant="secondary" onClick={() => bulkToggleStock(false)}>
            <PackageX className="size-4" aria-hidden="true" />
            Marcar esgotado
          </Button>
          <Button size="sm" variant="secondary" onClick={() => bulkToggleStock(true)}>
            <PackageCheck className="size-4" aria-hidden="true" />
            Marcar disponível
          </Button>
          <Button size="sm" variant="secondary" onClick={bulkClearSale}>
            <TagX className="size-4" aria-hidden="true" />
            Remover promoção
          </Button>
        </div>
      )}

      {loading ? (
        <p className="text-muted">Carregando…</p>
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(p) => p.id}
          emptyState={
            <EmptyState
              icon={<Tag className="size-10" />}
              title="Nenhum produto encontrado"
              description={
                hasActiveFilters
                  ? 'Ajuste os filtros para ver outros produtos.'
                  : 'Crie um novo produto ou ajuste a busca.'
              }
            />
          }
          actions={(p) => (
            <>
              <button
                type="button"
                onClick={() => setEditingProduct(p)}
                aria-label={`Editar ${p.name}`}
                className="flex size-9 items-center justify-center rounded-full text-charcoal hover:bg-cream-deep"
              >
                <Pencil className="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(p)}
                aria-label={`Excluir ${p.name}`}
                className="flex size-9 items-center justify-center rounded-full text-urgent hover:bg-urgent/10"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </>
          )}
        />
      )}

      {editingProduct !== undefined && (
        <ProductFormModal
          open={editingProduct !== undefined}
          onOpenChange={(open) => !open && setEditingProduct(undefined)}
          product={editingProduct}
          onSaved={refetch}
        />
      )}

      <Modal
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Excluir produto"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Excluir
            </Button>
          </>
        }
      >
        <p className="text-sm text-charcoal">
          Tem certeza que deseja excluir <strong>{deleteTarget?.name}</strong>? Essa ação pode ser
          desfeita logo em seguida pelo aviso que aparecerá na tela.
        </p>
      </Modal>
    </div>
  );
}
