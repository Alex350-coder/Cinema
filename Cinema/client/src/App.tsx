import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { MovieDetailPage } from './pages/MovieDetailPage';
import { BookingPage } from './pages/BookingPage';
import { ProfilePage } from './pages/ProfilePage';
import { ReservationsPage } from './pages/ReservationsPage';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { NotFound } from './components/ui/NotFound';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { useAuthStore } from './store/useAuthStore';

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminMoviesPage = lazy(() => import('./pages/admin/AdminMoviesPage').then(m => ({ default: m.AdminMoviesPage })));
const AdminScreeningsPage = lazy(() => import('./pages/admin/AdminScreeningsPage').then(m => ({ default: m.AdminScreeningsPage })));
const AdminSnacksPage = lazy(() => import('./pages/admin/AdminSnacksPage').then(m => ({ default: m.AdminSnacksPage })));

function AdminFallback() {
  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>
      <div className="w-60 shrink-0" />
      <main className="flex-1 p-6">
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
        </div>
      </main>
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => { hydrate(); }, [hydrate]);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/login" element={<><Navbar /><LoginPage /><Footer /></>} />
          <Route path="/register" element={<><Navbar /><RegisterPage /><Footer /></>} />
          <Route path="/movie/:id" element={<><Navbar /><MovieDetailPage /><Footer /></>} />
          <Route path="/booking" element={<ProtectedRoute><><Navbar /><BookingPage /><Footer /></></ProtectedRoute>} />
          <Route path="/booking/:screeningId" element={<ProtectedRoute><><Navbar /><BookingPage /><Footer /></></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><><Navbar /><ProfilePage /><Footer /></></ProtectedRoute>} />
          <Route path="/reservations" element={<ProtectedRoute><><Navbar /><ReservationsPage /><Footer /></></ProtectedRoute>} />
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <Suspense fallback={<AdminFallback />}>
                <AdminLayout />
              </Suspense>
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="movies" element={<AdminMoviesPage />} />
            <Route path="screenings" element={<AdminScreeningsPage />} />
            <Route path="snacks" element={<AdminSnacksPage />} />
          </Route>
          <Route path="/" element={<><Navbar /><HomePage /><Footer /></>} />
          <Route path="*" element={<><Navbar /><NotFound /><Footer /></>} />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
            },
          }}
        />
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
