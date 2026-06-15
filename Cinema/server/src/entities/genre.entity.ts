import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Movie } from './movie.entity';

@Entity('genres')
export class Genre {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 80 })
  name: string;

  @ManyToMany(() => Movie, movie => movie.genres)
  movies: Movie[];
}
