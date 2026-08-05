export function PageLoadingFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-live="polite">
      <span className="sr-only">Carregando…</span>
      <div className="size-10 animate-spin rounded-full border-4 border-cream-deep border-t-teal" />
    </div>
  );
}
