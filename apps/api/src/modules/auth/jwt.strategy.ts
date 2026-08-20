import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    const secret =
      config.get<string>('SUPABASE_JWT_SECRET') ?? config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('SUPABASE_JWT_SECRET ou JWT_SECRET devem estar definidos');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      jsonWebTokenOptions: { algorithms: ['HS256'] },
    });
  }

  async validate(payload: any) {
    const email: string | undefined = payload.email;
    if (!email) throw new UnauthorizedException('Token sem email');

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { tenant: true },
    });
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado. Registre-se primeiro.');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Conta desativada. Fale com o administrador.');
    }
    return {
      id: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
      isAdminMaster: user.tenant?.isAdminMaster ?? false,
      name: user.email,
    };
  }
}
