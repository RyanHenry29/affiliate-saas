import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class UpsertCredentialDto {
  @IsString()
  @IsNotEmpty()
  marketplace!: string;

  @IsObject()
  credentials!: Record<string, string>;

  @IsString()
  @IsOptional()
  label?: string;
}
