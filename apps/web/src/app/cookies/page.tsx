'use client';

import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { useState } from 'react';

export default function CookiesPage() {
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
    marketing: false,
  });
  const [saved, setSaved] = useState(false);

  function handleSave() {
    localStorage.setItem('cookie-preferences', JSON.stringify(preferences));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

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

        <div className="mt-8 space-y-8 text-sm text-foreground leading-relaxed">
          {/* O que são */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">O que são cookies</h2>
            <p className="text-muted-foreground">
              Cookies são pequenos arquivos de texto armazenados no seu navegador quando você
              visita um site. Eles são amplamente utilizados para fazer os sites funcionarem
              de forma eficiente e fornecer informações aos proprietários do site.
            </p>
          </section>

          {/* Como usamos */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">Como utilizamos cookies</h2>
            <p className="text-muted-foreground mb-4">
              O AffiliateOS utiliza cookies para as seguintes finalidades:
            </p>

            <div className="space-y-3">
              {/* Essenciais */}
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-success" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Essenciais</p>
                      <p className="text-xs text-muted-foreground">
                        Necessários para o funcionamento do site. Não podem ser desativados.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-success font-medium bg-success/10 rounded-full px-2 py-1">Obrigatórios</span>
                </div>
                <div className="mt-3 rounded-lg bg-secondary/30 p-3">
                  <p className="text-[11px] text-muted-foreground">
                    <strong className="text-foreground">Incluem:</strong> JWT de autenticação (httpOnly), session_id, CSRF token,
                    preferência de idioma, cookie de consentimento LGPD
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    <strong className="text-foreground">Retenção:</strong> Sessão (expiram ao fechar o navegador) ou 30 dias (preferências)
                  </p>
                </div>
              </div>

              {/* Analytics */}
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 20V10M12 20V4M6 20v-6" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Analytics</p>
                      <p className="text-xs text-muted-foreground">
                        Nos ajudam a entender como o site é utilizado para melhorar o serviço.
                      </p>
                    </div>
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
                <div className="mt-3 rounded-lg bg-secondary/30 p-3">
                  <p className="text-[11px] text-muted-foreground">
                    <strong className="text-foreground">Incluem:</strong> Google Analytics (_ga, _gid), Vercel Analytics (_vercel_insights)
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    <strong className="text-foreground">Retenção:</strong> 26 meses (Google Analytics) ou 1 ano (Vercel)
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    <strong className="text-foreground">Dados coletados:</strong> Páginas visitadas, tempo na página, dispositivo, origem
                  </p>
                </div>
              </div>

              {/* Marketing */}
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center">
                      <svg className="h-4 w-4 text-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Marketing</p>
                      <p className="text-xs text-muted-foreground">
                        Utilizados para rastrear visitantes para exibir anúncios relevantes.
                      </p>
                    </div>
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
                <div className="mt-3 rounded-lg bg-secondary/30 p-3">
                  <p className="text-[11px] text-muted-foreground">
                    <strong className="text-foreground">Nota:</strong> Atualmente não utilizamos cookies de marketing. Esta categoria
                    está disponível para futuras integrações. Se ativada, você será notificado antes da ativação.
                  </p>
                </div>
              </div>
            </div>

            {/* Save button */}
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {saved ? '✓ Preferências salvas' : 'Salvar preferências'}
              </button>
              {saved && (
                <span className="text-xs text-success">Salvo com sucesso</span>
              )}
            </div>
          </section>

          {/* Gerenciamento */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">Gerenciar cookies no navegador</h2>
            <p className="text-muted-foreground mb-3">
              Você pode controlar e/ou deletar cookies através das configurações do seu navegador:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { name: 'Chrome', url: 'chrome://settings/cookies' },
                { name: 'Firefox', url: 'about:preferences#privacy' },
                { name: 'Safari', url: 'Safari > Preferências > Privacidade' },
                { name: 'Edge', url: 'edge://settings/privacy' },
              ].map((b) => (
                <div key={b.name} className="rounded-lg border border-border bg-card p-3 text-center">
                  <p className="font-medium text-foreground text-xs">{b.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 truncate">{b.url}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Cookies específicos */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">Lista completa de cookies</h2>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/20">
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground text-[10px] uppercase tracking-wider">Cookie</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground text-[10px] uppercase tracking-wider">Tipo</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground text-[10px] uppercase tracking-wider">Finalidade</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground text-[10px] uppercase tracking-wider">Retenção</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground text-xs">
                  <tr className="border-b border-border">
                    <td className="px-4 py-2 font-mono text-foreground">sb-access-token</td>
                    <td className="px-4 py-2">Essencial</td>
                    <td className="px-4 py-2">Autenticação JWT</td>
                    <td className="px-4 py-2">Sessão</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-2 font-mono text-foreground">sb-refresh-token</td>
                    <td className="px-4 py-2">Essencial</td>
                    <td className="px-4 py-2">Renovação de sessão</td>
                    <td className="px-4 py-2">30 dias</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-2 font-mono text-foreground">csrf-token</td>
                    <td className="px-4 py-2">Essencial</td>
                    <td className="px-4 py-2">Proteção CSRF</td>
                    <td className="px-4 py-2">Sessão</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-2 font-mono text-foreground">cookie-consent</td>
                    <td className="px-4 py-2">Essencial</td>
                    <td className="px-4 py-2">Registro de consentimento LGPD</td>
                    <td className="px-4 py-2">1 ano</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-2 font-mono text-foreground">_ga</td>
                    <td className="px-4 py-2">Analytics</td>
                    <td className="px-4 py-2">Google Analytics — ID do utilizador</td>
                    <td className="px-4 py-2">26 meses</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-2 font-mono text-foreground">_gid</td>
                    <td className="px-4 py-2">Analytics</td>
                    <td className="px-4 py-2">Google Analytics — sessão</td>
                    <td className="px-4 py-2">24 horas</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-foreground">_vercel_insights</td>
                    <td className="px-4 py-2">Analytics</td>
                    <td className="px-4 py-2">Vercel Analytics — métricas de performance</td>
                    <td className="px-4 py-2">1 ano</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Contato */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">Contato</h2>
            <p className="text-muted-foreground">
              Dúvidas sobre cookies: <span className="text-primary">privacidade@affiliateos.com.br</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
