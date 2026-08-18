import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class UpsertProviderDto {
  @IsString()
  @IsNotEmpty()
  provider!: string;

  @IsString()
  @IsNotEmpty()
  model!: string;

  @IsString()
  @IsNotEmpty()
  apiKey!: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
