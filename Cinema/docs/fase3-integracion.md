# Fase 3 — Integración y Producción

## Qué se corrigió y mejoró

### Integración End-to-End
- Verificados todos los endpoints del frontend contra el backend real
- Creado `src/lib/api.ts` centralizado con todos los endpoints tipados
- Agregados DTOs TypeScript (`CreateMovieDto`, `UpdateMovieDto`, `CreateScreeningDto`, `CreateReservationDto`, etc.)
- Axios client ahora usa `VITE_API_URL` desde variable de entorno
- Creado archivo `.env` con `VITE_API_URL=http://localhost:3001`

### Funcionalidades nuevas en Admin
- **AdminScreeningsPage** (`/admin/screenings`): CRUD completo de funciones con selector de película/sala, datetime-local, precio, formato, idioma
- **AdminSnacksPage** (`/admin/snacks`): CRUD completo de bocadillos con tabla, toggle inline de disponibilidad, modal de crear/editar
- **AdminDashboard** mejorado con estadísticas reales: películas activas, destacadas, funciones activas, reservas del día, ingresos totales

### MovieDetailPage — Completada
- Hero con poster grande, overlay gradiente, animación de entrada
- Información completa: título, rating, géneros, director, duración, año, idioma
- Sección de reparto con chips
- Trailer embed de YouTube (extrae ID de URL automáticamente)
- Próximas funciones agrupadas con botón de reservar
- Botón "Volver a la cartelera"
- Estado de carga con skeleton, error elegante

### BookingPage — Mejorada
- Animaciones con Framer Motion en todos los pasos
- Mapa de asientos visual con disposición por filas (A-J), colores para disponible/ocupado/VIP/seleccionado
- Tarjeta de crédito con preview en tiempo real (formatea número cada 4 dígitos, muestra titular/vence/CVV)
- Spinner de carga durante procesamiento de pago (1.5s simulado)
- Animación de éxito con checkmark y confeti visual
- Botón "Ver mis reservas" y "Volver al inicio" tras confirmación
- Manejo de race condition: si asientos ya no disponibles, muestra toast de error específico

### UX — Pulido
- **ErrorBoundary** global: captura errores inesperados con botón de reintentar
- **NotFound** (404): página elegante con enlace al inicio
- **Navbar**: IntersectionObserver detecta sección activa en homepage, indicador animado con `layoutId`
- **ProfilePage**: muestra últimas 3 reservas con estado, botón "Ver todas", contador de reservas totales y películas vistas
- **React.memo** en MovieCard para evitar re-renders innecesarios
- **Lazy loading**: admin routes cargadas con `React.lazy` + `Suspense` (usuario normal nunca las descarga)
- Skeletons mejorados con `animate-pulse` en varias secciones
- Atributos `loading="lazy"` en imágenes de posters
- `aria-label` en todos los iconos botón
- Contraste de texto verificado en ambos temas (oscuro púrpura y cálido ámbar)

### Performance
- Code splitting automático por ruta admin (cada página admin en su propio chunk)
- Chunk principal reducido a 521 KB
- Caché de React Query con staleTime de 5 min para películas, 0 para asientos

## Flujos end-to-end verificados

- [x] **Visitante anónimo**: Home → carga destacadas reales → ver funciones → intentar reservar → redirige a login
- [x] **Usuario**: Login → detalle película → reservar 2 asientos + 1 bocadillo → simular pago → código confirmación → ver reservas → cancelar pendiente → editar perfil
- [x] **Admin**: Login → dashboard con stats → crear/editar película → toggle destacada → crear función para esa película → desactivar película
- [x] **Tema**: toggle púrpura ↔ ámbar → persiste al recargar → todos los elementos se ven correctos en ambos temas

## Cómo correr el proyecto completo

1. Requisitos: Node.js 20+, Docker Desktop corriendo
2. `cd Cinema`
3. `docker-compose up -d` (inicia PostgreSQL)
4. `cd server && npm install && npm run start:dev` (backend en puerto 3001)
5. `cd client && npm install && npm run dev` (frontend en puerto 5173)

O desde la raíz:
```
cd Cinema
npm install
npm run dev
```

## Arquitectura final

| Componente | Tecnología | Puerto |
|------------|-----------|--------|
| Frontend | React + Vite 8 + Tailwind 4 + Zustand + React Query | 5173 |
| Backend | NestJS + TypeORM | 3001 |
| Base de datos | PostgreSQL 16 (Docker) | 5432 |
| Proxy | Vite proxy `/api` → localhost:3001 | automático |

## Credenciales

- Admin: admin@cinemax.pe / Admin123!
- Usuario 1: juan.perez@gmail.com / User123!
- Usuario 2: maria.garcia@gmail.com / User123!

## Variables de entorno

### Backend (server/.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=cinemax_user
DB_PASSWORD=cinemax_pass123
DB_DATABASE=cinemax
JWT_SECRET=cinemax_super_secret_jwt_2024
JWT_EXPIRES_IN=7d
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### Frontend (client/.env)
```
VITE_API_URL=http://localhost:3001
```

## Decisiones técnicas

- **Centralized api.ts**: Se creó `src/lib/api.ts` con tipado completo para centralizar todas las llamadas al backend y evitar imports dispersos
- **Lazy loading admin**: Las rutas admin se cargan con `React.lazy` porque son pesadas y solo accesibles por administradores
- **IntersectionObserver en Navbar**: Se usó en lugar de scroll event listeners para mejor performance y detección precisa de sección activa
- **memo en MovieCard**: Las tarjetas de películas reciben props simples (Movie) y no cambian entre renders, `memo` evita re-renders innecesarios
- **Card preview en tiempo real**: La tarjeta de crédito del booking se actualiza con cada cambio en los inputs para feedback visual inmediato

## Problemas encontrados y soluciones

| Problema | Solución |
|----------|----------|
| Vite 8 no incluye React como dependencia (JSX build-in) | Instalar `react` y `react-dom` explícitamente |
| framer-motion no resuelve `react/jsx-runtime` con Vite 8 | Instalar React como dependencia directa resuelve peer-deps |
| `@types/react` no instalado por defecto | Instalar `@types/react` y `@types/react-dom` |
| TypeScript 6 estricto con `verbatimModuleSyntax` | Usar `import type` para tipos, export named para componentes |
| IntersectionObserver no disponible en SSR | Guard clause con `if (!isHome) return` |
