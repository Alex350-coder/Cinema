import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { User } from '../entities';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.cinemax_token || null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: number; email: string; tokenVersion: number }) {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      relations: ['role'],
    });
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    if (payload.tokenVersion !== user.tokenVersion) {
      throw new UnauthorizedException('Sesión inválida. Inicia sesión nuevamente.');
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role?.name || 'user',
      roleId: user.roleId,
    };
  }
}
