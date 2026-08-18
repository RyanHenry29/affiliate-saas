import { Injectable, Logger } from '@nestjs/common';
import { LlmProvider, LlmConfig } from './llm.interface';
import { LlmConfigService } from './llm-config';
import { PrismaService } from '../prisma.service';
import { GroqProvider } from './groq.provider';
import { OpenaiProvider } from './openai.provider';
import { GeminiProvider } from './gemini.provider';
import { OllamaProvider } from './ollama.provider';
import { AnthropicProvider } from './anthropic.provider';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly defaultProvider: LlmProvider;
  private providerCache = new Map<string, LlmProvider>();

  constructor(
    private readonly configService: LlmConfigService,
    private readonly prisma: PrismaService,
  ) {
    const config = configService.getDefaultConfig();
    this.defaultProvider = this.createProvider(config);
  }

  private createProvider(config: LlmConfig): LlmProvider {
    switch (config.provider) {
      case 'groq': return new GroqProvider(config);
      case 'openai': return new OpenaiProvider(config);
      case 'gemini': return new GeminiProvider(config);
      case 'ollama': return new OllamaProvider(config);
      case 'anthropic': return new AnthropicProvider(config);
      default: return new GroqProvider(config);
    }
  }

  async getTenantProvider(tenantId: string): Promise<LlmProvider> {
    const cacheKey = tenantId;
    if (this.providerCache.has(cacheKey)) {
      return this.providerCache.get(cacheKey)!;
    }

    const config = await this.prisma.aiProviderConfig.findFirst({
      where: { tenantId, isActive: true },
    });

    if (config) {
      const decryptedKey = config.credentials;
      const providerConfig: LlmConfig = {
        provider: config.provider,
        apiKey: decryptedKey,
        model: config.model,
      };
      const provider = this.createProvider(providerConfig);
      this.providerCache.set(cacheKey, provider);
      return provider;
    }

    return this.defaultProvider;
  }

  async generate(prompt: string, systemPrompt?: string, tenantId?: string): Promise<string> {
    try {
      const provider = tenantId
        ? await this.getTenantProvider(tenantId)
        : this.defaultProvider;
      return await provider.generate(prompt, systemPrompt);
    } catch (error) {
      this.logger.error(`LLM generation failed: ${error}`);
      return this.fallbackTemplate(prompt);
    }
  }

  private fallbackTemplate(prompt: string): string {
    return `Confira esta oferta: ${prompt}`;
  }

  clearCache(tenantId?: string): void {
    if (tenantId) {
      this.providerCache.delete(tenantId);
    } else {
      this.providerCache.clear();
    }
  }
}
