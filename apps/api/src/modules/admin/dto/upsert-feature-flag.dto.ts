import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class UpsertFeatureFlagDto {
  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsBoolean()
  enabled!: boolean;

  @IsString()
  @IsOptional()
  tenantId?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
