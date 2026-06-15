import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import type { Screening } from '../types';
import {
  moviesApi, screeningsApi, reservationsApi,
  snacksApi, roomsApi, authApi, usersApi,
} from '../api/endpoints';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

export function useMovies(all = false) {
  return useQuery({
    queryKey: ['movies', { all }],
    queryFn: () => moviesApi.getAll(all),
    staleTime: 5 * 60 * 1000,
  });
}

export function useFeaturedMovies() {
  return useQuery({
    queryKey: ['movies', 'featured'],
    queryFn: moviesApi.getFeatured,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMovie(id: number) {
  return useQuery({
    queryKey: ['movies', id],
    queryFn: () => moviesApi.getOne(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateMovie() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: moviesApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['movies'] }); toast.success('Película creada'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error al crear'),
  });
}

export function useUpdateMovie() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => moviesApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['movies'] }); toast.success('Película actualizada'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error al actualizar'),
  });
}

export function useDeleteMovie() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: moviesApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['movies'] }); toast.success('Película eliminada'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error al eliminar'),
  });
}

export function useToggleFeatured() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: moviesApi.toggleFeatured,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['movies'] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error'),
  });
}

export function useScreenings(all = false) {
  return useQuery({
    queryKey: ['screenings', { all }],
    queryFn: () => screeningsApi.getAll(all),
    staleTime: 2 * 60 * 1000,
  });
}

export function useScreeningSeats(id: number) {
  return useQuery({
    queryKey: ['screenings', id, 'seats'],
    queryFn: () => screeningsApi.getSeats(id),
    enabled: !!id,
    staleTime: 0,
  });
}

export function useScreening(id: number) {
  return useQuery({
    queryKey: ['screenings', id],
    queryFn: () => screeningsApi.getOne(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useSnacks(all = false) {
  return useQuery({
    queryKey: ['snacks', { all }],
    queryFn: () => snacksApi.getAll(all),
    staleTime: 5 * 60 * 1000,
  });
}

export function useReservations() {
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['reservations', 'my'],
    queryFn: reservationsApi.getMy,
    enabled: isAuth,
    staleTime: 60 * 1000,
  });
}

export function useAllReservations() {
  return useQuery({
    queryKey: ['reservations', 'all'],
    queryFn: reservationsApi.getAll,
    staleTime: 60 * 1000,
  });
}

export function useCreateReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reservationsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reservations'] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error al crear reserva'),
  });
}

export function useSimulatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reservationsApi.simulatePayment,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reservations'] }); toast.success('Pago simulado exitosamente'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error en pago'),
  });
}

export function useCancelReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reservationsApi.cancel,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reservations'] }); toast.success('Reserva cancelada'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error al cancelar'),
  });
}

export function useRooms() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: roomsApi.getAll,
    staleTime: 10 * 60 * 1000,
  });
}

export function useUsers(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['users', page, limit],
    queryFn: () => usersApi.getAll(page, limit),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateScreening() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: screeningsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['screenings'] }); toast.success('Función creada'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error al crear función'),
  });
}

export function useUpdateScreening() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => screeningsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['screenings'] }); toast.success('Función actualizada'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error al actualizar'),
  });
}

export function useDeactivateScreening() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: screeningsApi.deactivate,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['screenings'] }); toast.success('Función desactivada'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error'),
  });
}

export function useCreateSnack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: snacksApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['snacks'] }); toast.success('Bocadillo creado'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error al crear'),
  });
}

export function useUpdateSnack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => snacksApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['snacks'] }); toast.success('Bocadillo actualizado'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error al actualizar'),
  });
}

export function useToggleSnackAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: snacksApi.toggleAvailability,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['snacks'] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error'),
  });
}

export function useDeleteSnack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: snacksApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['snacks'] }); toast.success('Bocadillo eliminado'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error al eliminar'),
  });
}

export function useWeeklyScreenings() {
  return useQuery({
    queryKey: ['screenings', 'weekly'],
    queryFn: () => apiClient.get<Screening[]>('/screenings').then(r => r.data),
    staleTime: 2 * 60 * 1000,
  });
}
