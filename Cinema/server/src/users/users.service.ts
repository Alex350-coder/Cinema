import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities';
import { ChangeRoleDto } from './dto/change-role.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(page = 1, limit = 20) {
    const [users, total] = await this.userRepository.findAndCount({
      relations: ['role'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        avatarUrl: u.avatarUrl,
        phone: u.phone,
        role: u.role?.name || 'user',
        roleId: u.roleId,
        createdAt: u.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async changeRole(id: number, changeRoleDto: ChangeRoleDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    user.roleId = changeRoleDto.roleId;
    await this.userRepository.save(user);
    return { message: 'Rol actualizado correctamente' };
  }
}
