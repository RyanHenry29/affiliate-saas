'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { BrainCircuit, CheckCircle2, FlaskConical, Trash2, XCircle, Zap, DollarSign, Globe } from 'lucide-react';
import { aiProviderApi } from '@/lib/api';
import type { AiProviderConfigDTO, AiProvider } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toastError, toastSuccess } from '@/lib/toast';

const PROVIDERS: {
  name: AiProvider;
  label: string;
  description: string;
  tier: 'free' | 'paid' | 'self-hosted';
  website: string;
  fields: { key: string; label: string; placeholder: string }[];
  models: string[];
}[] = [
  {
    name: 'groq',
    label: 'Groq',
    description: 'Ultra-rápido com Llama e Mixtral. Tier gratuito generoso.',
    tier: 'free',
    website: 'https://console.groq.com',
    fields: [{ key: 'apiKey', label: 'API Key', placeholder: 'gsk_...' }],
    models: ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
  },
  {
    name: 'openai',
    label: 'OpenAI',
    description: 'GPT-4o e GPT-4 mini. Pago por token.',
    tier: 'paid',
    website: 'https://platform.openai.com',
    fields: [{ key: 'apiKey', label: 'API Key', placeholder: 'sk-...' }],
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  },
  {
    name: 'gemini',
    label: 'Google Gemini',
    description: 'Tier gratuito disponível. Modelos multimodais.',
    tier: 'free',
    website: 'https://aistudio.google.com',
    fields: [{ key: 'apiKey', label: 'API Key', placeholder: 'AIza...' }],
    models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'],
  },
  {
    name: 'anthropic',
    label: 'Anthropic',
    description: 'Claude Sonnet e Haiku. Pago por token.',
    tier: 'paid',
    website: 'https://console.anthropic.com',
    fields: [{ key: 'apiKey', label: 'API Key', placeholder: 'sk-ant-...' }],
    models: ['claude-sonnet-4-20250514', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
  },
  {
    name: 'ollama',
    label: 'Ollama (Local)',
    description: 'Executa localmente. 100% gratuito e privado.',
    tier: 'self-hosted',
    website: 'https://ollama.com',
    fields: [
      { key: 'baseUrl', label: 'Base URL', placeholder: 'http://localhost:11434' },
    ],
    models: ['llama3.1', 'mistral', 'gemma2', 'phi3', 'codellama'],
  },
];

const TIER_CONFIG = {
  free: { label: 'Gratuito', icon: Zap, color: 'text-success', bg: 'bg-success/10' },
  paid: { label: 'Pago', icon: DollarSign, color: 'text-warning', bg: 'bg-warning/10' },
  'self-hosted': { label: 'Local', icon: Globe, color: 'text-primary', bg: 'bg-primary/10' },
};

export default function AiProviderTab() {
  const { data: configs, isLoading, mutate } = useSWR('/ai-provider', () => aiProviderApi.list());
  const [selectedProvider, setSelectedProvider] = useState<AiProvider>('groq');
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [model, setModel] = useState('llama-3.3-70b-versatile');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const providerInfo = PROVIDERS.find((p) => p.name === selectedProvider)!;
  const currentConfig = (configs as AiProviderConfigDTO[])?.find((c) => c.provider === selectedProvider);

  const inputCls =
    'border border-input bg-background rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent';

  function handleProviderChange(name: AiProvider) {
    setSelectedProvider(name);
    setCredentials({});
    setTestResult(null);
    const p = PROVIDERS.find((pp) => pp.name === name)!;
    setModel(p.models[0]);
  }

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    try {
      await aiProviderApi.upsert({
        provider: selectedProvider,
        apiKey: credentials.apiKey || credentials.baseUrl || '',
        model,
      });
      const res = await aiProviderApi.test(selectedProvider);
      setTestResult({ ok: true, message: res.message || 'Conexão OK!' });
      mutate();
    } catch (err: any) {
      setTestResult({ ok: false, message: err.message || 'Falha na conexão' });
    } finally {
      setTesting(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await aiProviderApi.upsert({
        provider: selectedProvider,
        apiKey: credentials.apiKey || credentials.baseUrl || '',
        model,
      });
      mutate();
      toastSuccess('Configuração salva');
    } catch (err: any) {
      toastError(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    if (!confirm(`Remover configuração de ${providerInfo.label}?`)) return;
    try {
      await aiProviderApi.remove(selectedProvider);
      mutate();
      toastSuccess('Configuração removida');
    } catch (err: any) {
      toastError(err);
    }
  }

  if (isLoading) {
    return <div className="h-48 bg-muted animate-pulse rounded-lg" />;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="surface-card p-4 space-y-4">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wide mb-1 block">Provider de IA</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {PROVIDERS.map((p) => {
              const tier = TIER_CONFIG[p.tier];
              const TierIcon = tier.icon;
              const isActive = selectedProvider === p.name;
              const isConfigured = (configs as AiProviderConfigDTO[])?.some((c) => c.provider === p.name);
              return (
                <button
                  key={p.name}
                  onClick={() => handleProviderChange(p.name)}
                  className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                    isActive
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border hover:border-muted-foreground/50 hover:bg-secondary/50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{p.label}</span>
                      {isConfigured && <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{p.description}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${tier.color} ${tier.bg}`}>
                        <TierIcon className="h-2.5 w-2.5" />
                        {tier.label}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {currentConfig && (
          <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 px-3 py-2.5 text-sm">
            <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
            <div className="min-w-0">
              <p className="text-success font-medium">Configuração atual</p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                Modelo: <span className="font-mono">{currentConfig.model}</span> · Ativo:{' '}
                {currentConfig.isActive ? 'Sim' : 'Não'}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Credenciais</h3>
          <p className="text-xs text-muted-foreground">
            Sua chave de API é criptografada (AES-256-GCM) e armazenada apenas no servidor.
          </p>
          {providerInfo.fields.map((field) => (
            <div key={field.key}>
              <label className="text-xs text-muted-foreground mb-1 block">{field.label}</label>
              <Input
                type="password"
                value={credentials[field.key] || ''}
                onChange={(e) => setCredentials({ ...credentials, [field.key]: e.target.value })}
                placeholder={field.placeholder}
              />
            </div>
          ))}
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Modelo</label>
          <select value={model} onChange={(e) => setModel(e.target.value)} className={`w-full ${inputCls}`}>
            {providerInfo.models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          {providerInfo.tier === 'free' && (
            <p className="text-[11px] text-muted-foreground mt-1">
              Modelos gratuitos têm rate limits generosos para uso operacional.
            </p>
          )}
        </div>

        {testResult && (
          <div className={`flex items-start gap-2 text-sm px-3 py-2.5 rounded-lg border ${
            testResult.ok
              ? 'border-success/30 bg-success/5 text-success'
              : 'border-destructive/30 bg-destructive/5 text-destructive'
          }`}>
            {testResult.ok ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          <Button onClick={handleTest} disabled={testing} variant="secondary">
            <FlaskConical className="h-4 w-4" />
            {testing ? 'Testando...' : 'Testar Conexão'}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <BrainCircuit className="h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
          {currentConfig && (
            <Button
              onClick={handleRemove}
              variant="outline"
              className="text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/50 hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              Remover
            </Button>
          )}
        </div>
      </div>

      <div className="surface-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">Como funciona</h3>
        <div className="space-y-2 text-xs text-muted-foreground">
          <p>
            Cada usuário configura sua própria chave de API de IA. O sistema usa a IA para:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Buscar ofertas em linguagem natural (ex: "fones bluetooth com mais de 30% de desconto")</li>
            <li>Gerar textos persuasivos para envio nas mensagens</li>
            <li>Validar e classificar cupons automaticamente</li>
            <li>Otimizar horários de envio por nicho</li>
          </ul>
          <p className="mt-2">
            Se nenhuma IA estiver configurada, o sistema usa templates padrão para gerar textos.
          </p>
        </div>
      </div>
    </div>
  );
}
