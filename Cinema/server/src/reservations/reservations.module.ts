import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { Reservation, ReservationSeat, ReservationSnack, Screening, Seat, Snack } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, ReservationSeat, ReservationSnack, Screening, Seat, Snack])],
  controllers: [ReservationsController],
  providers: [ReservationsService],
})
export class ReservationsModule {}
