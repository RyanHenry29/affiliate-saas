import { IsString, IsNotEmpty } from 'class-validator';

export class CreateInstanceDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
}
