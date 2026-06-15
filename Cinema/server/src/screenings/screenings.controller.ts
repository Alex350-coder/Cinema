import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, ParseIntPipe, DefaultValuePipe, ParseBoolPipe } from '@nestjs/common';
import { ScreeningsService } from './screenings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateScreeningDto } from './dto/create-screening.dto';

@Controller('api/screenings')
export class ScreeningsController {
  constructor(private readonly screeningsService: ScreeningsService) {}

  @Get()
  findAll(@Query('all', new DefaultValuePipe(false), ParseBoolPipe) all: boolean) {
    return this.screeningsService.findAll(all);
  }

  @Get('by-movie/:movieId')
  findByMovie(@Param('movieId', ParseIntPipe) movieId: number) {
    return this.screeningsService.findByMovie(movieId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.screeningsService.findOne(id);
  }

  @Get(':id/seats')
  getSeatMap(@Param('id', ParseIntPipe) id: number) {
    return this.screeningsService.getSeatMap(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createScreeningDto: CreateScreeningDto) {
    return this.screeningsService.create(createScreeningDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() createScreeningDto: CreateScreeningDto) {
    return this.screeningsService.update(id, createScreeningDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.screeningsService.deactivate(id);
  }
}
