import apiClient from './client';
import type { AuthResponse, Movie, Screening, Seat, Reservation, Snack, Room, User, PaginatedResponse } from '../types';

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<AuthResponse>('/auth/login', { email, password }).then(r => r.data),
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    apiClient.post<AuthResponse>('/auth/register', data).then(r => r.data),
  logout: () =>
    apiClient.post('/auth/logout').then(r => r.data),
  getProfile: () =>
    apiClient.get<User>('/auth/me').then(r => r.data),
  updateProfile: (data: Partial<User>) =>
    apiClient.put<User>('/auth/me', data).then(r => r.data),
};

export const moviesApi = {
  getAll: (all = false) =>
    apiClient.get<Movie[]>(`/movies${all ? '?all=true' : ''}`).then(r => r.data),
  getFeatured: () =>
    apiClient.get<Movie[]>('/movies/featured').then(r => r.data),
  getOne: (id: number) =>
    apiClient.get<Movie>(`/movies/${id}`).then(r => r.data),
  create: (data: Partial<Movie>) =>
    apiClient.post<Movie>('/movies', data).then(r => r.data),
  update: (id: number, data: Partial<Movie>) =>
    apiClient.put<Movie>(`/movies/${id}`, data).then(r => r.data),
  delete: (id: number) =>
    apiClient.delete(`/movies/${id}`).then(r => r.data),
  toggleFeatured: (id: number) =>
    apiClient.patch<Movie>(`/movies/${id}/featured`).then(r => r.data),
};

export const screeningsApi = {
  getAll: (all = false) =>
    apiClient.get<Screening[]>(`/screenings${all ? '?all=true' : ''}`).then(r => r.data),
  getByMovie: (movieId: number) =>
    apiClient.get<Screening[]>(`/screenings/by-movie/${movieId}`).then(r => r.data),
  getOne: (id: number) =>
    apiClient.get<Screening>(`/screenings/${id}`).then(r => r.data),
  getSeats: (id: number) =>
    apiClient.get<Seat[]>(`/screenings/${id}/seats`).then(r => r.data),
  create: (data: any) =>
    apiClient.post<Screening>('/screenings', data).then(r => r.data),
  update: (id: number, data: any) =>
    apiClient.put<Screening>(`/screenings/${id}`, data).then(r => r.data),
  deactivate: (id: number) =>
    apiClient.delete(`/screenings/${id}`).then(r => r.data),
};

export const reservationsApi = {
  create: (data: { screeningId: number; seatIds: number[]; snacks?: { snackId: number; quantity: number }[] }) =>
    apiClient.post<Reservation>('/reservations', data).then(r => r.data),
  getMy: () =>
    apiClient.get<Reservation[]>('/reservations/my').then(r => r.data),
  getOne: (id: number) =>
    apiClient.get<Reservation>(`/reservations/${id}`).then(r => r.data),
  simulatePayment: (id: number) =>
    apiClient.post<Reservation>(`/reservations/${id}/simulate-payment`).then(r => r.data),
  cancel: (id: number) =>
    apiClient.post<Reservation>(`/reservations/${id}/cancel`).then(r => r.data),
  getAll: () =>
    apiClient.get<Reservation[]>('/reservations').then(r => r.data),
};

export const snacksApi = {
  getAll: (all = false) =>
    apiClient.get<{ items: Snack[]; grouped: Record<string, Snack[]> }>(`/snacks${all ? '?all=true' : ''}`).then(r => r.data),
  getOne: (id: number) =>
    apiClient.get<Snack>(`/snacks/${id}`).then(r => r.data),
  create: (data: any) =>
    apiClient.post<Snack>('/snacks', data).then(r => r.data),
  update: (id: number, data: any) =>
    apiClient.put<Snack>(`/snacks/${id}`, data).then(r => r.data),
  toggleAvailability: (id: number) =>
    apiClient.patch<Snack>(`/snacks/${id}/availability`).then(r => r.data),
  delete: (id: number) =>
    apiClient.delete(`/snacks/${id}`).then(r => r.data),
};

export const roomsApi = {
  getAll: () =>
    apiClient.get<Room[]>('/rooms').then(r => r.data),
  getOne: (id: number) =>
    apiClient.get<Room>(`/rooms/${id}`).then(r => r.data),
};

export const usersApi = {
  getAll: (page = 1, limit = 20) =>
    apiClient.get<PaginatedResponse<User>>(`/users?page=${page}&limit=${limit}`).then(r => r.data),
  changeRole: (id: number, roleId: number) =>
    apiClient.put(`/users/${id}/role`, { roleId }).then(r => r.data),
};
