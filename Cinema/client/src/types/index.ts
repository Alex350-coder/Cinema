export interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  phone: string | null;
  role: string;
  roleId: number;
  createdAt?: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Movie {
  id: number;
  title: string;
  description: string;
  durationMinutes: number;
  rating: string;
  posterUrl: string;
  trailerUrl: string;
  director: string;
  castList: string;
  releaseYear: number;
  language: string;
  isFeatured: boolean;
  isActive: boolean;
  genres: Genre[];
  screenings?: Screening[];
  upcomingScreenings?: Screening[];
  createdAt: string;
}

export interface Room {
  id: number;
  name: string;
  totalSeats: number;
  rows: number;
  seatsPerRow: number;
  roomType: string;
  seatCount?: number;
}

export interface Screening {
  id: number;
  movieId: number;
  roomId: number;
  startTime: string;
  endTime: string;
  basePrice: number;
  language: string;
  subtitleLanguage: string | null;
  format: string;
  isActive: boolean;
  movie: Movie;
  room: Room;
  createdAt: string;
}

export interface Seat {
  seatId: number;
  rowLabel: string;
  seatNumber: number;
  type: string;
  isAvailable: boolean;
}

export interface Reservation {
  id: number;
  userId: number;
  screeningId: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'simulated_paid';
  totalAmount: number;
  confirmationCode: string;
  createdAt: string;
  screening: Screening;
  reservationSeats: ReservationSeat[];
  reservationSnacks: ReservationSnack[];
  user?: User;
}

export interface ReservationSeat {
  id: number;
  reservationId: number;
  seatId: number;
  price: number;
  seat: Seat;
}

export interface Snack {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  isAvailable: boolean;
  stock: number;
}

export interface ReservationSnack {
  id: number;
  reservationId: number;
  snackId: number;
  quantity: number;
  unitPrice: number;
  snack: Snack;
}

export interface AuthResponse {
  user: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SnackGroupedResponse {
  items: Snack[];
  grouped: Record<string, Snack[]>;
}

export interface SeatMap {
  seatId: number;
  rowLabel: string;
  seatNumber: number;
  type: 'standard' | 'vip' | 'accessible';
  isAvailable: boolean;
}

export interface CreateMovieDto {
  title: string;
  description?: string;
  durationMinutes: number;
  rating?: string;
  posterUrl?: string;
  trailerUrl?: string;
  director?: string;
  castList?: string;
  releaseYear?: number;
  language?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface UpdateMovieDto extends Partial<CreateMovieDto> {}

export interface CreateScreeningDto {
  movieId: number;
  roomId: number;
  startTime: string;
  basePrice: number;
  format?: string;
  language?: string;
  subtitleLanguage?: string | null;
}

export interface UpdateScreeningDto extends Partial<CreateScreeningDto> {
  isActive?: boolean;
}

export interface CreateReservationDto {
  screeningId: number;
  seatIds: number[];
  snacks?: { snackId: number; quantity: number }[];
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface UpdateProfileDto {
  name?: string;
  phone?: string;
  avatarUrl?: string;
}
