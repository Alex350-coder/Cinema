import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Screening, Seat, ReservationSeat, Reservation } from '../entities';
import { CreateScreeningDto } from './dto/create-screening.dto';

@Injectable()
export class ScreeningsService {
  constructor(
    @InjectRepository(Screening)
    private readonly screeningRepository: Repository<Screening>,
    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,
    @InjectRepository(ReservationSeat)
    private readonly reservationSeatRepository: Repository<ReservationSeat>,
  ) {}

  async deactivateExpired() {
    const cutoff = new Date(Date.now() - 30 * 60 * 1000);
    await this.screeningRepository.update(
      { endTime: LessThan(cutoff), isActive: true },
      { isActive: false },
    );
  }

  async findAll(all = false) {
    await this.deactivateExpired();
    const where = all ? {} : { isActive: true };
    return this.screeningRepository.find({
      where,
      relations: ['movie', 'room'],
      order: { startTime: 'ASC' },
    });
  }

  async findByMovie(movieId: number) {
    await this.deactivateExpired();
    return this.screeningRepository.find({
      where: { movieId, isActive: true },
      relations: ['room'],
      order: { startTime: 'ASC' },
    });
  }

  async findOne(id: number) {
    const screening = await this.screeningRepository.findOne({
      where: { id },
      relations: ['movie', 'room'],
    });
    if (!screening) {
      throw new NotFoundException('Función no encontrada');
    }
    return screening;
  }

  async getSeatMap(id: number) {
    const screening = await this.screeningRepository.findOne({
      where: { id },
      relations: ['room'],
    });
    if (!screening) {
      throw new NotFoundException('Función no encontrada');
    }

    const seats = await this.seatRepository.find({
      where: { roomId: screening.roomId },
      order: { rowLabel: 'ASC', seatNumber: 'ASC' },
    });

    const reservedSeatIds = await this.reservationSeatRepository
      .createQueryBuilder('rs')
      .innerJoin('rs.reservation', 'r')
      .where('r.screening_id = :screeningId', { screeningId: id })
      .andWhere("r.status NOT IN ('cancelled')")
      .select('rs.seat_id')
      .getRawMany();

    const reservedIds = new Set(reservedSeatIds.map(r => r.rs_seat_id));

    return seats.map(seat => ({
      seatId: seat.id,
      rowLabel: seat.rowLabel,
      seatNumber: seat.seatNumber,
      type: seat.seatType,
      isAvailable: !reservedIds.has(seat.id),
    }));
  }

  async create(createScreeningDto: CreateScreeningDto) {
    const screening = this.screeningRepository.create({
      ...createScreeningDto,
      startTime: new Date(createScreeningDto.startTime),
      endTime: new Date(createScreeningDto.endTime),
    });
    return this.screeningRepository.save(screening);
  }

  async update(id: number, updateData: Partial<CreateScreeningDto>) {
    const screening = await this.screeningRepository.findOne({ where: { id } });
    if (!screening) {
      throw new NotFoundException('Función no encontrada');
    }
    Object.assign(screening, {
      ...updateData,
      startTime: updateData.startTime ? new Date(updateData.startTime) : screening.startTime,
      endTime: updateData.endTime ? new Date(updateData.endTime) : screening.endTime,
    });
    return this.screeningRepository.save(screening);
  }

  async deactivate(id: number) {
    const screening = await this.screeningRepository.findOne({ where: { id } });
    if (!screening) {
      throw new NotFoundException('Función no encontrada');
    }
    screening.isActive = false;
    return this.screeningRepository.save(screening);
  }
}
