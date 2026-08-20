import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAutomationRuleDto } from './dto/create-automation-rule.dto';
import { UpdateAutomationRuleDto } from './dto/update-automation-rule.dto';

@Injectable()
export class AutomationService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Non-blocking: seed defaults without stalling startup if the DB is briefly unavailable.
    this.seed().catch(() => {
      /* best-effort seed; will populate on next boot */
    });
  }

  private async seed() {
    const count = await this.prisma.automationRule.count();
    if (count === 0) {
      await this.prisma.automationRule.createMany({
        data: [
          {
            name: 'Auto-dispatch high commission',
            trigger: 'OFFER_CREATED',
            condition: 'commission >= 10',
            action: 'DISPATCH_TO_GROUP',
            isActive: true,
            config: { minCommission: 10 },
          },
          {
            name: 'Restock alert',
            trigger: 'STOCK_CHANGED',
            condition: 'stock > 0',
            action: 'SEND_MESSAGE',
            isActive: true,
            config: { template: 'restock_alert' },
          },
          {
            name: 'Auto-reply incoming',
            trigger: 'MESSAGE_RECEIVED',
            condition: 'auto_reply_enabled',
            action: 'SEND_REPLY',
            isActive: false,
            config: { replyTemplate: 'Obrigado pelo contato!' },
          },
        ],
      });
    }
  }

  async list(tenantId: string) {
    return this.prisma.automationRule.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(tenantId: string, dto: CreateAutomationRuleDto) {
    return this.prisma.automationRule.create({
      data: { ...dto, tenantId },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateAutomationRuleDto) {
    const rule = await this.prisma.automationRule.findFirst({ where: { id, tenantId } });
    if (!rule) throw new NotFoundException('Regra não encontrada');
    return this.prisma.automationRule.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    const rule = await this.prisma.automationRule.findFirst({ where: { id, tenantId } });
    if (!rule) throw new NotFoundException('Regra não encontrada');
    return this.prisma.automationRule.delete({ where: { id } });
  }

  async toggle(tenantId: string, id: string) {
    const rule = await this.prisma.automationRule.findFirst({ where: { id, tenantId } });
    if (!rule) throw new NotFoundException('Regra não encontrada');
    return this.prisma.automationRule.update({
      where: { id },
      data: { isActive: !rule.isActive },
    });
  }
}
