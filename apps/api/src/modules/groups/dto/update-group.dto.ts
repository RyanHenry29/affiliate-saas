import { IsString, IsBoolean, IsOptional, IsArray } from 'class-validator';

export class UpdateGroupDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @IsOptional()
  nicheTags?: string[];

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
