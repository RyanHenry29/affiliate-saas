import { IsString, IsArray, IsOptional, IsBoolean } from 'class-validator';

export class UpdateWebhookDto {
  @IsString()
  @IsOptional()
  url?: string;

  @IsArray()
  @IsOptional()
  events?: string[];

  @IsString()
  @IsOptional()
  secret?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
