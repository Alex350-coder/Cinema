import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Screening } from './screening.entity';
import { Seat } from './seat.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ name: 'total_seats' })
  totalSeats: number;

  @Column()
  rows: number;

  @Column({ name: 'seats_per_row' })
  seatsPerRow: number;

  @Column({ name: 'room_type', length: 50, default: 'standard' })
  roomType: string;

  @OneToMany(() => Screening, screening => screening.room)
  screenings: Screening[];

  @OneToMany(() => Seat, seat => seat.room)
  seats: Seat[];
}
