import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessagingProvider } from './messaging-provider.interface';

@Injectable()
export class EvolutionProvider implements MessagingProvider {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly logger = new Logger(EvolutionProvider.name);

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get<string>('EVOLUTION_API_URL', 'http://localhost:8080');
    this.apiKey = this.config.get<string>('EVOLUTION_API_KEY', '');
  }

  async sendMessage(instanceId: string, to: string, message: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/message/sendText/${instanceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: this.apiKey,
        },
        body: JSON.stringify({ number: to, text: message }),
      });
      if (!response.ok) {
        const text = await response.text();
        this.logger.error(`Evolution API error: ${response.status} ${text}`);
        return { ok: false, error: `HTTP ${response.status}: ${text}` };
      }
      return { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Evolution API exception: ${message}`);
      return { ok: false, error: message };
    }
  }

  async sendMedia(instanceId: string, to: string, url: string, caption?: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/message/sendMedia/${instanceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: this.apiKey,
        },
        body: JSON.stringify({ number: to, mediatype: 'image', media: url, caption }),
      });
      if (!response.ok) {
        const text = await response.text();
        this.logger.error(`Evolution API media error: ${response.status} ${text}`);
        return { ok: false, error: `HTTP ${response.status}: ${text}` };
      }
      return { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Evolution API media exception: ${message}`);
      return { ok: false, error: message };
    }
  }
}
