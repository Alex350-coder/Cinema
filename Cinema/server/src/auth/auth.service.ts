import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  private async generateToken(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      tokenVersion: user.tokenVersion,
    };
    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      role: user.role?.name || 'user',
      roleId: user.roleId,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      relations: ['role'],
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const token = await this.generateToken(user);

    return { token, user: this.sanitizeUser(user) };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(registerDto.password, salt);

    const user = new User();
    user.name = registerDto.name;
    user.email = registerDto.email;
    user.passwordHash = passwordHash;
    user.phone = registerDto.phone || null;
    user.roleId = 2;

    await this.userRepository.save(user);

    const token = await this.generateToken(user);

    return { token, user: this.sanitizeUser(user) };
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return {
      ...this.sanitizeUser(user),
      createdAt: user.createdAt,
    };
  }

  async updateProfile(userId: number, updateDto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (updateDto.name !== undefined) user.name = updateDto.name;
    if (updateDto.phone !== undefined) user.phone = updateDto.phone;
    if (updateDto.avatarUrl !== undefined) user.avatarUrl = updateDto.avatarUrl;

    await this.userRepository.save(user);
    return this.getProfile(userId);
  }

  async logout(userId: number) {
    await this.userRepository.increment({ id: userId }, 'tokenVersion', 1);
  }
}
