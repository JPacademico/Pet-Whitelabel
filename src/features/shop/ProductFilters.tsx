import { useState } from 'react';
import { Search, X, Bone, Cat, Dog, Sparkles, Drumstick, Droplets, Tag, PackageCheck, ArrowUpDown, Filter } from 'lucide-react';
import type { AnimalType, ItemType } from '@/domain/types';
import { FilterChip } from '@/design-system/primitives';
import { cn } from '@/lib/cn';
import type { ShopFiltersState, SortOption } from './useProductFilters';

const ITEM_TYPE_OPTIONS: { value: ItemType; label: string; icon: typeof Bone }[] = [
  { value: 'food', label: 'Ração & petiscos', icon: Drumstick },
  { value: 'toys', label: 'Brinquedos', icon: Bone },
  { value: 'hygiene', label: 'Higiene', icon: Droplets },
];

const ANIMAL_TYPE_OPTIONS: { value: AnimalType; label: string; icon: typeof Dog }[] = [
  { value: 'dog', label: 'Cães', icon: Dog },
  { value: 'cat', label: 'Gatos', icon: Cat },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevância' },
  { value: 'price-asc', label: 'Menor preço' },
  { value: 'price-desc', label: 'Maior preço' },
  { value: 'name', label: 'Nome (A–Z)' },
];

export interface ProductFiltersProps {
  filters: ShopFiltersState;
  queryInput: string;
  resultCount: number;
  hasActiveFilters: boolean;
  setQueryInput: (v: string) => void;
  setItemType: (v: ItemType | undefined) => void;
  setAnimalType: (v: AnimalType | undefined) => void;
  setOnlyInStock: (v: boolean) => void;
  setOnlyOnSale: (v: boolean) => void;
  setSort: (v: SortOption) => void;
  clearAll: () => void;
}

export function ProductFilters({
  filters,
  queryInput,
  resultCount,
  hasActiveFilters,
  setQueryInput,
  setItemType,
  setAnimalType,
  setOnlyInStock,
  setOnlyOnSale,
  setSort,
  clearAll,
}: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-3xl border-2 border-cream-deep bg-white/70 p-4 backdrop-blur sm:p-5">
      {/* Search is always visible */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Buscar por ração, brinquedo, shampoo…"
            aria-label="Buscar produtos"
            className="min-h-11 w-full rounded-full border-2 border-cream-deep bg-white py-2.5 pr-4 pl-11 text-charcoal transition-colors placeholder:text-muted focus:border-teal focus:outline-none"
          />
        </div>

        {/* Mobile Toggle Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-11 items-center justify-center gap-2 rounded-full border-2 border-cream-deep bg-white px-4 text-sm font-bold text-charcoal lg:hidden"
        >
          <Filter className="size-4" />
          {isOpen ? 'Ocultar Filtros' : 'Mostrar Filtros'}
        </button>

        {/* Sort for Desktop */}
        <div className="hidden items-center gap-2 lg:flex">
          <ArrowUpDown className="size-4 shrink-0 text-muted" aria-hidden="true" />
          <div className="flex flex-wrap gap-1.5">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSort(opt.value)}
                aria-pressed={filters.sort === opt.value}
                className={cn(
                  'min-h-9 rounded-full px-3 text-xs font-bold transition-colors',
                  filters.sort === opt.value
                    ? 'bg-charcoal text-cream'
                    : 'bg-cream-deep text-muted hover:text-charcoal',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Always visible Animal Filter */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-extrabold tracking-widest text-muted uppercase">Pet</span>
        {ANIMAL_TYPE_OPTIONS.map((opt) => (
          <FilterChip
            key={opt.value}
            icon={opt.icon}
            label={opt.label}
            active={filters.animalType === opt.value}
            onClick={() => setAnimalType(filters.animalType === opt.value ? undefined : opt.value)}
          />
        ))}
      </div>

      <div className={cn("mt-4 lg:block", isOpen ? "block" : "hidden")}>
        {/* Sort for Mobile */}
        <div className="mb-4 flex flex-col gap-2 lg:hidden">
          <span className="text-xs font-extrabold tracking-widest text-muted uppercase">Ordenar por</span>
          <div className="flex flex-wrap gap-1.5">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSort(opt.value)}
                aria-pressed={filters.sort === opt.value}
                className={cn(
                  'min-h-9 rounded-full px-3 text-xs font-bold transition-colors',
                  filters.sort === opt.value
                    ? 'bg-charcoal text-cream'
                    : 'bg-cream-deep text-muted hover:text-charcoal',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-extrabold tracking-widest text-muted uppercase">
            Categoria
          </span>
          {ITEM_TYPE_OPTIONS.map((opt) => (
            <FilterChip
              key={opt.value}
              icon={opt.icon}
              label={opt.label}
              active={filters.itemType === opt.value}
              onClick={() => setItemType(filters.itemType === opt.value ? undefined : opt.value)}
            />
          ))}

          <span className="mx-1 hidden h-6 w-px bg-cream-deep sm:block" aria-hidden="true" />

          <div className="mt-2 flex w-full flex-wrap gap-2 sm:mt-0 sm:w-auto">
            <FilterChip
              icon={PackageCheck}
              label="Disponíveis"
              active={filters.onlyInStock}
              onClick={() => setOnlyInStock(!filters.onlyInStock)}
            />
            <FilterChip
              icon={Tag}
              label="Promoções"
              active={filters.onlyOnSale}
              onClick={() => setOnlyOnSale(!filters.onlyOnSale)}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-cream-deep pt-3">
        <p className="flex items-center gap-1.5 text-sm text-muted">
          <Sparkles className="size-4 text-amber-brand" aria-hidden="true" />
          <strong className="font-extrabold text-charcoal tabular-nums">{resultCount}</strong>{' '}
          {resultCount === 1 ? 'produto encontrado' : 'produtos encontrados'}
        </p>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-bold text-urgent transition-colors hover:bg-urgent/10"
          >
            <X className="size-3.5" aria-hidden="true" />
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}
