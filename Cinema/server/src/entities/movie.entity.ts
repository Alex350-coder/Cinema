import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Genre } from './genre.entity';
import { Screening } from './screening.entity';

@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'duration_minutes' })
  durationMinutes: number;

  @Column({ length: 10, nullable: true })
  rating: string;

  @Column({ name: 'poster_url', length: 255, nullable: true })
  posterUrl: string;

  @Column({ name: 'trailer_url', length: 255, nullable: true })
  trailerUrl: string;

  @Column({ length: 150, nullable: true })
  director: string;

  @Column({ name: 'cast_list', type: 'text', nullable: true })
  castList: string;

  @Column({ name: 'release_year', nullable: true })
  releaseYear: number;

  @Column({ length: 50, default: 'Español' })
  language: string;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToMany(() => Genre, genre => genre.movies)
  @JoinTable({
    name: 'movie_genres',
    joinColumn: { name: 'movie_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'genre_id', referencedColumnName: 'id' },
  })
  genres: Genre[];

  @OneToMany(() => Screening, screening => screening.movie)
  screenings: Screening[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
