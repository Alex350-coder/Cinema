import { Controller, Get, Post, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Controller('api/reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser('id') userId: number, @Body() createDto: CreateReservationDto) {
    return this.reservationsService.create(userId, createDto);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  findMy(@CurrentUser('id') userId: number) {
    return this.reservationsService.findByUser(userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll() {
    return this.reservationsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reservationsService.findOne(id);
  }

  @Post(':id/simulate-payment')
  @UseGuards(JwtAuthGuard)
  simulatePayment(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.reservationsService.simulatePayment(id, userId);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  cancel(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.reservationsService.cancel(id, userId);
  }
}
