import Link from 'next/link';
import { ArrowLeft, Check, Sparkles, Wrench } from 'lucide-react';

const RELEASES = [
  {
    version: 'v1.3.0',
    date: '18 ago 2026',
    changes: {
      added: [
        'Pagamento por PIX com QR Code e atualização automática da assinatura',
        'Console de administração: tenants, usuários, planos e chave PIX',
        'Planos por volume de ofertas processadas por mês',
      ],
      fixed: ['Correção de centavos vs reais no pagamento do Mercado Pago'],
      improved: [
        'Sidebar agora mostra o status real dos serviços',
        'Login com ícones dos provedores (Google, GitHub)',
      ],
    },
  },
  {
    version: 'v1.2.0',
    date: '11 ago 2026',
    changes: {
      added: [
        'Módulo de monitoramento de fila e erros',
        'Analytics: disparos por hora, marketplace, nicho e conversão',
        'Importação manual de ofertas com deduplicação automática',
        'Página pública de status do sistema',
      ],
      fixed: ['Duplicação de ofertas do mesmo produto no cadastro'],
      improved: ['Ofertas agora abrem um drawer com detalhes completos'],
    },
  },
  {
    version: 'v1.1.0',
    date: '4 ago 2026',
    changes: {
      added: ['Modo escuro em todo o produto', 'Histórico de atividade no painel'],
      fixed: ['Falha de build quando o Supabase não está configurado'],
      improved: [
        'Tipografia compacta com dados ao vivo em fonte mono',
        'Performance da listagem de ofertas',
      ],
    },
  },
  {
    version: 'v1.0.0',
    date: '28 jul 2026',
    changes: {
      added: [
        'Dashboard operacional',
        'Ofertas com filtros por marketplace, nicho e busca',
        'Grupos com segmentação por nicho',
        'Mensageria WhatsApp e Telegram com instâncias',
        'Automações por regras com fila, retry e rate limit',
      ],
    },
  },
] as const;

const SECTION_META = {
  added: { label: 'Adicionado', Icon: Sparkles, cls: 'text-success border-success/30 bg-success/10' },
  fixed: { label: 'Corrigido', Icon: Wrench, cls: 'text-warning border-warning/30 bg-warning/10' },
  improved: { label: 'Melhorado', Icon: Check, cls: 'text-primary border-primary/30 bg-primary/10' },
} as const;

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao site
        </Link>

        <h1 className="mt-8 text-2xl font-bold text-foreground">Changelog</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tudo que mudou no AffiliateOS, versão por versão.
        </p>

        <div className="mt-8 space-y-6">
          {RELEASES.map((release) => (
            <article
              key={release.version}
              className="overflow-hidden rounded-lg border border-border bg-card"
            >
              <header className="flex items-baseline justify-between border-b border-border px-4 py-3">
                <span className="font-mono text-sm font-bold text-foreground">
                  {release.version}
                </span>
                <span className="text-xs text-muted-foreground">{release.date}</span>
              </header>
              <div className="space-y-4 px-4 py-4">
                {Object.entries(SECTION_META).map(([key, meta]) => {
                  const items = release.changes[key as keyof typeof release.changes];
                  if (!items?.length) return null;
                  const { label, Icon, cls } = meta;
                  return (
                    <div key={key}>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${cls}`}
                      >
                        <Icon className="h-3 w-3" />
                        {label}
                      </span>
                      <ul className="mt-2 space-y-1.5">
                        {items.map((item) => (
                          <li
                            key={item}
                            className="text-sm text-muted-foreground leading-snug"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}