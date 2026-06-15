# Fase 2 — Frontend

## Qué se construyó

- Proyecto Vite + React 19 + TypeScript configurado desde cero
- 3 stores Zustand: autenticación (auth), tema (theme), flujo de reserva (booking)
- 14 componentes reutilizables entre layouts, UI y secciones
- 9 páginas: Home, Login, Register, MovieDetail, Booking, Profile, Reservations, AdminDashboard, AdminMovies
- 7 secciones en la página principal: Hero, FeaturedMovies, Screenings, About, Navbar, Footer
- Panel admin con sidebar, dashboard con estadísticas y CRUD completo de películas
- Integración completa con el backend mediante 30+ hooks de React Query

## Decisiones de diseño

- Tema oscuro: púrpura profundo (#0D0A1A base, #7C3AED accent)
- Tema cálido: ámbar/dorado (#1A1208 base, #D97706 accent)
- Persistencia de tema en localStorage con transiciones suaves (200ms)
- Tipografía: Playfair Display (display) + Inter (UI)
- Librerías principales:
  - Vite 6 + React 19 + TypeScript 5
  - React Router DOM v7
  - Zustand v5 (estado global)
  - TanStack React Query v5 (peticiones API)
  - Framer Motion v12 (animaciones)
  - Tailwind CSS v4 + @tailwindcss/vite
  - Axios (cliente HTTP con interceptores)
  - react-hot-toast (notificaciones)
  - lucide-react (iconos)
  - date-fns (formateo de fechas)
  - clsx (utilidad de clases)

## Cómo correr

1. Asegúrate de que el backend esté corriendo en el puerto 3001
2. `cd Cinema/client && npm install && npm run dev`
3. Abre http://localhost:5173

## Credenciales de prueba

- Admin: admin@cinemax.pe / Admin123!
- Usuario: juan.perez@gmail.com / User123!

## Estructura de rutas

| Ruta | Página | Protegida |
|------|--------|-----------|
| `/` | Home (single-scroll) | No |
| `/login` | Login | No |
| `/register` | Registro | No |
| `/movie/:id` | Detalle de película | No |
| `/booking/:screeningId` | Flujo de reserva | Sí (auth) |
| `/profile` | Perfil del usuario | Sí (auth) |
| `/reservations` | Historial de reservas | Sí (auth) |
| `/admin` | Dashboard admin | Sí (admin) |
| `/admin/movies` | CRUD películas | Sí (admin) |

## Qué debe conectarse/verificarse en Fase 3

- Integración real con pasarela de pago
- CRUD de funciones en admin
- CRUD de salas en admin
- CRUD de bocadillos en admin
- Búsqueda y filtros avanzados de películas
- Modo offline / PWA
- Testing E2E con Playwright
- CI/CD pipeline
