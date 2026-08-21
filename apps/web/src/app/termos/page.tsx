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

        <div className="mt-8 space-y-8 text-sm text-foreground leading-relaxed">
          {/* 1 */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">1. Definições</h2>
            <ul className="text-muted-foreground space-y-2">
              <li className="flex gap-2">
                <span className="text-primary mt-1">→</span>
                <span><strong className="text-foreground">"Serviço"</strong> — a plataforma AffiliateOS, incluindo website, API e funcionalidades</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-1">→</span>
                <span><strong className="text-foreground">"Usuário"</strong> — pessoa física ou jurídica que utiliza o Serviço</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-1">→</span>
                <span><strong className="text-foreground">"Conteúdo"</strong> — dados, ofertas, mensagens e informações inseridas pelo Usuário</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-1">→</span>
                <span><strong className="text-foreground">"Assinatura"</strong> — contrato de acesso ao Serviço conforme plano contratado</span>
              </li>
            </ul>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">2. Objeto</h2>
            <p className="text-muted-foreground">
              O AffiliateOS é uma plataforma SaaS de automação de marketing de afiliados que
              permite mineração de ofertas via APIs oficiais de marketplaces (Shopee, Amazon,
              AliExpress, AWIN) e disparo segmentado de mensagens para WhatsApp e Telegram.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">3. Cadastro e conta</h2>
            <ul className="text-muted-foreground space-y-2">
              <li className="flex gap-2">
                <span className="text-foreground mt-1">3.1</span>
                <span>O Usuário deve fornecer dados verdadeiros e completos no cadastro</span>
              </li>
              <li className="flex gap-2">
                <span className="text-foreground mt-1">3.2</span>
                <span>O Usuário é responsável pela segurança de suas credenciais de acesso</span>
              </li>
              <li className="flex gap-2">
                <span className="text-foreground mt-1">3.3</span>
                <span>É vedado compartilhar contas entre pessoas ou organizações</span>
              </li>
              <li className="flex gap-2">
                <span className="text-foreground mt-1">3.4</span>
                <span>É vedado usar dados de terceiros no cadastro sem autorização expressa</span>
              </li>
              <li className="flex gap-2">
                <span className="text-foreground mt-1">3.5</span>
                <span>O Usuário pode ter no máximo uma conta gratuita</span>
              </li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">4. Planos e pagamento</h2>
            <ul className="text-muted-foreground space-y-2">
              <li className="flex gap-2">
                <span className="text-foreground mt-1">4.1</span>
                <span>Os valores e limites de cada plano estão disponíveis na página de preços</span>
              </li>
              <li className="flex gap-2">
                <span className="text-foreground mt-1">4.2</span>
                <span>Pagamentos são processados pela Stripe e renovados automaticamente</span>
              </li>
              <li className="flex gap-2">
                <span className="text-foreground mt-1">4.3</span>
                <span>Planos downgrade no início do próximo ciclo de cobrança</span>
              </li>
              <li className="flex gap-2">
                <span className="text-foreground mt-1">4.4</span>
                <span>Reembolsos são avaliados caso a caso dentro de 7 dias da cobrança</span>
              </li>
              <li className="flex gap-2">
                <span className="text-foreground mt-1">4.5</span>
                <span>Impostos são de responsabilidade do Usuário quando aplicável</span>
              </li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">5. Uso permitido</h2>
            <p className="text-muted-foreground mb-3">O Usuário pode:</p>
            <ul className="text-muted-foreground space-y-2">
              <li className="flex gap-2">
                <span className="text-success mt-1">✓</span>
                <span>Capturar ofertas via APIs oficiais dos marketplaces integrados</span>
              </li>
              <li className="flex gap-2">
                <span className="text-success mt-1">✓</span>
                <span>Enviar mensagens para listas de contatos próprias do Usuário</span>
              </li>
              <li className="flex gap-2">
                <span className="text-success mt-1">✓</span>
                <span>Configurar automações de disparo conforme regras definidas</span>
              </li>
              <li className="flex gap-2">
                <span className="text-success mt-1">✓</span>
                <span>Acessar a API do AffiliateOS via chaves de API autorizadas</span>
              </li>
              <li className="flex gap-2">
                <span className="text-success mt-1">✓</span>
                <span>Gerenciar múltiplos números e canais de comunicação</span>
              </li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">6. Uso proibido</h2>
            <p className="text-muted-foreground mb-3">É terminantemente proibido:</p>
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
              <ul className="text-muted-foreground space-y-2">
                <li className="flex gap-2">
                  <span className="text-destructive mt-1">✗</span>
                  <span>Enviar spam ou mensagens não solicitadas em massa</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-destructive mt-1">✗</span>
                  <span>Violar os termos de uso dos marketplaces integrados</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-destructive mt-1">✗</span>
                  <span>Tentar acessar contas ou dados de outros usuários</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-destructive mt-1">✗</span>
                  <span>Utilizar o serviço para fins ilegais ou não autorizados</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-destructive mt-1">✗</span>
                  <span>Explorar vulnerabilidades ou contornar limites do sistema</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-destructive mt-1">✗</span>
                  <span>Revender ou redistribuir o serviço sem autorização</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-destructive mt-1">✗</span>
                  <span>Usar scraping para marketplaces sem API oficial (Mercado Livre)</span>
                </li>
              </ul>
            </div>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">7. Propriedade intelectual</h2>
            <ul className="text-muted-foreground space-y-2">
              <li className="flex gap-2">
                <span className="text-foreground mt-1">7.1</span>
                <span>O código, design e conteúdo do AffiliateOS são de propriedade exclusiva do desenvolvedor</span>
              </li>
              <li className="flex gap-2">
                <span className="text-foreground mt-1">7.2</span>
                <span>O Usuário mantém a propriedade sobre seus dados, ofertas e listas de contatos</span>
              </li>
              <li className="flex gap-2">
                <span className="text-foreground mt-1">7.3</span>
                <span>O Usuário concede licença limitada de uso do Serviço durante a assinatura</span>
              </li>
            </ul>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">8. Disponibilidade e suporte</h2>
            <ul className="text-muted-foreground space-y-2">
              <li className="flex gap-2">
                <span className="text-foreground mt-1">8.1</span>
                <span>O serviço é fornecido "como está" e "conforme disponível"</span>
              </li>
              <li className="flex gap-2">
                <span className="text-foreground mt-1">8.2</span>
                <span>Não garantimos disponibilidade 100%, mas buscamos uptime de 99.5%</span>
              </li>
              <li className="flex gap-2">
                <span className="text-foreground mt-1">8.3</span>
                <span>Manutenções programadas serão comunicadas com antecedência mínima de 24h</span>
              </li>
              <li className="flex gap-2">
                <span className="text-foreground mt-1">8.4</span>
                <span>O AffiliateOS não se responsabiliza por indisponibilidades de APIs de terceiros</span>
              </li>
              <li className="flex gap-2">
                <span className="text-foreground mt-1">8.5</span>
                <span>Suporte técnico disponível via e-mail para todos os planos</span>
              </li>
            </ul>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">9. Limitação de responsabilidade</h2>
            <div className="rounded-xl border border-warning/20 bg-warning/5 p-4 text-muted-foreground">
              <p className="mb-3">O AffiliateOS <strong className="text-foreground">não se responsabiliza</strong> por:</p>
              <ul className="space-y-2">
                <li className="flex gap-2">
                  <span className="text-warning mt-1">⚠</span>
                  <span>Perdas de dados causadas por falhas de terceiros (marketplaces, provedores)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-warning mt-1">⚠</span>
                  <span>Banimentos de contas de WhatsApp/Telegram por uso de automação</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-warning mt-1">⚠</span>
                  <span>Mudanças nas políticas dos marketplaces que afetem funcionalidades</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-warning mt-1">⚠</span>
                  <span>Consequências do uso inadequado ou ilegal do serviço</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-warning mt-1">⚠</span>
                  <span>Lucros cessantes, danos indiretos ou perdas de oportunidade</span>
                </li>
              </ul>
            </div>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">10. Cancelamento e encerramento</h2>
            <ul className="text-muted-foreground space-y-2">
              <li className="flex gap-2">
                <span className="text-foreground mt-1">10.1</span>
                <span>O Usuário pode cancelar a assinatura a qualquer momento</span>
              </li>
              <li className="flex gap-2">
                <span className="text-foreground mt-1">10.2</span>
                <span>O acesso continua até o final do período já pago</span>
              </li>
              <li className="flex gap-2">
                <span className="text-foreground mt-1">10.3</span>
                <span>Dados pessoais são excluídos em até 30 dias após o término</span>
              </li>
              <li className="flex gap-2">
                <span className="text-foreground mt-1">10.4</span>
                <span>O AffiliateOS reserva-se o direito de encerrar contas que violem estes termos, sem aviso prévio</span>
              </li>
              <li className="flex gap-2">
                <span className="text-foreground mt-1">10.5</span>
                <span>Em caso de cancelamento por violação, não há reembolso</span>
              </li>
            </ul>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">11. Alterações nestes termos</h2>
            <p className="text-muted-foreground">
              Estes termos podem ser atualizados periodicamente. Alterações significativas serão
              comunicadas por e-mail com pelo menos 30 dias de antecedência. O uso continuado
              após o período constitui aceitação das alterações.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">12. Legislação e foro</h2>
            <p className="text-muted-foreground">
              Estes termos são regidos pelas leis da República Federativa do Brasil.
              Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer questões
              decorrentes deste instrumento, com renúncia expressa a qualquer outro por mais
              privilegiado que seja.
            </p>
          </section>

          {/* 13 */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">13. Contato</h2>
            <p className="text-muted-foreground">
              Dúvidas sobre estes termos:{' '}
              <span className="text-primary">contato@affiliateos.com.br</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
