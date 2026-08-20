'use client';

import Link from 'next/link';
import useSWR from 'swr';
import { useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowLeft, Bot, CheckCircle2, MessageCircle,
  Store, Users, Zap, ExternalLink, Copy, Check, X
} from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toastSuccess } from '@/lib/toast';

const fetcher = (url: string) => api.get(url);

interface StepConfig {
  id: string;
  label: string;
  description: string;
  detailedGuide: string[];
  done: (data: any) => boolean;
  href: string;
  externalLink?: string;
  Icon: React.ComponentType<{ className?: string }>;
}

export default function OnboardingPage() {
  const reduce = useReducedMotion();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const { data: connections, mutate: mutateConn } = useSWR('/connections', fetcher);
  const { data: instances, mutate: mutateInst } = useSWR('/messaging/instances', fetcher);
  const { data: groups, mutate: mutateGrp } = useSWR('/groups', fetcher);
  const { data: rules, mutate: mutateRules } = useSWR('/automation', fetcher);

  const steps: StepConfig[] = [
    {
      id: 'marketplace',
      label: 'Conecte um marketplace',
      description: 'Adicione as credenciais das APIs oficiais para começar a capturar ofertas automaticamente.',
      detailedGuide: [
        'Acesse a página de Conexões',
        'Clique em "Nova Conexão"',
        'Escolha o marketplace (Shopee, Amazon, AliExpress ou AWIN)',
        'Insira as credenciais da API de afiliados',
        'Teste a conexão antes de salvar',
      ],
      done: () => (connections as any[])?.length > 0,
      href: '/connections',
      Icon: Store,
    },
    {
      id: 'messaging',
      label: 'Conecte uma instância de mensagem',
      description: 'Ligue uma instância de WhatsApp ou Telegram para enviar ofertas aos seus grupos.',
      detailedGuide: [
        'Acesse a página de Mensageria',
        'Clique em "Nova Instância"',
        'Escolha o canal (WhatsApp via Evolution API ou Telegram)',
        'Configure as credenciais de acesso',
        'Escaneie o QR Code (WhatsApp) ou insira o token (Telegram)',
        'Verifique o status "Conectado" antes de prosseguir',
      ],
      done: () => (instances as any[])?.length > 0,
      href: '/messaging',
      Icon: MessageCircle,
    },
    {
      id: 'groups',
      label: 'Crie um grupo de disparo',
      description: 'Defina um grupo e os nichos que ele deve receber. Cada grupo recebe apenas ofertas relevantes.',
      detailedGuide: [
        'Acesse a página de Grupos',
        'Clique em "Novo Grupo"',
        'Defina um nome identificador (ex: "Achadinhos Tech")',
        'Selecione os nichos relevantes (Tech, Casa, Moda, etc.)',
        'Vincule a instância de mensagem',
        'Ative o grupo para começar a receber ofertas',
      ],
      done: () => (groups as any[])?.length > 0,
      href: '/groups',
      Icon: Users,
    },
    {
      id: 'automation',
      label: 'Crie sua primeira regra',
      description: 'Automatize a seleção e publicação de ofertas. Defina critérios como desconto mínimo e nicho.',
      detailedGuide: [
        'Acesse a página de Automações',
        'Clique em "Nova Regra"',
        'Defina o nome da regra',
        'Configure os critérios (desconto mínimo, avaliação, marketplace)',
        'Selecione os grupos de destino',
        'Defina o horário de operação (opcional)',
        'Ative a regra para começar a publicar automaticamente',
      ],
      done: () => (rules as any[])?.length > 0,
      href: '/automation',
      Icon: Bot,
    },
  ];

  const doneCount = steps.filter((s) => s.done(null)).length;
  const progress = Math.round((doneCount / steps.length) * 100);
  const isAllDone = doneCount === steps.length;

  function handleNext() {
    if (currentStep < steps.length - 1) {
      setCompletedSteps((prev) => new Set(Array.from(prev).concat(currentStep)));
      setCurrentStep((prev) => prev + 1);
    }
  }

  function handlePrev() {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }

  function handleStepClick(index: number) {
    setCurrentStep(index);
  }

  const step = steps[currentStep];
  const Icon = step.Icon;
  const stepDone = step.done(null);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Configuração Inicial</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Complete os passos abaixo para deixar sua operação pronta.
        </p>
      </div>

      {/* Progress bar */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">
            {doneCount} de {steps.length} passos concluídos
          </span>
          <span className="font-mono text-muted-foreground tabular-nums">{progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
          <motion.div
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="h-full rounded-full bg-primary"
          />
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-between">
        {steps.map((s, i) => {
          const StepIcon = s.Icon;
          const isDone = s.done(null);
          const isCurrent = i === currentStep;
          return (
            <button
              key={s.id}
              onClick={() => handleStepClick(i)}
              className={cn(
                'flex flex-col items-center gap-1.5 transition-colors',
                isCurrent ? 'text-primary' : isDone ? 'text-success' : 'text-muted-foreground',
              )}
            >
              <span
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                  isCurrent ? 'border-primary bg-primary/10' : isDone ? 'border-success bg-success/10' : 'border-border bg-secondary',
                )}
              >
                {isDone ? <CheckCircle2 className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
              </span>
              <span className="text-[10px] font-medium hidden sm:block">
                Passo {i + 1}
              </span>
            </button>
          );
        })}
      </div>

      {/* Current step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={reduce ? false : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? undefined : { opacity: 0, x: -20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="rounded-lg border border-border bg-card p-6"
        >
          <div className="flex items-start gap-4">
            <span
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                stepDone ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary',
              )}
            >
              {stepDone ? <CheckCircle2 className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">{step.label}</h2>
                {stepDone && (
                  <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                    Concluído
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
            </div>
          </div>

          {/* Detailed guide */}
          <div className="mt-5 rounded-lg bg-background/50 p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Como fazer
            </p>
            <ol className="space-y-2">
              {step.detailedGuide.map((instruction, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-muted-foreground mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-foreground">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Action buttons */}
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <Link href={step.href}>
                {stepDone ? 'Gerenciar' : 'Configurar agora'}
                <ExternalLink className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            {stepDone && currentStep < steps.length - 1 && (
              <Button variant="outline" onClick={handleNext} className="flex-1">
                Próximo passo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={handlePrev}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>
        <span className="text-sm text-muted-foreground">
          {currentStep + 1} / {steps.length}
        </span>
        <Button
          variant="ghost"
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
        >
          Próximo
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Completion state */}
      {isAllDone && (
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-lg border border-success/30 bg-success/5 p-6 text-center"
        >
          <CheckCircle2 className="h-12 w-12 mx-auto text-success mb-3" />
          <h3 className="text-lg font-semibold text-foreground">Configuração completa!</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Sua operação está pronta para capturar e publicar ofertas automaticamente.
          </p>
          <Button asChild className="mt-4">
            <Link href="/dashboard">
              <Zap className="h-4 w-4 mr-2" />
              Ir para Operação
            </Link>
          </Button>
        </motion.div>
      )}

      {/* Skip option */}
      {!isAllDone && (
        <div className="text-center">
          <Link
            href="/dashboard"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Pular configuração por enquanto
          </Link>
        </div>
      )}
    </div>
  );
}
