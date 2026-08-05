import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productFormSchema, type ProductFormValues } from '@/domain/schemas';
import type { Product } from '@/domain/types';
import { productRepository } from '@/data/repositories';
import { Modal, Button, FieldWrapper, Input, Textarea, Select } from '@/design-system/primitives';
import { notify } from '@/lib/notify';
import { centsToReaisInput, parseReaisToCents } from '@/lib/money';

export interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSaved: () => void;
}

function defaultsFor(product: Product | null): ProductFormValues {
  if (!product) {
    return {
      name: '',
      description: '',
      priceReais: '',
      itemType: 'food',
      animalType: 'both',
      imageUrl: '',
      inStock: true,
      saleActive: false,
      salePercentOff: 10,
    };
  }
  return {
    name: product.name,
    description: product.description,
    priceReais: centsToReaisInput(product.priceCents),
    itemType: product.itemType,
    animalType: product.animalType,
    imageUrl: product.imageUrl,
    inStock: product.inStock,
    saleActive: product.sale?.active ?? false,
    salePercentOff: product.sale?.percentOff ?? 10,
  };
}

export function ProductFormModal({ open, onOpenChange, product, onSaved }: ProductFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultsFor(product),
  });

  useEffect(() => {
    if (open) reset(defaultsFor(product));
  }, [open, product, reset]);

  const saleActive = watch('saleActive');
  const priceReais = watch('priceReais');
  const salePercentOff = watch('salePercentOff') ?? 0;
  const priceCentsPreview = parseReaisToCents(priceReais || '0') ?? 0;
  const finalPricePreview = saleActive
    ? Math.round(priceCentsPreview * (1 - salePercentOff / 100))
    : priceCentsPreview;

  async function onSubmit(values: ProductFormValues) {
    const priceCents = parseReaisToCents(values.priceReais);
    if (priceCents === null) return;

    const payload = {
      name: values.name,
      description: values.description ?? '',
      priceCents,
      itemType: values.itemType,
      animalType: values.animalType,
      imageUrl: values.imageUrl,
      inStock: values.inStock,
      sale: values.saleActive ? { active: true, percentOff: values.salePercentOff ?? 10 } : null,
    };

    if (product) {
      await productRepository.update(product.id, payload);
      notify.success('Produto atualizado.');
    } else {
      await productRepository.create(payload);
      notify.success('Produto criado.');
    }
    onSaved();
    onOpenChange(false);
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={product ? 'Editar produto' : 'Novo produto'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
            Salvar
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldWrapper label="Nome" required error={errors.name?.message} className="sm:col-span-2">
          {({ inputId, describedBy }) => (
            <Input id={inputId} aria-describedby={describedBy} invalid={!!errors.name} {...register('name')} />
          )}
        </FieldWrapper>

        <FieldWrapper label="Descrição" error={errors.description?.message} className="sm:col-span-2">
          {({ inputId, describedBy }) => (
            <Textarea id={inputId} aria-describedby={describedBy} rows={2} {...register('description')} />
          )}
        </FieldWrapper>

        <FieldWrapper label="URL da imagem" required error={errors.imageUrl?.message} className="sm:col-span-2">
          {({ inputId, describedBy }) => (
            <Input
              id={inputId}
              aria-describedby={describedBy}
              invalid={!!errors.imageUrl}
              placeholder="https://…"
              {...register('imageUrl')}
            />
          )}
        </FieldWrapper>

        <FieldWrapper label="Preço (R$)" required error={errors.priceReais?.message}>
          {({ inputId, describedBy }) => (
            <Input
              id={inputId}
              aria-describedby={describedBy}
              invalid={!!errors.priceReais}
              placeholder="89,90"
              inputMode="decimal"
              {...register('priceReais')}
            />
          )}
        </FieldWrapper>

        <FieldWrapper label="Tipo" required error={errors.itemType?.message}>
          {({ inputId }) => (
            <Select id={inputId} {...register('itemType')}>
              <option value="food">Ração e petiscos</option>
              <option value="toys">Brinquedos</option>
              <option value="hygiene">Higiene</option>
            </Select>
          )}
        </FieldWrapper>

        <FieldWrapper label="Animal" required error={errors.animalType?.message} className="sm:col-span-2">
          {({ inputId }) => (
            <Select id={inputId} {...register('animalType')}>
              <option value="both">Cães e gatos</option>
              <option value="dog">Cães</option>
              <option value="cat">Gatos</option>
            </Select>
          )}
        </FieldWrapper>

        <label className="flex items-center gap-2 text-sm font-semibold text-charcoal">
          <Controller
            control={control}
            name="inStock"
            render={({ field }) => (
              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                className="size-4 accent-teal"
              />
            )}
          />
          Disponível em estoque
        </label>

        <label className="flex items-center gap-2 text-sm font-semibold text-charcoal">
          <Controller
            control={control}
            name="saleActive"
            render={({ field }) => (
              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                className="size-4 accent-sale"
              />
            )}
          />
          Em promoção
        </label>

        {saleActive && (
          <FieldWrapper
            label="Desconto (%)"
            error={errors.salePercentOff?.message}
            hint={priceCentsPreview ? `Preço final: ${(finalPricePreview / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` : undefined}
            className="sm:col-span-2"
          >
            {({ inputId }) => (
              <Input
                id={inputId}
                type="number"
                min={1}
                max={90}
                {...register('salePercentOff', { valueAsNumber: true })}
              />
            )}
          </FieldWrapper>
        )}
      </form>
    </Modal>
  );
}
