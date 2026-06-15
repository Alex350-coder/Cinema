import { IsNumber, IsArray, IsOptional, ValidateNested, Min, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

class SnackItemDto {
  @IsNumber()
  snackId: number;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateReservationDto {
  @IsNumber()
  screeningId: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  seatIds: number[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SnackItemDto)
  snacks?: SnackItemDto[];
}
