import { IsNumber, IsString, IsDateString, IsOptional, Min } from 'class-validator';

export class CreateScreeningDto {
  @IsNumber()
  movieId: number;

  @IsNumber()
  roomId: number;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsNumber()
  @Min(0)
  basePrice: number;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  subtitleLanguage?: string;

  @IsOptional()
  @IsString()
  format?: string;
}
