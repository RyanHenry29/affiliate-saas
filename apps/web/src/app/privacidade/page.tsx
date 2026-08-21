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

        <div className="mt-8 space-y-8 text-sm text-foreground leading-relaxed">
          {/* 1 */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">1. Controlador dos dados</h2>
            <p className="text-muted-foreground">
              O <strong className="text-foreground">AffiliateOS</strong> é responsável pelo tratamento dos seus dados pessoais.
              Qualquer solicitação relativa à LGPD deve ser enviada para{' '}
              <span className="text-primary">privacidade@affiliateos.com.br</span>.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">2. Dados que coletamos</h2>
            <p className="text-muted-foreground mb-3">Coletamos apenas os dados estritamente necessários para o funcionamento do serviço:</p>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/20">
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground text-[10px] uppercase tracking-wider">Categoria</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground text-[10px] uppercase tracking-wider">Dados</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground text-[10px] uppercase tracking-wider">Base legal</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border">
                    <td className="px-4 py-2.5 font-medium text-foreground">Cadastro</td>
                    <td className="px-4 py-2.5">Nome, e-mail, empresa</td>
                    <td className="px-4 py-2.5">Execução de contrato</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-2.5 font-medium text-foreground">Pagamento</td>
                    <td className="px-4 py-2.5">Dados de cartão (via Stripe, não armazenados)</td>
                    <td className="px-4 py-2.5">Execução de contrato</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-2.5 font-medium text-foreground">Operação</td>
                    <td className="px-4 py-2.5">Ofertas acessadas, mensagens enviadas, logs de uso</td>
                    <td className="px-4 py-2.5">Legítimo interesse</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-2.5 font-medium text-foreground">Conexões</td>
                    <td className="px-4 py-2.5">Tokens de WhatsApp/Telegram (encriptados)</td>
                    <td className="px-4 py-2.5">Execução de contrato</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-medium text-foreground">API</td>
                    <td className="px-4 py-2.5">Chaves de API (hash SHA-256)</td>
                    <td className="px-4 py-2.5">Execução de contrato</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">3. Como utilizamos seus dados</h2>
            <ul className="text-muted-foreground space-y-2">
              <li className="flex gap-2">
                <span className="text-success mt-1">•</span>
                <span><strong className="text-foreground">Operação do serviço</strong> — processar ofertas, disparar mensagens, gerenciar assinaturas</span>
              </li>
              <li className="flex gap-2">
                <span className="text-success mt-1">•</span>
                <span><strong className="text-foreground">Comunicação</strong> — enviar e-mails sobre status da conta, atualizações do serviço e suporte</span>
              </li>
              <li className="flex gap-2">
                <span className="text-success mt-1">•</span>
                <span><strong className="text-foreground">Melhoria contínua</strong> — analisar padrões de uso para otimizar performance e UX</span>
              </li>
              <li className="flex gap-2">
                <span className="text-success mt-1">•</span>
                <span><strong className="text-foreground">Segurança</strong> — prevenir fraudes, abuso e acesso não autorizado</span>
              </li>
              <li className="flex gap-2">
                <span className="text-success mt-1">•</span>
                <span><strong className="text-foreground">Obrigações legais</strong> — cumprir legislação fiscal e regulatória</span>
              </li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">4. Compartilhamento de dados</h2>
            <p className="text-muted-foreground mb-3">
              Não vendemos nem compartilhamos dados pessoais para fins de marketing. Compartilhamos apenas com:
            </p>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/20">
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground text-[10px] uppercase tracking-wider">Parceiro</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground text-[10px] uppercase tracking-wider">Finalidade</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground text-[10px] uppercase tracking-wider">Localização</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border">
                    <td className="px-4 py-2.5 font-medium text-foreground">Supabase</td>
                    <td className="px-4 py-2.5">Banco de dados e autenticação</td>
                    <td className="px-4 py-2.5">Brasil</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-2.5 font-medium text-foreground">Stripe</td>
                    <td className="px-4 py-2.5">Processamento de pagamentos</td>
                    <td className="px-4 py-2.5">EUA (SCC)</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-2.5 font-medium text-foreground">Vercel</td>
                    <td className="px-4 py-2.5">Hospedagem do frontend</td>
                    <td className="px-4 py-2.5">Global (CDN)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-medium text-foreground">Render</td>
                    <td className="px-4 py-2.5">Hospedagem da API e workers</td>
                    <td className="px-4 py-2.5">EUA</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">5. Retenção de dados</h2>
            <ul className="text-muted-foreground space-y-2">
              <li className="flex gap-2">
                <span className="text-primary mt-1">→</span>
                <span><strong className="text-foreground">Conta ativa:</strong> dados mantidos durante toda a vigência da assinatura</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-1">→</span>
                <span><strong className="text-foreground">Após cancelamento:</strong> dados pessoais excluídos em até 30 dias</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-1">→</span>
                <span><strong className="text-foreground">Logs de auditoria:</strong> mantidos por 12 meses para fins de segurança</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-1">→</span>
                <span><strong className="text-foreground">Dados fiscais:</strong> mantidos por 5 anos conforme legislação tributária</span>
              </li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">6. Seus direitos (LGPD)</h2>
            <p className="text-muted-foreground mb-3">Conforme a Lei Geral de Proteção de Dados, você tem direito a:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { title: 'Acesso', desc: 'Solicitar cópia de todos os seus dados pessoais' },
                { title: 'Correção', desc: 'Corrigir dados incompletos ou desatualizados' },
                { title: 'Exclusão', desc: 'Solicitar a remoção permanente dos seus dados' },
                { title: 'Portabilidade', desc: 'Receber seus dados em formato estruturado' },
                { title: 'Revogação', desc: 'Retirar o consentimento a qualquer momento' },
                { title: 'Oposição', desc: 'Opor-se ao tratamento baseado em legítimo interesse' },
              ].map((r) => (
                <div key={r.title} className="rounded-lg border border-border bg-card p-3">
                  <p className="font-medium text-foreground text-xs">{r.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{r.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-muted-foreground">
              Para exercer qualquer direito, envie e-mail para{' '}
              <span className="text-primary">privacidade@affiliateos.com.br</span>.
              Responderemos em até 15 dias úteis.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">7. Transferência internacional</h2>
            <p className="text-muted-foreground">
              Alguns serviços utilizados (Stripe, Render) processam dados fora do Brasil.
              Nesses casos, garantimos a proteção mediante Cláusulas Contratuais Padrão (SCC)
              e verificação de adequação do regime de proteção de dados do país de destino.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">8. Cookies</h2>
            <p className="text-muted-foreground">
              Utilizamos apenas cookies essenciais para autenticação (JWT) e preferências de sessão.
              Não utilizamos cookies de rastreamento ou marketing. Para mais detalhes, consulte nossa{' '}
              <Link href="/cookies" className="text-primary hover:underline">Política de Cookies</Link>.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">9. Segurança</h2>
            <ul className="text-muted-foreground space-y-2">
              <li className="flex gap-2">
                <span className="text-success mt-1">✓</span>
                <span> Criptografia TLS 1.3 em trânsito e AES-256 em repouso</span>
              </li>
              <li className="flex gap-2">
                <span className="text-success mt-1">✓</span>
                <span> Senhas hasheadas com bcrypt (fator 12)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-success mt-1">✓</span>
                <span> Tokens JWT com expiração de 7 dias</span>
              </li>
              <li className="flex gap-2">
                <span className="text-success mt-1">✓</span>
                <span> Chaves de API armazenadas com hash SHA-256 (nunca em texto plano)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-success mt-1">✓</span>
                <span> Backup automático diário com retenção de 30 dias</span>
              </li>
              <li className="flex gap-2">
                <span className="text-success mt-1">✓</span>
                <span> Rate limiting em todas as endpoints da API</span>
              </li>
            </ul>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">10. Menores de idade</h2>
            <p className="text-muted-foreground">
              O AffiliateOS é destinado a maiores de 18 anos. Não coletamos intencionalmente dados
              de menores de idade. Se identificarmos que um menor forneceu dados, excluiremos
              imediatamente as informações coletadas.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">11. Alterações nesta política</h2>
            <p className="text-muted-foreground">
              Alterações significativas serão comunicadas por e-mail e com aviso destacado no painel
              com pelo menos 30 dias de antecedência. O uso continuado após o período constitui
              aceitação das alterações.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">12. Contato e Encarregado (DPO)</h2>
            <p className="text-muted-foreground">
              Dúvidas, solicitações ou reclamações sobre dados pessoais:
            </p>
            <div className="mt-3 rounded-xl border border-border bg-card p-4 text-muted-foreground">
              <p><strong className="text-foreground">E-mail:</strong> privacidade@affiliateos.com.br</p>
              <p className="mt-1"><strong className="text-foreground">Prazo de resposta:</strong> até 15 dias úteis</p>
              <p className="mt-1"><strong className="text-foreground">ANPD:</strong> Em caso de insatisfação, você pode registrar reclamação na Autoridade Nacional de Proteção de Dados (www.gov.br/anpd)</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
