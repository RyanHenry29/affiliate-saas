'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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

        <h1 className="mt-8 text-2xl font-bold text-foreground">Termos de Uso</h1>
        <p className="mt-2 text-sm text-muted-foreground">Última atualização: 20 de agosto de 2026</p>

        <div className="mt-8 space-y-6 text-sm text-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Objeto</h2>
            <p className="text-muted-foreground">
              O AffiliateOS é uma plataforma de automação de marketing de afiliados que permite
              mineração de ofertas via APIs oficiais de marketplaces e disparo segmentado de
              mensagens para WhatsApp e Telegram.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Cadastro</h2>
            <p className="text-muted-foreground">
              Para utilizar o serviço, o usuário deve criar uma conta com dados verdadeiros.
              O usuário é responsável pela segurança de suas credenciais de acesso.
              É vedado comparthar contas entre pessoas ou organizações.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Planos e Pagamento</h2>
            <p className="text-muted-foreground">
              O serviço é oferecido em planos com diferentes limites de uso. Os valores e
              limites estão disponíveis na página de preços. O pagamento é processado pela Stripe
              e renovado automaticamente. O usuário pode cancelar a qualquer momento.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Uso Permitido</h2>
            <ul className="mt-2 list-disc list-inside text-muted-foreground space-y-1">
              <li>Capturar ofertas via APIs oficiais dos marketplaces integrados</li>
              <li>Enviar mensagens para listas de contatos próprias do usuário</li>
              <li>Configurar automações de disparo conforme regras definidas</li>
              <li>Acessar a API do AffiliateOS via chaves de API</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Uso Proibido</h2>
            <ul className="mt-2 list-disc list-inside text-muted-foreground space-y-1">
              <li>Enviar spam ou mensagens não solicitadas em massa</li>
              <li>Violar os termos de uso dos marketplaces integrados</li>
              <li>Tentar acessar contas ou dados de outros usuários</li>
              <li>Utilizar o serviço para fins ilegais ou não autorizados</li>
              <li>Explorar vulnerabilidades ou contornar limites do sistema</li>
              <li>Revender ou redistribuir o serviço sem autorização</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Disponibilidade</h2>
            <p className="text-muted-foreground">
              O serviço é fornecido "como está" e "conforme disponível". Não garantimos
              disponibilidade 100%. Manutenções programadas serão comunicadas com antecedência.
              O AffiliateOS não se responsabiliza por indisponibilidades de APIs de terceiros
              (marketplaces, WhatsApp, Telegram).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Propriedade Intelectual</h2>
            <p className="text-muted-foreground">
              Todo o código, design e conteúdo do AffiliateOS são de propriedade exclusiva do
              desenvolvedor. O usuário mantém a propriedade sobre seus dados e listas de contatos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Limitação de Responsabilidade</h2>
            <p className="text-muted-foreground">
              O AffiliateOS não se responsabiliza por: perdas de dados de terceiros, banimentos
              de contas de WhatsApp/Telegram, mudanças nas políticas dos marketplaces ou
              consequências do uso inadequado do serviço.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">9. Cancelamento e Encerramento</h2>
            <p className="text-muted-foreground">
              O usuário pode cancelar sua assinatura a qualquer momento. Após o cancelamento,
              o acesso continua até o final do período pago. Dados pessoais são excluídos em até
              30 dias. O AffiliateOS reserva-se o direito de encerrar contas que violem estes termos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">10. Alterações</h2>
            <p className="text-muted-foreground">
              Estes termos podem ser atualizados periodicamente. Alterações significativas serão
              comunicadas por e-mail. O uso continuado após as alterações constitui aceitação.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">11. Contato</h2>
            <p className="text-muted-foreground">
              Dúvidas sobre estes termos: <span className="text-primary">contato@affiliateos.com.br</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
