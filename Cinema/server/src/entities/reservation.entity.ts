import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Screening } from './screening.entity';
import { ReservationSeat } from './reservation-seat.entity';
import { ReservationSnack } from './reservation-snack.entity';

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'screening_id' })
  screeningId: number;

  @Column({ length: 30, default: 'pending' })
  status: string;

  @Column({ name: 'total_amount', type: 'numeric', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ name: 'confirmation_code', length: 20, unique: true, nullable: true })
  confirmationCode: string;

  @ManyToOne(() => User, user => user.reservations)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Screening, screening => screening.reservations)
  @JoinColumn({ name: 'screening_id' })
  screening: Screening;

  @OneToMany(() => ReservationSeat, reservationSeat => reservationSeat.reservation, { cascade: true })
  reservationSeats: ReservationSeat[];

  @OneToMany(() => ReservationSnack, reservationSnack => reservationSnack.reservation, { cascade: true })
  reservationSnacks: ReservationSnack[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
