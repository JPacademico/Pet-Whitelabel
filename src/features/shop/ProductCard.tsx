import { MessageCircle } from 'lucide-react';
import type { Product } from '@/domain/types';
import { Badge, Card } from '@/design-system/primitives';
import { applyDiscount, formatCentsBRL } from '@/lib/money';
import { buildWhatsappUrl, whatsappTemplates } from '@/lib/whatsapp';
import { SITE } from '@/config/site';
import { cn } from '@/lib/cn';

const ANIMAL_LABEL: Record<Product['animalType'], string> = {
  dog: 'Cães',
  cat: 'Gatos',
  both: 'Cães e Gatos',
};

export function ProductCard({ product }: { product: Product }) {
  const finalPriceCents = product.sale?.active
    ? applyDiscount(product.priceCents, product.sale.percentOff)
    : product.priceCents;

  const whatsappUrl = buildWhatsappUrl(
    SITE.whatsapp,
    whatsappTemplates.productInquiry({ productName: product.name }),
  );

  return (
    <Card
      className={cn(
        'flex flex-col gap-3 [content-visibility:auto]',
        !product.inStock && 'grayscale',
      )}
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-cream-deep">
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="size-full object-cover"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.sale?.active && <Badge variant="sale">-{product.sale.percentOff}%</Badge>}
        </div>
        {!product.inStock && (
          <div className="absolute inset-x-0 bottom-0 bg-charcoal/85 py-1.5 text-center">
            <Badge variant="out-of-stock">Esgotado</Badge>
          </div>
        )}
      </div>

      <div className="flex-1">
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">
          {ANIMAL_LABEL[product.animalType]}
        </p>
        <h3 className="mt-0.5 font-display font-bold text-charcoal">{product.name}</h3>
        <p className="mt-1 text-sm text-muted">{product.description}</p>
      </div>

      <div className="flex items-end justify-between gap-2">
        <div>
          {product.sale?.active && (
            <p className="text-xs text-muted line-through">{formatCentsBRL(product.priceCents)}</p>
          )}
          <p className={cn('font-display text-lg font-bold', product.sale?.active ? 'text-sale' : 'text-charcoal')}>
            {formatCentsBRL(finalPriceCents)}
          </p>
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-full bg-teal p-2 sm:px-3 sm:py-2 text-xs font-semibold text-white transition-colors hover:bg-teal-deep"
        >
          <MessageCircle className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Consultar</span>
        </a>
      </div>
    </Card>
  );
}
