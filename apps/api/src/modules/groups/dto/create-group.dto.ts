import { IsString, IsBoolean, IsOptional, IsArray } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  externalId!: string;

  @IsString()
  name!: string;

  @IsArray()
  @IsOptional()
  nicheTags?: string[];

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
