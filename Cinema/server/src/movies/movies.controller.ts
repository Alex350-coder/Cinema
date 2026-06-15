import { Controller, Get, Post, Put, Delete, Patch, Param, Body, Query, UseGuards, ParseIntPipe, DefaultValuePipe, ParseBoolPipe } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Controller('api/movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  findAll(@Query('all', new DefaultValuePipe(false), ParseBoolPipe) all: boolean) {
    return this.moviesService.findAll(all);
  }

  @Get('featured')
  findFeatured() {
    return this.moviesService.findFeatured();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createMovieDto: CreateMovieDto) {
    return this.moviesService.create(createMovieDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateMovieDto: UpdateMovieDto) {
    return this.moviesService.update(id, updateMovieDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.softDelete(id);
  }

  @Patch(':id/featured')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  toggleFeatured(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.toggleFeatured(id);
  }
}
