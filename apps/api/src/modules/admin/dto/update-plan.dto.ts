import { IsInt, IsString, IsNotEmpty, IsBoolean, IsOptional, IsArray } from 'class-validator';

export class UpdatePlanDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  priceCents!: number;

  @IsInt()
  apiCallsLimit!: number;

  @IsInt()
  dispatchesLimit!: number;

  @IsArray()
  @IsString({ each: true })
  features!: string[];

  @IsBoolean()
  active!: boolean;
}