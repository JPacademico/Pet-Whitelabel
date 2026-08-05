import { useCallback, useMemo } from 'react';
import { PackageSearch } from 'lucide-react';
import { productRepository } from '@/data/repositories';
import { useLiveQuery } from '@/lib/useLiveQuery';
import { Skeleton, EmptyState, Button } from '@/design-system/primitives';
import { SectionHeading, Blob } from '@/design-system/decorative';
import { Reveal, FloatingObject } from '@/design-system/motion';
import { useProductFilters } from './useProductFilters';
import { ProductFilters } from './ProductFilters';
import { ProductCard } from './ProductCard';

export function ShopPage() {
  const {
    filters,
    queryInput,
    setQueryInput,
    setItemType,
    setAnimalType,
    setOnlyInStock,
    setOnlyOnSale,
    setSort,
    clearAll,
  } = useProductFilters();

  const fetcher = useCallback(
    () =>
      productRepository.list({
        itemType: filters.itemType,
        animalType: filters.animalType,
        query: filters.query,
        onlyInStock: filters.onlyInStock,
        onlyOnSale: filters.onlyOnSale,
      }),
    [filters.itemType, filters.animalType, filters.query, filters.onlyInStock, filters.onlyOnSale],
  );

  // `fetcher` is memoised on the filter values above, so its identity is the query key.
  const { data: products, loading } = useLiveQuery('products', fetcher);

  const sorted = useMemo(() => {
    if (!products) return [];
    const list = [...products];
    switch (filters.sort) {
      case 'price-asc':
        return list.sort((a, b) => a.priceCents - b.priceCents);
      case 'price-desc':
        return list.sort((a, b) => b.priceCents - a.priceCents);
      case 'name':
        return list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      default:
        return list;
    }
  }, [products, filters.sort]);

  const hasActiveFilters =
    !!filters.itemType ||
    !!filters.animalType ||
    !!filters.query ||
    filters.onlyInStock ||
    filters.onlyOnSale;

  return (
    <div className="relative overflow-hidden">
      <title>Loja — Pet Studio</title>

      <Blob className="bg-amber-brand/15" size={420} top="-8%" left="-14%" />
      <Blob className="bg-teal/10" size={340} top="60%" right="-12%" delay={5} />

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="relative">
          <FloatingObject
            shape="bone"
            top="-10%"
            left="4%"
            size={62}
            interactive
            label="Ossinho saltitante"
            className="hidden text-amber-brand sm:block"
          />
          <FloatingObject
            shape="yarn"
            top="0%"
            left="90%"
            size={54}
            delay={1.2}
            interactive
            label="Novelo de lã"
            className="hidden text-teal sm:block"
          />
          <SectionHeading
            eyebrow="tudo para o seu pet"
            title="Nossa Loja"
            description="Catálogo para consulta. Gostou de algo? Fale com a gente no WhatsApp."
          />
        </div>

        <Reveal delay={60} className="mt-8">
          <ProductFilters
            filters={filters}
            queryInput={queryInput}
            resultCount={sorted.length}
            hasActiveFilters={hasActiveFilters}
            setQueryInput={setQueryInput}
            setItemType={setItemType}
            setAnimalType={setAnimalType}
            setOnlyInStock={setOnlyInStock}
            setOnlyOnSale={setOnlyOnSale}
            setSort={setSort}
            clearAll={clearAll}
          />
        </Reveal>

        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4]" />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <EmptyState
              icon={<PackageSearch className="size-10" />}
              title="Nenhum produto encontrado"
              description="Tente ajustar os filtros ou limpar a busca."
              action={
                <Button variant="secondary" onClick={clearAll}>
                  Limpar filtros
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sorted.map((product, i) => (
                <Reveal key={product.id} delay={(i % 4) * 80} direction="zoom">
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
