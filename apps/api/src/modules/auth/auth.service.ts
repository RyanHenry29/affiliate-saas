import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email já cadastrado');

    const hashed = await bcrypt.hash(dto.password, 12);
    const tenant = await this.prisma.tenant.create({ data: { name: dto.tenantName || dto.email } });
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hashed,
        tenantId: tenant.id,
        role: 'OWNER',
      },
    });

    return this.generateTokens(user);
  }

  /**
   * Sincroniza um usuário autenticado via provedor OAuth (Google/GitHub)
   * com o banco. Cria o Tenant + User (role OWNER) na primeira vez; depois é
   * idempotente. O e-mail vem do token validado do Supabase (não do body).
   */
  async syncOAuthUser(email: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) return this.generateTokens(existing);

    const hashed = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 12);
    const tenant = await this.prisma.tenant.create({ data: { name: email } });
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash: hashed,
        tenantId: tenant.id,
        role: 'OWNER',
      },
    });
    return this.generateTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas');

    return this.generateTokens(user);
  }

  async refreshToken(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return this.generateTokens(user);
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        tenantId: true,
        createdAt: true,
        tenant: {
          select: {
            id: true,
            name: true,
            isAdminMaster: true,
            subscription: {
              select: {
                plan: true,
                status: true,
                currentPeriodEnd: true,
              },
            },
          },
        },
      },
    });
    if (!user) throw new UnauthorizedException('Usuário não encontrado');
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      tenantId: user.tenantId,
      tenantName: user.tenant.name,
      isAdminMaster: user.tenant.isAdminMaster,
      subscription: user.tenant.subscription,
      createdAt: user.createdAt,
    };
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    return { success: true };
  }

  async switchTenant(userId: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
    });
    if (!user) throw new UnauthorizedException('Tenant não encontrado');
    return this.generateTokens(user);
  }

  private generateTokens(user: any) {
    const payload = { sub: user.id, tenantId: user.tenantId, email: user.email };
    const accessToken = this.jwt.sign(payload);
    return { accessToken, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  }
}
