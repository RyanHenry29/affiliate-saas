import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  private since(period?: string): Date {
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  }

  async overview(tenantId: string, period?: string) {
    const since = this.since(period);
    const [dispatchJobs, offers, instances] = await Promise.all([
      this.prisma.dispatchJob.count({ where: { tenantId, createdAt: { gte: since } } }),
      this.prisma.offer.count(),
      this.prisma.messagingInstance.findMany({
        where: { tenantId },
        select: { status: true },
      }),
    ]);
    const activeInstances = instances.filter((i) => i.status === 'CONNECTED').length;
    return { totalDispatches: dispatchJobs, totalOffers: offers, activeInstances };
  }

  async dispatchesByHour(tenantId: string) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const jobs = await this.prisma.dispatchJob.findMany({
      where: { tenantId, createdAt: { gte: since } },
      select: { createdAt: true },
    });
    const hours = new Array(24).fill(0);
    for (const job of jobs) hours[new Date(job.createdAt).getHours()]++;
    return hours.map((count, hour) => ({
      hour: `${String(hour).padStart(2, '0')}h`,
      count,
    }));
  }

  async dispatchesByMarketplace(tenantId: string, period?: string) {
    const jobs = await this.prisma.dispatchJob.findMany({
      where: { tenantId, createdAt: { gte: this.since(period) } },
      select: { offerId: true },
    });
    return this.groupByOfferField(jobs, 'marketplace');
  }

  async topNiches(tenantId: string, period?: string) {
    const jobs = await this.prisma.dispatchJob.findMany({
      where: { tenantId, createdAt: { gte: this.since(period) } },
      select: { offerId: true },
    });
    const rows = await this.groupByOfferField(jobs, 'niche');
    const total = rows.reduce((acc, r) => acc + r.count, 0);
    return rows.map((r) => ({
      ...r,
      conversionRate: total ? Math.round((r.count / total) * 100) : 0,
    }));
  }

  async conversion(tenantId: string, period?: string) {
    const rows = await this.prisma.dispatchJob.groupBy({
      by: ['status'],
      where: { tenantId, createdAt: { gte: this.since(period) } },
      _count: true,
    });
    const total = rows.reduce((acc, r) => acc + r._count, 0);
    const sent = rows.find((r) => r.status === 'SENT')?._count ?? 0;
    const failed = rows
      .filter((r) => r.status === 'FAILED' || r.status === 'RATE_LIMITED')
      .reduce((acc, r) => acc + r._count, 0);
    return {
      totalDispatches: total,
      sentCount: sent,
      failedCount: failed,
      successRate: total ? Math.round((sent / total) * 100) : 0,
    };
  }

  private async groupByOfferField(
    jobs: Array<{ offerId: string }>,
    field: 'marketplace' | 'niche',
  ): Promise<Array<{ marketplace?: string; niche?: string; count: number }>> {
    const ids = [...new Set(jobs.map((j) => j.offerId))];
    const offers = await this.prisma.offer.findMany({
      where: { id: { in: ids } },
      select: { id: true, marketplace: true, nicheTag: true },
    });
    const map = new Map(offers.map((o) => [o.id, o]));
    const counts = new Map<string, number>();
    for (const job of jobs) {
      const offer = map.get(job.offerId);
      const key = field === 'marketplace' ? offer?.marketplace ?? 'desconhecido' : offer?.nicheTag ?? 'GERAL';
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([key, count]) =>
        field === 'marketplace' ? { marketplace: key, count } : { niche: key, count },
      )
      .sort((a, b) => b.count - a.count);
  }
}