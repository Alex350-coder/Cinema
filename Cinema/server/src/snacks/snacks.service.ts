import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Snack } from '../entities';
import { CreateSnackDto } from './dto/create-snack.dto';

@Injectable()
export class SnacksService {
  constructor(
    @InjectRepository(Snack)
    private readonly snackRepository: Repository<Snack>,
  ) {}

  async findAll(all = false) {
    const where = all ? {} : { isAvailable: true };
    const snacks = await this.snackRepository.find({
      where,
      order: { category: 'ASC', name: 'ASC' },
    });

    const grouped: Record<string, Snack[]> = {};
    for (const snack of snacks) {
      const category = snack.category || 'otros';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(snack);
    }

    return {
      items: snacks,
      grouped,
    };
  }

  async findOne(id: number) {
    const snack = await this.snackRepository.findOne({ where: { id } });
    if (!snack) {
      throw new NotFoundException('Bocadillo no encontrado');
    }
    return snack;
  }

  async create(createSnackDto: CreateSnackDto) {
    const snack = this.snackRepository.create(createSnackDto);
    return this.snackRepository.save(snack);
  }

  async update(id: number, updateData: Partial<CreateSnackDto>) {
    const snack = await this.snackRepository.findOne({ where: { id } });
    if (!snack) {
      throw new NotFoundException('Bocadillo no encontrado');
    }
    Object.assign(snack, updateData);
    return this.snackRepository.save(snack);
  }

  async toggleAvailability(id: number) {
    const snack = await this.snackRepository.findOne({ where: { id } });
    if (!snack) {
      throw new NotFoundException('Bocadillo no encontrado');
    }
    snack.isAvailable = !snack.isAvailable;
    return this.snackRepository.save(snack);
  }

  async remove(id: number) {
    const snack = await this.snackRepository.findOne({ where: { id } });
    if (!snack) {
      throw new NotFoundException('Bocadillo no encontrado');
    }
    return this.snackRepository.remove(snack);
  }
}
