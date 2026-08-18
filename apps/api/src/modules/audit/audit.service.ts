import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class AuditService {
  private auditSubject = new Subject<any>();

  constructor(private prisma: PrismaService) {}

  async log(data: { tenantId: string; userId: string; action: string; entity: string; entityId?: string; details?: any }) {
    const entry = await this.prisma.auditLog.create({ data });
    this.auditSubject.next(entry);
    return entry;
  }

  async list(tenantId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where: { tenantId } }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  stream(tenantId: string): Observable<any> {
    return new Observable((subscriber) => {
      const subscription = this.auditSubject.asObservable().subscribe({
        next: (entry) => {
          if (entry.tenantId === tenantId) {
            subscriber.next(entry);
          }
        },
      });
      return () => subscription.unsubscribe();
    });
  }
}
