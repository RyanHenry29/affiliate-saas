import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsEnum } from 'class-validator';

export class ImportOfferDto {
  @IsString()
  @IsNotEmpty()
  marketplace!: string;

  @IsString()
  @IsNotEmpty()
  affiliateUrl!: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  priceCents?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  originalPriceCents?: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  nicheTag?: string;
}