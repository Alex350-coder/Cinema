import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Reservation } from './reservation.entity';
import { Seat } from './seat.entity';

@Entity('reservation_seats')
export class ReservationSeat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'reservation_id' })
  reservationId: number;

  @Column({ name: 'seat_id' })
  seatId: number;

  @Column({ type: 'numeric', precision: 8, scale: 2 })
  price: number;

  @ManyToOne(() => Reservation, reservation => reservation.reservationSeats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reservation_id' })
  reservation: Reservation;

  @ManyToOne(() => Seat)
  @JoinColumn({ name: 'seat_id' })
  seat: Seat;
}
