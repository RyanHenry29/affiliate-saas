import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { resolve } from 'node:path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { GroupsModule } from './modules/groups/groups.module';
import { OffersModule } from './modules/offers/offers.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { ConnectionsModule } from './modules/connections/connections.module';
import { QueuesModule } from './modules/queues/queues.module';
import { AdminModule } from './modules/admin/admin.module';
import { InvitesModule } from './modules/invites/invites.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { AuditModule } from './modules/audit/audit.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { BillingModule } from './modules/billing/billing.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AiProviderModule } from './modules/ai-provider/ai-provider.module';
import { AutomationModule } from './modules/automation/automation.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [resolve(__dirname, '../../../.env'), '.env'],
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    GroupsModule,
    OffersModule,
    MessagingModule,
    ConnectionsModule,
    QueuesModule,
    AdminModule,
    InvitesModule,
    ApiKeysModule,
    AuditModule,
    WebhooksModule,
    BillingModule,
    PaymentsModule,
    AiProviderModule,
    AutomationModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
