import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import type { AnimalType, ItemType } from '@/domain/types';

export type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'name';

export interface ShopFiltersState {
  itemType?: ItemType;
  animalType?: AnimalType;
  query: string;
  onlyInStock: boolean;
  onlyOnSale: boolean;
  sort: SortOption;
}

const VALID_ITEM_TYPES: ItemType[] = ['food', 'toys', 'hygiene'];
const VALID_ANIMAL_TYPES: AnimalType[] = ['dog', 'cat'];
const VALID_SORTS: SortOption[] = ['relevance', 'price-asc', 'price-desc', 'name'];

// Filter state lives in the URL (?tipo=food&animal=dog&q=racao) so it's shareable, survives a
// reload, and the browser back button works — see IMPLEMENTATION_PLAN.md §5.2.
export function useProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [queryInput, setQueryInput] = useState(searchParams.get('q') ?? '');

  const itemTypeParam = searchParams.get('tipo');
  const animalTypeParam = searchParams.get('animal');
  const sortParam = searchParams.get('ordenar');

  const filters: ShopFiltersState = useMemo(
    () => ({
      itemType: VALID_ITEM_TYPES.includes(itemTypeParam as ItemType)
        ? (itemTypeParam as ItemType)
        : undefined,
      animalType: VALID_ANIMAL_TYPES.includes(animalTypeParam as AnimalType)
        ? (animalTypeParam as AnimalType)
        : undefined,
      query: searchParams.get('q') ?? '',
      onlyInStock: searchParams.get('disponivel') === '1',
      onlyOnSale: searchParams.get('promocao') === '1',
      sort: VALID_SORTS.includes(sortParam as SortOption) ? (sortParam as SortOption) : 'relevance',
    }),
    [itemTypeParam, animalTypeParam, sortParam, searchParams],
  );

  function updateParam(key: string, value: string | null) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value === null || value === '') next.delete(key);
        else next.set(key, value);
        return next;
      },
      { replace: true },
    );
  }

  // Debounce the free-text search before it hits the URL/fetch — avoids refetching on every keystroke.
  useEffect(() => {
    const id = setTimeout(() => {
      updateParam('q', queryInput || null);
    }, 250);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryInput]);

  return {
    filters,
    queryInput,
    setQueryInput,
    setItemType: (v: ItemType | undefined) => updateParam('tipo', v ?? null),
    setAnimalType: (v: AnimalType | undefined) => updateParam('animal', v ?? null),
    setOnlyInStock: (v: boolean) => updateParam('disponivel', v ? '1' : null),
    setOnlyOnSale: (v: boolean) => updateParam('promocao', v ? '1' : null),
    setSort: (v: SortOption) => updateParam('ordenar', v === 'relevance' ? null : v),
    clearAll: () => {
      setQueryInput('');
      setSearchParams({}, { replace: true });
    },
  };
}
