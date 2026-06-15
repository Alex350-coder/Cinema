import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Room } from './room.entity';

@Entity('seats')
export class Seat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'room_id' })
  roomId: number;

  @Column({ name: 'row_label', length: 5 })
  rowLabel: string;

  @Column({ name: 'seat_number' })
  seatNumber: number;

  @Column({ name: 'seat_type', length: 20, default: 'standard' })
  seatType: string;

  @ManyToOne(() => Room, room => room.seats)
  @JoinColumn({ name: 'room_id' })
  room: Room;
}
