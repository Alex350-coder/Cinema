import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In } from 'typeorm';
import { Repository, DataSource } from 'typeorm';
import * as crypto from 'crypto';
import { Reservation, ReservationSeat, ReservationSnack, Screening, Seat, Snack } from '../entities';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(ReservationSeat)
    private readonly reservationSeatRepository: Repository<ReservationSeat>,
    @InjectRepository(ReservationSnack)
    private readonly reservationSnackRepository: Repository<ReservationSnack>,
    @InjectRepository(Screening)
    private readonly screeningRepository: Repository<Screening>,
    @InjectRepository(Snack)
    private readonly snackRepository: Repository<Snack>,
    private readonly dataSource: DataSource,
  ) {}

  private generateConfirmationCode(): string {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  async create(userId: number, createDto: CreateReservationDto) {
    const screening = await this.screeningRepository.findOne({
      where: { id: createDto.screeningId, isActive: true },
      relations: ['room'],
    });

    if (!screening) {
      throw new NotFoundException('Función no encontrada o inactiva');
    }

    if (new Date(screening.startTime) <= new Date()) {
      throw new BadRequestException('La función ya comenzó');
    }

    // Use ACID transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check seat availability within transaction
      const reservedSeats = await queryRunner.manager
        .createQueryBuilder(ReservationSeat, 'rs')
        .innerJoin('rs.reservation', 'r')
        .where('r.screening_id = :screeningId', { screeningId: createDto.screeningId })
        .andWhere("r.status NOT IN ('cancelled')")
        .andWhere('rs.seat_id IN (:...seatIds)', { seatIds: createDto.seatIds })
        .getCount();

      if (reservedSeats > 0) {
        throw new BadRequestException('Uno o más asientos ya están reservados');
      }

      // Calculate totals
      const seatPrice = Number(screening.basePrice);
      const seatsTotal = seatPrice * createDto.seatIds.length;

      let snacksTotal = 0;
      let snackItems: Array<{ snackId: number; quantity: number; unitPrice: number }> = [];

      if (createDto.snacks && createDto.snacks.length > 0) {
        const snackIds = createDto.snacks.map(s => s.snackId);
        const snacks = await queryRunner.manager.find(Snack, {
          where: { id: In(snackIds), isAvailable: true },
        });
        const snackMap = new Map(snacks.map(s => [s.id, s]));

        for (const item of createDto.snacks) {
          const snack = snackMap.get(item.snackId);
          if (!snack) {
            throw new BadRequestException(`Bocadillo con id ${item.snackId} no encontrado o no disponible`);
          }
          const unitPrice = Number(snack.price);
          snacksTotal += unitPrice * item.quantity;
          snackItems.push({ snackId: item.snackId, quantity: item.quantity, unitPrice });
        }
      }

      const totalAmount = seatsTotal + snacksTotal;
      const confirmationCode = this.generateConfirmationCode();

      // Create reservation
      const reservation = queryRunner.manager.create(Reservation, {
        userId,
        screeningId: createDto.screeningId,
        status: 'pending',
        totalAmount,
        confirmationCode,
      });
      const savedReservation = await queryRunner.manager.save(reservation);

      // Create reservation seats
      for (const seatId of createDto.seatIds) {
        const rs = queryRunner.manager.create(ReservationSeat, {
          reservationId: savedReservation.id,
          seatId,
          price: seatPrice,
        });
        await queryRunner.manager.save(rs);
      }

      // Create reservation snacks
      for (const item of snackItems) {
        const rs = queryRunner.manager.create(ReservationSnack, {
          reservationId: savedReservation.id,
          snackId: item.snackId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        });
        await queryRunner.manager.save(rs);
      }

      await queryRunner.commitTransaction();

      return this.findOne(savedReservation.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findByUser(userId: number) {
    return this.reservationRepository.find({
      where: { userId },
      relations: [
        'screening',
        'screening.movie',
        'screening.room',
        'reservationSeats',
        'reservationSeats.seat',
        'reservationSnacks',
        'reservationSnacks.snack',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: [
        'screening',
        'screening.movie',
        'screening.room',
        'reservationSeats',
        'reservationSeats.seat',
        'reservationSnacks',
        'reservationSnacks.snack',
      ],
    });

    if (!reservation) {
      throw new NotFoundException('Reserva no encontrada');
    }

    return reservation;
  }

  async findAll() {
    return this.reservationRepository.find({
      relations: [
        'user',
        'screening',
        'screening.movie',
        'screening.room',
        'reservationSeats',
        'reservationSeats.seat',
        'reservationSnacks',
        'reservationSnacks.snack',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async simulatePayment(id: number, userId: number) {
    const reservation = await this.reservationRepository.findOne({ where: { id } });

    if (!reservation) {
      throw new NotFoundException('Reserva no encontrada');
    }

    if (reservation.userId !== userId) {
      throw new ForbiddenException('No puedes pagar una reserva de otro usuario');
    }

    if (reservation.status !== 'pending') {
      throw new BadRequestException('Solo se pueden pagar reservas pendientes');
    }

    reservation.status = 'simulated_paid';
    return this.reservationRepository.save(reservation);
  }

  async cancel(id: number, userId: number) {
    const reservation = await this.reservationRepository.findOne({ where: { id } });

    if (!reservation) {
      throw new NotFoundException('Reserva no encontrada');
    }

    if (reservation.userId !== userId) {
      throw new ForbiddenException('No puedes cancelar una reserva de otro usuario');
    }

    if (reservation.status !== 'pending') {
      throw new BadRequestException('Solo se pueden cancelar reservas pendientes');
    }

    reservation.status = 'cancelled';
    return this.reservationRepository.save(reservation);
  }
}
