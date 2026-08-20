'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
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

        <h1 className="mt-8 text-2xl font-bold text-foreground">Política de Privacidade</h1>
        <p className="mt-2 text-sm text-muted-foreground">Última atualização: 20 de agosto de 2026</p>

        <div className="mt-8 space-y-6 text-sm text-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Dados coletados</h2>
            <p className="text-muted-foreground">
              Coletamos apenas os dados necessários para o funcionamento do serviço:
            </p>
            <ul className="mt-2 list-disc list-inside text-muted-foreground space-y-1">
              <li>Nome e e-mail (cadastro via Supabase Auth)</li>
              <li>Dados de pagamento (processados pela Stripe, não armazenados em nossos servidores)</li>
              <li>Dados de uso do serviço (ofertas acessadas, mensagens enviadas)</li>
              <li>Informações de conexão (tokens de WhatsApp/Telegram para disparos)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Como utilizamos seus dados</h2>
            <p className="text-muted-foreground">
              Utilizamos seus dados exclusivamente para: operar o serviço, enviar ofertas conforme sua configuração,
              processar cobranças e melhorar a experiência do usuário.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Compartilhamento</h2>
            <p className="text-muted-foreground">
              Não vendemos nem compartilhamos dados pessoais com terceiros para fins de marketing.
              Compartilhamos apenas com serviços essenciais ao funcionamento: Supabase (banco), Stripe (pagamentos),
              e provedores de API para captura de ofertas (Shopee, Amazon, AliExpress, AWIN).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Armazenamento</h2>
            <p className="text-muted-foreground">
              Dados são armazenados em servidores no Brasil (Supabase). Backup automático diário.
              Dados de conta são mantidos enquanto a assinatura estiver ativa. Após cancelamento,
              dados pessoais são excluídos em até 30 dias.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Seus direitos</h2>
            <p className="text-muted-foreground">
              Conforme a LGPD, você tem direito a: acessar seus dados, corrigir dados incompletos,
              solicitar exclusão, portabilidade e revogar consentimento. Para exercer seus direitos,
              entre em contato pelo e-mail: <span className="text-primary">contato@affiliateos.com.br</span>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Cookies</h2>
            <p className="text-muted-foreground">
              Utilizamos apenas cookies essenciais para autenticação e preferências de sessão.
              Não utilizamos cookies de rastreamento ou marketing sem consentimento prévio.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Segurança</h2>
            <p className="text-muted-foreground">
              Utilizamos criptografia em trânsito (HTTPS/TLS) e em repouso. Senhas são hasheadas com bcrypt.
              Tokens de acesso expiram após 7 dias. Chaves de API são armazenadas com hash SHA-256.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Contato</h2>
            <p className="text-muted-foreground">
              Dúvidas sobre privacidade: <span className="text-primary">contato@affiliateos.com.br</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
