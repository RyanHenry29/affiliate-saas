'use client';

import { useState, FormEvent } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { SocialLoginButtons } from '@/components/auth/social-login-buttons';

type Mode = 'login' | 'register';

function BrandOrbit({
  loading,
  hasError,
  reduce,
}: {
  loading: boolean;
  hasError: boolean;
  reduce: boolean | null;
}) {
  const dotColor = hasError ? 'rgb(var(--destructive))' : 'rgb(var(--primary))';
  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      <motion.div
        className="absolute inset-0"
        animate={loading && !reduce ? { rotate: 360 } : { rotate: 0 }}
        transition={
          loading && !reduce
            ? { repeat: Infinity, duration: 1.2, ease: 'linear' }
            : { duration: 0.2 }
        }
      >
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="rgb(var(--border))"
            className="orbit__path"
          />
        </svg>
        <span
          className="absolute left-1/2 top-1 h-2.5 w-2.5 -translate-x-1/2 rounded-full"
          style={{ background: dotColor }}
        />
      </motion.div>
    </div>
  );
}

export function AuthShell({ initialMode = 'login' }: { initialMode?: Mode }) {
  const { login, register, loading } = useAuth();
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [error, setError] = useState('');

  const isRegister = mode === 'register';

  function switchMode(next: Mode) {
    setMode(next);
    setError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'login') await login(email, password);
      else await register(email, password, tenantName);
    } catch (err: any) {
      setError(
        err?.message ||
          (mode === 'login' ? 'Credenciais inválidas' : 'Erro ao criar conta'),
      );
    }
  }

  const fieldClass =
    'w-full border border-input bg-background rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors';

  return (
    <div className="relative flex min-h-screen bg-background">
      <a
        href="/"
        className="absolute left-4 top-4 z-10 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar ao site
      </a>

      <div className="hidden w-1/2 flex-col justify-center gap-8 border-r border-border bg-card/40 px-12 lg:flex">
        <BrandOrbit loading={loading} hasError={!!error} reduce={reduce} />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Affiliate<span className="text-primary">OS</span>
          </h1>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Plataforma operacional para canais de ofertas. Centralize,
            automatize e monitore disparos.
          </p>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Ofertas de 4 marketplaces via API oficial
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Disparo com fila, retry e rate limit
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Logs e status das instâncias em tempo real
          </li>
        </ul>
      </div>

      <div className="flex w-full items-center justify-center p-4 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-6 lg:hidden">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Affiliate<span className="text-primary">OS</span>
            </h1>
          </div>

          <div className="mb-6 flex rounded-lg bg-secondary p-0.5 text-sm">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 rounded-md px-3 py-1.5 font-medium transition-colors ${
                !isRegister ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`flex-1 rounded-md px-3 py-1.5 font-medium transition-colors ${
                isRegister ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Criar conta
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              onSubmit={handleSubmit}
              initial={reduce ? false : { opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              className="surface-card space-y-4 p-6"
            >
              {isRegister && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Nome da organização
                  </label>
                  <input
                    type="text"
                    required
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    className={fieldClass}
                    placeholder="Minha Empresa"
                  />
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={fieldClass}
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Senha
                </label>
                <input
                  type="password"
                  required
                  minLength={isRegister ? 8 : undefined}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={fieldClass}
                  placeholder={isRegister ? 'Mínimo 8 caracteres' : '••••••••'}
                />
              </div>

              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isRegister ? 'Criando conta...' : 'Entrando...'}
                  </>
                ) : isRegister ? (
                  'Criar conta'
                ) : (
                  'Entrar'
                )}
              </Button>
            </motion.form>
          </AnimatePresence>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            ou continue com
            <span className="h-px flex-1 bg-border" />
          </div>

          <SocialLoginButtons />

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {isRegister ? (
              <>
                Já tem conta?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-primary hover:underline"
                >
                  Entrar
                </button>
              </>
            ) : (
              <>
                Não tem conta?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="text-primary hover:underline"
                >
                  Cadastre-se
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
