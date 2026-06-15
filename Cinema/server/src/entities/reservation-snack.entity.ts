import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Reservation } from './reservation.entity';
import { Snack } from './snack.entity';

@Entity('reservation_snacks')
export class ReservationSnack {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'reservation_id' })
  reservationId: number;

  @Column({ name: 'snack_id' })
  snackId: number;

  @Column({ default: 1 })
  quantity: number;

  @Column({ name: 'unit_price', type: 'numeric', precision: 8, scale: 2 })
  unitPrice: number;

  @ManyToOne(() => Reservation, reservation => reservation.reservationSnacks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reservation_id' })
  reservation: Reservation;

  @ManyToOne(() => Snack)
  @JoinColumn({ name: 'snack_id' })
  snack: Snack;
}
