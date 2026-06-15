import { Controller, Post, Get, Put, Body, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 1000,
};

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { token, user } = await this.authService.login(loginDto);
    res.cookie('cinemax_token', token, COOKIE_OPTIONS);
    return { user };
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { token, user } = await this.authService.register(registerDto);
    res.cookie('cinemax_token', token, COOKIE_OPTIONS);
    return { user };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser('id') userId: number, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(userId);
    res.clearCookie('cinemax_token', { path: '/' });
    return { message: 'Sesión cerrada correctamente' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser('id') userId: number) {
    return this.authService.getProfile(userId);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  updateProfile(@CurrentUser('id') userId: number, @Body() updateDto: UpdateProfileDto) {
    return this.authService.updateProfile(userId, updateDto);
  }
}
