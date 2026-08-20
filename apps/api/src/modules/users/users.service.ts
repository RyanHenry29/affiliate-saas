import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const VALID_ROLES = ['MEMBER', 'OWNER', 'ADMIN_MASTER'] as const;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async listUsers(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId },
      select: { id: true, email: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUser(tenantId: string, userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
      select: { id: true, email: true, role: true, isActive: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async setRole(tenantId: string, userId: string, role: string) {
    if (!VALID_ROLES.includes(role as any)) {
      throw new BadRequestException(`Função inválida. Valores aceitos: ${VALID_ROLES.join(', ')}`);
    }
    const user = await this.prisma.user.findFirst({ where: { id: userId, tenantId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return this.prisma.user.update({ where: { id: userId }, data: { role } });
  }

  async removeUser(tenantId: string, userId: string) {
    const user = await this.prisma.user.findFirst({ where: { id: userId, tenantId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    if (user.role === 'ADMIN_MASTER') {
      throw new BadRequestException('Não é possível remover um administrador master');
    }
    return this.prisma.user.delete({ where: { id: userId } });
  }
}
