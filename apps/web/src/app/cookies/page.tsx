'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function CookiesPage() {
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
    marketing: false,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao site
        </Link>

        <h1 className="mt-8 text-2xl font-bold text-foreground">Política de Cookies</h1>
        <p className="mt-2 text-sm text-muted-foreground">Última atualização: 20 de agosto de 2026</p>

        <div className="mt-8 space-y-6 text-sm text-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">O que são cookies</h2>
            <p className="text-muted-foreground">
              Cookies são pequenos arquivos armazenados no seu navegador que ajudam o site a
              funcionar corretamente e a melhorar sua experiência.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Cookies utilizados</h2>

            <div className="mt-4 space-y-3">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Essenciais</p>
                    <p className="text-xs text-muted-foreground">
                      Necessários para o funcionamento do site. Não podem ser desativados.
                    </p>
                  </div>
                  <span className="text-xs text-success font-medium">Obrigatórios</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Exemplos: autenticação (JWT), preferências de sessão, CSRF token.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Analytics</p>
                    <p className="text-xs text-muted-foreground">
                      Nos ajudam a entender como o site é utilizado para melhorar o serviço.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences(p => ({ ...p, analytics: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-secondary peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-foreground after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Marketing</p>
                    <p className="text-xs text-muted-foreground">
                      Utilizados para rastrear visitantes em sites para exibir anúncios relevantes.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => setPreferences(p => ({ ...p, marketing: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-secondary peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-foreground after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Como gerenciar</h2>
            <p className="text-muted-foreground">
              Você pode gerenciar suas preferências de cookies nesta página. As preferências
              são salvas localmente no navegador e você pode alterá-las a qualquer momento.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Contato</h2>
            <p className="text-muted-foreground">
              Dúvidas sobre cookies: <span className="text-primary">contato@affiliateos.com.br</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
