# CineMax

Sistema web de reserva de entradas para cine. Proyecto de portafolio que simula la experiencia completa de compra de boletos y snacks en un cine.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Backend | NestJS + TypeORM |
| Base de datos | PostgreSQL 16 (Docker) |
| Autenticación | JWT en cookie httpOnly |
| UI | Tailwind CSS 4 + Framer Motion + Radix UI |
| Estado | Zustand + TanStack Query |

## Funcionalidades

- Catálogo de películas con pósters desde TMDB
- Funciones con horarios, salas y precios
- Selección de asientos interactiva
- Carrito de snacks con categorías
- Autenticación de usuarios (registro / inicio de sesión)
- Panel administrativo para gestionar películas, funciones, bocadillos y usuarios
- Roles de usuario (`user` y `admin`)
- Tema claro / oscuro

## Consideraciones importantes

### Pagos
Los pagos **no están implementados**. Es un proyecto de muestra. Existe un endpoint `POST /reservations/:id/simulate-payment` que marca la reserva como `confirmed` sin procesar ningún pago real.

### Stack tecnológico
- **Backend**: NestJS con TypeORM y PostgreSQL. Las imágenes de las entidades se guardan como URLs (no archivos locales).
- **Frontend**: React 19 con Vite. `axios` con `withCredentials: true` para cookies. El build actual usa Rolldown (bundler de Vite 8).
- **Autenticación**: JWT almacenado en cookie httpOnly, no en localStorage. La sesión se puede invalidar desde el backend (token version).
- **Seed data**: La base de datos se inicializa automáticamente mediante `server/db/init.sql` al arrancar el contenedor por primera vez.

### Recursos de imágenes
- **Películas**: Pósters obtenidos de TMDB (`image.tmdb.org`). Si una URL falla, se muestra un placeholder de `placehold.co`.
- **Bocadillos**: Imágenes placeholder de `placehold.co` con el nombre del producto, ya que no existe un recurso equivalente a TMDB para imágenes de comida. Se incluye fallback `onError` con la inicial del producto.
- **Usuarios**: Sin avatar por defecto.

### Seguridad
- Las contraseñas se almacenan hasheadas con `bcrypt`.
- El JWT expira en 1 hora y se envía como cookie httpOnly.
- `helmet` activado para cabeceras de seguridad.
- Prevención de doble reserva del mismo asiento mediante trigger en base de datos.
- El archivo `.env` del servidor contiene las credenciales de la base de datos y la clave JWT. Para un despliegue real, estos valores deben cambiarse.

## Requisitos

- Node.js 18+
- Docker Desktop
- npm

## Instalación

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd Cinema

# 2. Instalar dependencias
npm run setup

# 3. Iniciar la base de datos (PostgreSQL en Docker)
npm run db:start

# 4. Configurar variables de entorno
cp server/.env.example server/.env
# Editar server/.env con los valores correspondientes

# 5. Iniciar el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`

## Usuarios por defecto

| Rol | Email | Contraseña |
|---|---|---|
| Admin | admin@cinemax.pe | Admin123! |
| Usuario | juan.perez@gmail.com | User123! |
| Usuario | maria.garcia@gmail.com | User123! |

## Scripts disponibles

| Script | Descripción |
|---|---|
| `npm run dev` | Inicia frontend y backend simultáneamente |
| `npm run dev:server` | Inicia solo el backend |
| `npm run dev:client` | Inicia solo el frontend |
| `npm run build` | Compila el frontend para producción |
| `npm run db:start` | Levanta PostgreSQL con Docker |
| `npm run db:stop` | Detiene PostgreSQL |
| `npm run db:reset` | Reinicia la base de datos desde cero |
| `npm run setup` | Instala dependencias de cliente y servidor |

## API Endpoints principales

### Autenticación
- `POST /api/auth/register` — Registro de usuario
- `POST /api/auth/login` — Inicio de sesión
- `POST /api/auth/logout` — Cerrar sesión
- `GET /api/auth/me` — Perfil del usuario autenticado
- `PUT /api/auth/me` — Actualizar perfil

### Películas
- `GET /api/movies` — Listar películas (`?all=true` incluye inactivas)
- `GET /api/movies/featured` — Películas destacadas
- `GET /api/movies/:id` — Detalle de película
- `POST /api/movies` — Crear película (admin)
- `PUT /api/movies/:id` — Actualizar película (admin)
- `DELETE /api/movies/:id` — Eliminar película (admin)
- `PATCH /api/movies/:id/featured` — Alternar destacado (admin)

### Funciones
- `GET /api/screenings` — Listar funciones (`?all=true` incluye inactivas)
- `GET /api/screenings/by-movie/:movieId` — Funciones por película
- `GET /api/screenings/:id` — Detalle de función
- `GET /api/screenings/:id/seats` — Asientos de una función
- `POST /api/screenings` — Crear función (admin)
- `PUT /api/screenings/:id` — Actualizar función (admin)
- `DELETE /api/screenings/:id` — Desactivar función (admin)

### Reservas
- `POST /api/reservations` — Crear reserva
- `GET /api/reservations/my` — Mis reservas
- `GET /api/reservations/:id` — Detalle de reserva
- `POST /api/reservations/:id/simulate-payment` — Simular pago
- `POST /api/reservations/:id/cancel` — Cancelar reserva
- `GET /api/reservations` — Todas las reservas (admin)

### Bocadillos
- `GET /api/snacks` — Listar bocadillos (`?all=true` incluye no disponibles)
- `GET /api/snacks/:id` — Detalle de bocadillo
- `POST /api/snacks` — Crear bocadillo (admin)
- `PUT /api/snacks/:id` — Actualizar bocadillo (admin)
- `DELETE /api/snacks/:id` — Eliminar bocadillo (admin)
- `PATCH /api/snacks/:id/availability` — Alternar disponibilidad (admin)

### Usuarios (admin)
- `GET /api/users` — Listar usuarios (paginado)
- `PUT /api/users/:id/role` — Cambiar rol de usuario

### Salas
- `GET /api/rooms` — Listar salas
- `GET /api/rooms/:id` — Detalle de sala

## Estructura del proyecto

```
Cinema/
├── client/              # Frontend React + Vite
│   ├── src/
│   │   ├── api/         # Cliente HTTP y endpoints
│   │   ├── components/  # Componentes UI
│   │   ├── pages/       # Páginas (admin, booking, etc.)
│   │   ├── store/       # Zustand stores
│   │   ├── hooks/       # Custom hooks
│   │   ├── types/       # Tipos TypeScript
│   │   └── styles/      # CSS tokens y estilos
│   └── .env
├── server/              # Backend NestJS
│   ├── src/
│   │   ├── auth/        # Módulo de autenticación
│   │   ├── movies/      # Módulo de películas
│   │   ├── screenings/  # Módulo de funciones
│   │   ├── reservations/# Módulo de reservas
│   │   ├── snacks/      # Módulo de bocadillos
│   │   ├── rooms/       # Módulo de salas
│   │   ├── users/       # Módulo de usuarios
│   │   ├── entities/    # Entidades TypeORM
│   │   └── common/      # Decoradores y filtros compartidos
│   ├── db/
│   │   └── init.sql     # Schema y seed data
│   └── .env.example
├── docker-compose.yml
└── package.json
```

## Licencia

Proyecto educativo y de portafolio. Sin licencia de uso comercial.
