'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const FAQS = [
  {
    q: 'Como funcionam as capturas de ofertas?',
    a: 'Usamos apenas APIs oficiais de marketplace (Shopee, Amazon PA-API, AliExpress e AWIN). Não fazemos scraping de mercados sem API oficial, como o Mercado Livre, por risco legal.',
  },
  {
    q: 'O WhatsApp pode ser banido?',
    a: 'Conexões via Baileys/Evolution não são suportadas pela Meta e podem resultar em banimento. O painel mostra o status de cada instância e indicamos o Telegram como canal mais seguro.',
  },
  {
    q: 'Preciso saber programar para usar?',
    a: 'Não. Conecta as APIs, organiza os grupos por nicho e cria as regras. O sistema captura, segmenta e dispara automaticamente.',
  },
  {
    q: 'Como funciona o teste grátis?',
    a: 'Você tem 7 dias de acesso completo, sem cartão. Se não servir, não cobramos nada.',
  },
  {
    q: 'Meus dados estão seguros?',
    a: 'Sim. Seguimos a LGPD: coletamos só o necessário, com criptografia e controle de acesso. Veja a Política de Privacidade.',
  },
];

export default function FaqPage() {
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

        <h1 className="mt-8 text-2xl font-bold text-foreground">
          Perguntas frequentes
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Respostas rápidas sobre o AffiliateOS. Para algo específico, fale conosco
          em <Link href="/contato" className="text-primary hover:underline">Contato</Link>.
        </p>

        <div className="mt-8 space-y-4">
          {FAQS.map((f, i) => (
            <section
              key={i}
              className="rounded-lg border border-border bg-card p-5"
            >
              <h2 className="text-sm font-semibold text-foreground">{f.q}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
