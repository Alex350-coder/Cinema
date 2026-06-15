import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query, UseGuards, ParseIntPipe, DefaultValuePipe, ParseBoolPipe } from '@nestjs/common';
import { SnacksService } from './snacks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateSnackDto } from './dto/create-snack.dto';

@Controller('api/snacks')
export class SnacksController {
  constructor(private readonly snacksService: SnacksService) {}

  @Get()
  findAll(@Query('all', new DefaultValuePipe(false), ParseBoolPipe) all: boolean) {
    return this.snacksService.findAll(all);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.snacksService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createSnackDto: CreateSnackDto) {
    return this.snacksService.create(createSnackDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() createSnackDto: CreateSnackDto) {
    return this.snacksService.update(id, createSnackDto);
  }

  @Patch(':id/availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  toggleAvailability(@Param('id', ParseIntPipe) id: number) {
    return this.snacksService.toggleAvailability(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.snacksService.remove(id);
  }
}
