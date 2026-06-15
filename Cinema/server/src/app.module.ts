import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MoviesModule } from './movies/movies.module';
import { ScreeningsModule } from './screenings/screenings.module';
import { ReservationsModule } from './reservations/reservations.module';
import { SnacksModule } from './snacks/snacks.module';
import { RoomsModule } from './rooms/rooms.module';
import {
  Role,
  User,
  Genre,
  Movie,
  Room,
  Screening,
  Seat,
  Reservation,
  ReservationSeat,
  Snack,
  ReservationSnack,
} from './entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'cinemax_user'),
        password: configService.get<string>('DB_PASSWORD', 'cinemax_pass123'),
        database: configService.get<string>('DB_DATABASE', 'cinemax'),
        entities: [
          Role, User, Genre, Movie, Room, Screening,
          Seat, Reservation, ReservationSeat, Snack, ReservationSnack,
        ],
        synchronize: false,
        logging: true,
      }),
    }),
    AuthModule,
    UsersModule,
    MoviesModule,
    ScreeningsModule,
    ReservationsModule,
    SnacksModule,
    RoomsModule,
  ],
})
export class AppModule {}
