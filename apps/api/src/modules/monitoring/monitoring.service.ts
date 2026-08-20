import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MonitoringService {
  constructor(private prisma: PrismaService) {}

  async queueHealth() {
    const rows = await this.prisma.dispatchJob.groupBy({
      by: ['status'],
      _count: true,
    });
    const counts: Record<string, number> = {};
    for (const row of rows) counts[row.status] = row._count;

    const pending = counts['PENDING'] ?? 0;
    const active = 0;
    const failed = (counts['FAILED'] ?? 0) + (counts['RATE_LIMITED'] ?? 0);
    const processed = counts['SENT'] ?? 0;

    return {
      healthy: failed === 0 && pending === 0,
      queues: [
        {
          name: 'dispatches',
          status: failed > 0 ? 'ERROR' : pending > 0 ? 'ACTIVE' : 'IDLE',
          pending,
          active,
          failed,
          processed,
        },
      ],
    };
  }

  async recentErrors(limit = 50) {
    const jobs = await this.prisma.dispatchJob.findMany({
      where: { status: { in: ['FAILED', 'RATE_LIMITED'] } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        status: true,
        attempts: true,
        offerId: true,
        tenantId: true,
        createdAt: true,
      },
    });

    const offerIds = [...new Set(jobs.map((j) => j.offerId))];
    const offers = await this.prisma.offer.findMany({
      where: { id: { in: offerIds } },
      select: { id: true, title: true },
    });
    const offerMap = new Map(offers.map((o) => [o.id, o.title]));

    return jobs.map((job) => ({
      id: job.id,
      status: job.status,
      attempts: job.attempts,
      offerId: job.offerId,
      offerTitle: offerMap.get(job.offerId) ?? null,
      createdAt: job.createdAt,
    }));
  }
}