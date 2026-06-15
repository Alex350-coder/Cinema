import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../entities';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  async findAll() {
    return this.roomRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const room = await this.roomRepository.findOne({
      where: { id },
      relations: ['seats'],
    });
    if (!room) {
      throw new NotFoundException('Sala no encontrada');
    }
    return {
      ...room,
      seatCount: room.seats?.length || 0,
    };
  }
}
