import { isRouteErrorResponse, useRouteError, useNavigate } from 'react-router';
import { Bone, RotateCcw } from 'lucide-react';
import { Button } from '@/design-system/primitives';
import { resetDemoData } from '@/data/repositories';

// A route-level error boundary so a crash in one page (e.g. the Shop grid) can't take down
// the whole site. See IMPLEMENTATION_PLAN.md §4.5.
export function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();
  const is404 = isRouteErrorResponse(error) && error.status === 404;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-cream px-6 text-center">
      <Bone className="size-14 text-amber-brand" aria-hidden="true" />
      <h1 className="font-display text-2xl font-bold text-charcoal">
        {is404 ? 'Página não encontrada' : 'Ops, esse osso a gente não achou'}
      </h1>
      <p className="max-w-sm text-muted">
        {is404
          ? 'O endereço que você tentou acessar não existe.'
          : 'Algo deu errado ao carregar esta página. Você pode tentar novamente ou voltar ao início.'}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={() => navigate('/')}>Voltar ao início</Button>
        {!is404 && (
          <Button
            variant="secondary"
            onClick={() => {
              resetDemoData();
              window.location.href = '/';
            }}
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Reiniciar dados de demonstração
          </Button>
        )}
      </div>
    </div>
  );
}
