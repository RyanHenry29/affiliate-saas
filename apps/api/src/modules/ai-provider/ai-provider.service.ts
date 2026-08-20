import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { UpsertProviderDto } from './dto/upsert-provider.dto';
import { encryptSecret, decryptSecret, resolveEncryptionKey } from '../../common/crypto.util';

const AI_CATALOG = [
  { id: 'openai', name: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'] },
  { id: 'anthropic', name: 'Anthropic', models: ['claude-sonnet-4-20250514', 'claude-3-haiku-20240307'] },
  { id: 'google', name: 'Google AI', models: ['gemini-1.5-pro', 'gemini-1.5-flash'] },
  { id: 'deepseek', name: 'DeepSeek', models: ['deepseek-chat', 'deepseek-coder'] },
  { id: 'groq', name: 'Groq', models: ['llama3-70b-8192', 'mixtral-8x7b-32768'] },
];

@Injectable()
export class AiProviderService {
  private encryptionKey: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.encryptionKey = resolveEncryptionKey(this.config);
  }

  catalog() {
    return AI_CATALOG;
  }

  async list(tenantId: string) {
    return this.prisma.aiProvider.findMany({
      where: { tenantId },
      select: { id: true, provider: true, model: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async upsert(tenantId: string, dto: UpsertProviderDto) {
    const encrypted = encryptSecret(dto.apiKey, this.encryptionKey);
    const existing = await this.prisma.aiProvider.findFirst({
      where: { tenantId, provider: dto.provider, model: dto.model },
    });

    if (existing) {
      return this.prisma.aiProvider.update({
        where: { id: existing.id },
        data: { apiKeyEncrypted: encrypted, isActive: dto.isActive ?? true },
      });
    }

    return this.prisma.aiProvider.create({
      data: {
        provider: dto.provider,
        model: dto.model,
        apiKeyEncrypted: encrypted,
        tenantId,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async remove(tenantId: string, idOrProvider: string) {
    const provider = await this.prisma.aiProvider.findFirst({
      where: {
        tenantId,
        OR: [
          { id: idOrProvider },
          { provider: idOrProvider }
        ]
      }
    });
    if (!provider) throw new NotFoundException('Provider não encontrado');
    return this.prisma.aiProvider.delete({ where: { id: provider.id } });
  }

  async test(tenantId: string, idOrProvider: string) {
    const provider = await this.prisma.aiProvider.findFirst({
      where: {
        tenantId,
        OR: [
          { id: idOrProvider },
          { provider: idOrProvider }
        ]
      }
    });
    if (!provider) throw new NotFoundException('Provider não encontrado');

    const apiKey = decryptSecret(provider.apiKeyEncrypted, this.encryptionKey);

    try {
      const response = await this.executeGenerate(
        provider.provider,
        provider.model,
        apiKey,
        'Hello, this is a connection test. Respond with "ok" only.',
        'Connection test system'
      );
      return { success: !!response, message: 'Conexão OK!' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Connection failed' };
    }
  }

  async generate(tenantId: string, idOrProvider: string, prompt: string, systemPrompt?: string) {
    const provider = await this.prisma.aiProvider.findFirst({
      where: {
        tenantId,
        isActive: true,
        OR: [
          { id: idOrProvider },
          { provider: idOrProvider }
        ]
      },
    });
    if (!provider) throw new NotFoundException('Provider não encontrado ou inativo');

    const apiKey = decryptSecret(provider.apiKeyEncrypted, this.encryptionKey);
    const content = await this.executeGenerate(
      provider.provider,
      provider.model,
      apiKey,
      prompt,
      systemPrompt
    );
    return { content };
  }

  async generateFirstActive(tenantId: string, prompt: string, systemPrompt?: string) {
    const provider = await this.prisma.aiProvider.findFirst({
      where: { tenantId, isActive: true }
    });

    if (!provider) {
      const defaultProvider = this.config.get<string>('LLM_PROVIDER', 'groq');
      const defaultApiKey = this.config.get<string>('LLM_API_KEY');
      const defaultModel = this.config.get<string>('LLM_MODEL', 'llama-3.3-70b-versatile');
      if (defaultApiKey) {
        const content = await this.executeGenerate(defaultProvider, defaultModel, defaultApiKey, prompt, systemPrompt);
        return { content };
      }
      throw new BadRequestException('Por favor, configure sua chave de IA nas Configurações.');
    }

    const apiKey = decryptSecret(provider.apiKeyEncrypted, this.encryptionKey);
    const content = await this.executeGenerate(
      provider.provider,
      provider.model,
      apiKey,
      prompt,
      systemPrompt
    );
    return { content };
  }

  private async executeGenerate(
    provider: string,
    model: string,
    apiKey: string,
    prompt: string,
    systemPrompt?: string
  ): Promise<string> {
    const activeProvider = provider.toLowerCase();
    switch (activeProvider) {
      case 'openai': {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: model || 'gpt-4o-mini',
            messages: systemPrompt
              ? [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }]
              : [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 2048,
          }),
        });
        if (!response.ok) throw new Error(`OpenAI error: ${response.status} ${await response.text()}`);
        const data = await response.json();
        return data.choices?.[0]?.message?.content ?? '';
      }
      case 'anthropic': {
        const body: any = {
          model: model || 'claude-3-5-sonnet-20241022',
          max_tokens: 2048,
          messages: [{ role: 'user', content: prompt }],
        };
        if (systemPrompt) body.system = systemPrompt;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error(`Anthropic error: ${response.status} ${await response.text()}`);
        const data = await response.json();
        return data.content?.[0]?.text ?? '';
      }
      case 'gemini': {
        const activeModel = model || 'gemini-1.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`;
        const contents: any[] = [];
        if (systemPrompt) {
          contents.push({ role: 'user', parts: [{ text: systemPrompt }] });
          contents.push({ role: 'model', parts: [{ text: 'Understood.' }] });
        }
        contents.push({ role: 'user', parts: [{ text: prompt }] });

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
          }),
        });
        if (!response.ok) throw new Error(`Gemini error: ${response.status} ${await response.text()}`);
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      }
      case 'groq': {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: model || 'llama-3.3-70b-versatile',
            messages: systemPrompt
              ? [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }]
              : [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 2048,
          }),
        });
        if (!response.ok) throw new Error(`Groq error: ${response.status} ${await response.text()}`);
        const data = await response.json();
        return data.choices?.[0]?.message?.content ?? '';
      }
      case 'deepseek': {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: model || 'deepseek-chat',
            messages: systemPrompt
              ? [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }]
              : [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 2048,
          }),
        });
        if (!response.ok) throw new Error(`DeepSeek error: ${response.status} ${await response.text()}`);
        const data = await response.json();
        return data.choices?.[0]?.message?.content ?? '';
      }
      case 'ollama': {
        const baseUrl = apiKey || 'http://localhost:11434';
        const response = await fetch(`${baseUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: model || 'llama3.1',
            prompt,
            system: systemPrompt,
            options: { temperature: 0.7, num_predict: 2048 },
            stream: false,
          }),
        });
        if (!response.ok) throw new Error(`Ollama error: ${response.status} ${await response.text()}`);
        const data = await response.json();
        return data.response ?? '';
      }
      default:
        throw new Error(`AI Provider not supported: ${provider}`);
    }
  }
}
