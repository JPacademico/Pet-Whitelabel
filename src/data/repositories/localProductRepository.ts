import type { NewProduct, Product, ProductFilter } from '@/domain/types';
import { productListSchema } from '@/domain/schemas';
import { readCollection, writeCollection } from '@/data/storage/driver';
import { STORAGE_KEYS } from '@/data/storage/keys';
import { simulatedLatency } from '@/lib/delay';
import { normalizeForSearch } from '@/lib/search';
import { useDataVersion } from '@/store/dataVersion';
import type { ProductRepository } from '@/data/ports';

function readAll(): Product[] {
  return readCollection(STORAGE_KEYS.products, productListSchema);
}

function writeAll(products: Product[]): void {
  writeCollection(STORAGE_KEYS.products, products);
}

function matchesFilter(product: Product, filter?: ProductFilter): boolean {
  if (!filter) return true;
  if (filter.itemType && product.itemType !== filter.itemType) return false;
  if (filter.animalType && product.animalType !== 'both' && product.animalType !== filter.animalType) {
    return false;
  }
  if (filter.onlyInStock && !product.inStock) return false;
  if (filter.onlyOnSale && !product.sale?.active) return false;
  if (filter.query) {
    const q = normalizeForSearch(filter.query);
    const haystack = normalizeForSearch(`${product.name} ${product.description}`);
    if (!haystack.includes(q)) return false;
  }
  return true;
}

export const localProductRepository: ProductRepository = {
  async list(filter) {
    await simulatedLatency();
    return readAll().filter((p) => matchesFilter(p, filter));
  },

  async get(id) {
    await simulatedLatency();
    return readAll().find((p) => p.id === id) ?? null;
  },

  async create(input: NewProduct) {
    await simulatedLatency();
    const now = new Date().toISOString();
    const product: Product = { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    writeAll([product, ...readAll()]);
    useDataVersion.getState().bump('products');
    return product;
  },

  async update(id, patch) {
    await simulatedLatency();
    const products = readAll();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) throw new Error(`Product ${id} not found`);
    const updated: Product = { ...products[index]!, ...patch, id, updatedAt: new Date().toISOString() };
    products[index] = updated;
    writeAll(products);
    useDataVersion.getState().bump('products');
    return updated;
  },

  async remove(id) {
    await simulatedLatency();
    writeAll(readAll().filter((p) => p.id !== id));
    useDataVersion.getState().bump('products');
  },
};
