import { IsEnum, IsDateString, IsOptional } from 'class-validator';
import { PlanTier, SubscriptionStatus } from '@prisma/client';

export class SetTenantSubscriptionDto {
  @IsEnum(PlanTier)
  plan!: PlanTier;

  @IsEnum(SubscriptionStatus)
  status!: SubscriptionStatus;

  @IsDateString()
  @IsOptional()
  currentPeriodEnd?: string;
}