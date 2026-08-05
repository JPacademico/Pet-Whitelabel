import { Link } from 'react-router';
import { PawPrint } from 'lucide-react';
import { Button } from '@/design-system/primitives';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <PawPrint className="size-14 text-amber-brand" aria-hidden="true" />
      <h1 className="font-display text-2xl font-bold text-charcoal">Página não encontrada</h1>
      <p className="max-w-sm text-muted">Parece que essa trilha de patinhas não leva a lugar nenhum.</p>
      <Button asChild>
        <Link to="/">Voltar ao início</Link>
      </Button>
    </div>
  );
}
