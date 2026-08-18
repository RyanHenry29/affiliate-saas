import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { randomBytes } from 'node:crypto';

@Injectable()
export class InvitesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, email: string) {
    const existing = await this.prisma.invite.findFirst({
      where: { tenantId, email, status: 'PENDING' },
    });
    if (existing) throw new ConflictException('Convite já existe para este email');

    const token = randomBytes(32).toString('hex');
    return this.prisma.invite.create({
      data: { email, token, tenantId, status: 'PENDING' },
    });
  }

  async list(tenantId: string) {
    return this.prisma.invite.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revoke(tenantId: string, id: string) {
    const invite = await this.prisma.invite.findFirst({ where: { id, tenantId } });
    if (!invite) throw new NotFoundException('Convite não encontrado');
    return this.prisma.invite.update({ where: { id }, data: { status: 'REVOKED' } });
  }

  async accept(token: string, userId: string) {
    const invite = await this.prisma.invite.findUnique({ where: { token } });
    if (!invite || invite.status !== 'PENDING') throw new NotFoundException('Convite inválido');
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      throw new NotFoundException('Convite expirado');
    }

    await this.prisma.invite.update({
      where: { id: invite.id },
      data: { status: 'ACCEPTED', acceptedById: userId },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { tenantId: invite.tenantId },
    });

    return { success: true };
  }
}
