import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdatePaymentConfigDto {
  @IsString()
  @IsOptional()
  pixKey?: string;

  @IsString()
  @IsOptional()
  pixMerchantName?: string;

  @IsString()
  @IsOptional()
  pixCity?: string;

  @IsString()
  @IsOptional()
  pixCopiaECola?: string;

  @IsBoolean()
  @IsOptional()
  pixEnabled?: boolean;

  @IsString()
  @IsOptional()
  pixInstructions?: string;
}