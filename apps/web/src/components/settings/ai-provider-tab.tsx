'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { aiProviderApi } from '@/lib/api';
import type { AiProviderConfigDTO, AiProvider } from '@/lib/types';

const PROVIDERS: { name: AiProvider; label: string; fields: { key: string; label: string; placeholder: string }[]; models: string[] }[] = [
  {
    name: 'groq',
    label: 'Groq',
    fields: [{ key: 'apiKey', label: 'API Key', placeholder: 'gsk_...' }],
    models: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
  },
  {
    name: 'openai',
    label: 'OpenAI',
    fields: [{ key: 'apiKey', label: 'API Key', placeholder: 'sk-...' }],
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
  },
  {
    name: 'gemini',
    label: 'Gemini',
    fields: [{ key: 'apiKey', label: 'API Key', placeholder: 'AIza...' }],
    models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash'],
  },
  {
    name: 'ollama',
    label: 'Ollama',
    fields: [
      { key: 'baseUrl', label: 'Base URL', placeholder: 'http://localhost:11434' },
    ],
    models: ['llama3.1', 'mistral', 'gemma2'],
  },
  {
    name: 'anthropic',
    label: 'Anthropic',
    fields: [{ key: 'apiKey', label: 'API Key', placeholder: 'sk-ant-...' }],
    models: ['claude-sonnet-4-20250514', 'claude-3-5-haiku-20241022'],
  },
];

export default function AiProviderTab() {
  const { data: configs, isLoading, mutate } = useSWR('/ai-provider', (url) => aiProviderApi.list());
  const [selectedProvider, setSelectedProvider] = useState<AiProvider>('groq');
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [model, setModel] = useState('llama-3.1-70b-versatile');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const providerInfo = PROVIDERS.find((p) => p.name === selectedProvider)!;
  const currentConfig = (configs as AiProviderConfigDTO[])?.find((c) => c.provider === selectedProvider);

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
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    if (!confirm(`Remover configuração de ${providerInfo.label}?`)) return;
    try {
      await aiProviderApi.remove(selectedProvider);
      mutate();
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="text-xs text-gray-500 uppercase mb-1 block">Provider</label>
        <select
          value={selectedProvider}
          onChange={(e) => handleProviderChange(e.target.value as AiProvider)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        >
          {PROVIDERS.map((p) => (
            <option key={p.name} value={p.name}>{p.label}</option>
          ))}
        </select>
      </div>

      {currentConfig && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
          <p className="text-green-700 font-medium">Configuração atual</p>
          <p className="text-green-600 text-xs mt-1">
            Provider: {currentConfig.provider} | Modelo: {currentConfig.model} | Ativo: {currentConfig.isActive ? 'Sim' : 'Não'}
          </p>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Credenciais</h3>
        {providerInfo.fields.map((field) => (
          <div key={field.key}>
            <label className="text-xs text-gray-500 mb-1 block">{field.label}</label>
            <input
              type="password"
              value={credentials[field.key] || ''}
              onChange={(e) => setCredentials({ ...credentials, [field.key]: e.target.value })}
              placeholder={field.placeholder}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
        ))}
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">Modelo</label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        >
          {providerInfo.models.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {testResult && (
        <div className={`text-sm px-3 py-2 rounded ${testResult.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {testResult.message}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleTest}
          disabled={testing}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
        >
          {testing ? 'Testando...' : 'Testar Conexão'}
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
        {currentConfig && (
          <button
            onClick={handleRemove}
            className="text-red-600 hover:text-red-700 text-sm font-medium px-4 py-2 rounded border border-red-200 transition-colors"
          >
            Remover
          </button>
        )}
      </div>
    </div>
  );
}
