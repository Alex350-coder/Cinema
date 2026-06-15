import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScreeningsController } from './screenings.controller';
import { ScreeningsService } from './screenings.service';
import { Screening, Seat, ReservationSeat } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Screening, Seat, ReservationSeat])],
  controllers: [ScreeningsController],
  providers: [ScreeningsService],
  exports: [ScreeningsService],
})
export class ScreeningsModule {}
