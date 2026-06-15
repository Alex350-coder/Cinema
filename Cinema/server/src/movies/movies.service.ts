import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from '../entities';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  async findAll(all = false) {
    const where = all ? {} : { isActive: true };
    return this.movieRepository.find({
      where,
      relations: ['genres'],
      order: { createdAt: 'DESC' },
    });
  }

  async findFeatured() {
    return this.movieRepository.find({
      where: { isFeatured: true, isActive: true },
      relations: ['genres'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: [
        'genres',
        'screenings',
        'screenings.room',
      ],
    });

    if (!movie) {
      throw new NotFoundException('Película no encontrada');
    }

    const now = new Date();
    const upcomingScreenings = (movie.screenings || []).filter(
      s => s.isActive && new Date(s.startTime) > now,
    ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    return { ...movie, upcomingScreenings };
  }

  async create(createMovieDto: CreateMovieDto) {
    const movie = this.movieRepository.create(createMovieDto as any);
    return this.movieRepository.save(movie);
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const movie = await this.movieRepository.findOne({ where: { id } });
    if (!movie) {
      throw new NotFoundException('Película no encontrada');
    }
    Object.assign(movie, updateMovieDto);
    return this.movieRepository.save(movie);
  }

  async softDelete(id: number) {
    const movie = await this.movieRepository.findOne({ where: { id } });
    if (!movie) {
      throw new NotFoundException('Película no encontrada');
    }
    movie.isActive = false;
    return this.movieRepository.save(movie);
  }

  async toggleFeatured(id: number) {
    const movie = await this.movieRepository.findOne({ where: { id } });
    if (!movie) {
      throw new NotFoundException('Película no encontrada');
    }
    movie.isFeatured = !movie.isFeatured;
    return this.movieRepository.save(movie);
  }
}
