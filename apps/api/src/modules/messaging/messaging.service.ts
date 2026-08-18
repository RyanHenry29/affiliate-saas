import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MessagingService {
  private apiUrl: string;
  private apiKey: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.apiUrl = this.config.get<string>('EVOLUTION_API_URL', 'http://localhost:8080');
    this.apiKey = this.config.get<string>('EVOLUTION_API_KEY', '');
  }

  async listInstances(tenantId: string) {
    return this.prisma.messagingInstance.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createInstance(tenantId: string, name: string) {
    const response = await fetch(`${this.apiUrl}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: this.apiKey,
      },
      body: JSON.stringify({ instanceName: name, integration: 'WHATSAPP-BAILEYS' }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new HttpException(`Erro ao criar instância: ${error}`, response.status);
    }

    const data = await response.json();
    return this.prisma.messagingInstance.create({
      data: {
        name,
        instanceId: data.instance?.instanceId || '',
        tenantId,
        status: 'CREATED',
      },
    });
  }

  async refreshStatuses(tenantId: string) {
    const instances = await this.prisma.messagingInstance.findMany({ where: { tenantId } });
    const updated = [];

    for (const instance of instances) {
      try {
        const response = await fetch(`${this.apiUrl}/instance/connectionState/${instance.name}`, {
          headers: { apikey: this.apiKey },
        });
        if (response.ok) {
          const data = await response.json();
          const status = data.state === 'open' ? 'CONNECTED' : 'DISCONNECTED';
          await this.prisma.messagingInstance.update({
            where: { id: instance.id },
            data: { status },
          });
          updated.push({ id: instance.id, status });
        }
      } catch {
        updated.push({ id: instance.id, status: 'ERROR' });
      }
    }

    return updated;
  }
}
