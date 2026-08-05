import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { PawPrint, LogIn } from 'lucide-react';
import { loginFormSchema, type LoginFormValues } from '@/domain/schemas';
import { useAuthStore } from '@/store/authStore';
import { Button, FieldWrapper, Input } from '@/design-system/primitives';

export function AdminLoginPage() {
  const { session, status, checkSession, login } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'idle') void checkSession();
  }, [status, checkSession]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginFormSchema) });

  if (session) {
    return <Navigate to="/admin" replace />;
  }

  async function onSubmit(values: LoginFormValues) {
    setSubmitting(true);
    setLoginError(null);
    const ok = await login(values.username, values.password);
    setSubmitting(false);
    if (!ok) {
      setLoginError('Usuário ou senha inválidos.');
      return;
    }
    const from = searchParams.get('from');
    navigate(from && from.startsWith('/admin') ? from : '/admin', { replace: true });
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-cream-deep px-4">
      <title>Login administrativo — Pet Studio</title>
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <PawPrint className="size-10 text-amber-brand" aria-hidden="true" />
          <h1 className="font-display text-xl font-bold text-charcoal">Painel administrativo</h1>
          <p className="text-xs text-muted">
            Ambiente de demonstração — use{' '}
            <code className="rounded bg-cream-deep px-1 py-0.5">
              {import.meta.env.VITE_DEMO_USERNAME || 'admin'}
            </code>{' '}
            /{' '}
            <code className="rounded bg-cream-deep px-1 py-0.5">
              {import.meta.env.VITE_DEMO_PASSWORD || 'petstudio'}
            </code>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FieldWrapper label="Usuário" required error={errors.username?.message}>
            {({ inputId, describedBy }) => (
              <Input
                id={inputId}
                aria-describedby={describedBy}
                invalid={!!errors.username}
                autoComplete="username"
                {...register('username')}
              />
            )}
          </FieldWrapper>

          <FieldWrapper label="Senha" required error={errors.password?.message}>
            {({ inputId, describedBy }) => (
              <Input
                id={inputId}
                type="password"
                aria-describedby={describedBy}
                invalid={!!errors.password}
                autoComplete="current-password"
                {...register('password')}
              />
            )}
          </FieldWrapper>

          {loginError && (
            <p role="alert" className="text-sm font-semibold text-urgent">
              {loginError}
            </p>
          )}

          <Button type="submit" loading={submitting} className="mt-2">
            <LogIn className="size-4" aria-hidden="true" />
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
