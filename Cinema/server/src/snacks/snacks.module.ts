import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnacksController } from './snacks.controller';
import { SnacksService } from './snacks.service';
import { Snack } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Snack])],
  controllers: [SnacksController],
  providers: [SnacksService],
})
export class SnacksModule {}
