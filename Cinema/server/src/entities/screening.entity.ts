import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { Movie } from './movie.entity';
import { Room } from './room.entity';
import { Reservation } from './reservation.entity';

@Entity('screenings')
export class Screening {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'movie_id' })
  movieId: number;

  @Column({ name: 'room_id' })
  roomId: number;

  @Column({ name: 'start_time', type: 'timestamp' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamp' })
  endTime: Date;

  @Column({ name: 'base_price', type: 'numeric', precision: 8, scale: 2 })
  basePrice: number;

  @Column({ length: 50, default: 'Español' })
  language: string;

  @Column({ name: 'subtitle_language', length: 50, nullable: true })
  subtitleLanguage: string;

  @Column({ length: 20, default: '2D' })
  format: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToOne(() => Movie, movie => movie.screenings)
  @JoinColumn({ name: 'movie_id' })
  movie: Movie;

  @ManyToOne(() => Room, room => room.screenings)
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @OneToMany(() => Reservation, reservation => reservation.screening)
  reservations: Reservation[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
