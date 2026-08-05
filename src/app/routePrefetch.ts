// Warms a route's lazy chunk on hover/focus so the navigation feels instant without adding
// anything to the initial download. Each import is memoised by the browser's module cache, so
// repeated hovers are free. See IMPLEMENTATION_PLAN.md §4.1.
const loaders: Record<string, () => Promise<unknown>> = {
  '/loja': () => import('@/features/shop/ShopPage'),
  '/banho-e-tosa': () => import('@/features/grooming/GroomingPage'),
  '/clinica': () => import('@/features/clinic/ClinicPage'),
  '/hotel': () => import('@/features/hotel/HotelPage'),
  '/galeria': () => import('@/features/gallery/GalleryPage'),
};

const prefetched = new Set<string>();

export function prefetchRoute(path: string): void {
  if (prefetched.has(path)) return;
  const load = loaders[path];
  if (!load) return;
  prefetched.add(path);
  void load().catch(() => prefetched.delete(path));
}
