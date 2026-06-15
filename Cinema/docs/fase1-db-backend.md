# Fase 1 — Base de Datos y Backend

## Qué se construyó

- Base de datos PostgreSQL con 11 tablas, triggers e índices
- Esquema relacional con integridad referencial completa
- Trigger de verificación de disponibilidad de asientos (evita doble reserva)
- Datos iniciales reales: 8 películas, 4 salas, asientos generados, 14 bocadillos, 3 usuarios
- Backend NestJS completo con 7 módulos funcionales
- Autenticación JWT con guards de roles (admin/user)
- Transacciones ACID para creación de reservas
- Mapa de asientos con disponibilidad en tiempo real
- Manejo global de errores con respuestas consistentes

## Tablas creadas

- **roles** → Roles del sistema (admin, user)
- **users** → Usuarios registrados con contraseñas hasheadas
- **genres** → Catálogo de géneros cinematográficos
- **movies** → Películas con datos completos (director, reparto, rating)
- **movie_genres** → Relación muchos-a-muchos entre películas y géneros
- **rooms** → Salas del cine con configuración de asientos
- **screenings** → Funciones/proyecciones con horarios y precios
- **seats** → Asientos individuales por sala con tipo (standard/vip/accessible)
- **reservations** → Reservas de usuarios para funciones específicas
- **reservation_seats** → Asientos reservados (con trigger anti-doble-reserva)
- **snacks** → Catálogo de bocadillos disponibles
- **reservation_snacks** → Bocadillos incluidos en cada reserva

## Endpoints disponibles

### Auth `/api/auth`
- `POST /login` → Iniciar sesión | No requiere auth
- `POST /register` → Registrar nuevo usuario | No requiere auth
- `GET /me` → Perfil del usuario autenticado | Requiere auth
- `PUT /me` → Actualizar perfil propio | Requiere auth

### Movies `/api/movies`
- `GET /` → Lista todas las películas activas | No requiere auth
- `GET /featured` → Películas destacadas | No requiere auth
- `GET /:id` → Detalle de película con funciones próximas | No requiere auth
- `POST /` → Crear película | Requiere admin
- `PUT /:id` → Editar película | Requiere admin
- `DELETE /:id` → Soft delete (is_active=false) | Requiere admin
- `PATCH /:id/featured` → Toggle destacado | Requiere admin

### Screenings `/api/screenings`
- `GET /` → Lista funciones activas con película y sala | No requiere auth
- `GET /by-movie/:movieId` → Funciones de una película | No requiere auth
- `GET /:id` → Detalle de función | No requiere auth
- `GET /:id/seats` → Mapa de asientos con disponibilidad | No requiere auth
- `POST /` → Crear función | Requiere admin
- `PUT /:id` → Editar función | Requiere admin
- `DELETE /:id` → Desactivar función | Requiere admin

### Reservations `/api/reservations`
- `POST /` → Crear reserva (transacción ACID) | Requiere auth
- `GET /my` → Historial de reservas del usuario | Requiere auth
- `GET /:id` → Detalle de reserva | Requiere auth
- `POST /:id/simulate-payment` → Simular pago | Requiere auth
- `POST /:id/cancel` → Cancelar reserva | Requiere auth
- `GET /` → Todas las reservas | Requiere admin

### Snacks `/api/snacks`
- `GET /` → Bocadillos agrupados por categoría | No requiere auth
- `GET /:id` → Detalle de bocadillo | No requiere auth
- `POST /` → Crear bocadillo | Requiere admin
- `PUT /:id` → Editar bocadillo | Requiere admin
- `PATCH /:id/availability` → Toggle disponibilidad | Requiere admin

### Rooms `/api/rooms`
- `GET /` → Lista todas las salas | No requiere auth
- `GET /:id` → Detalle de sala con asientos | No requiere auth

### Users `/api/users`
- `GET /` → Lista usuarios con paginación | Requiere admin
- `PUT /:id/role` → Cambiar rol de usuario | Requiere admin

## Cómo levantar

1. `cd Cinema`
2. `docker-compose up -d`
3. `cd server && npm install && npm run start:dev`

## Variables de entorno necesarias

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

## Qué debe conectarse en la Fase 2

- El servidor corre en `http://localhost:3001`
- Todos los endpoints base están documentados arriba
- El frontend debe usar JWT Bearer token en el header `Authorization`
- El endpoint de asientos por función (`GET /api/screenings/:id/seats`) devuelve el mapa completo para el selector de asientos
- La creación de reserva acepta: `{screeningId, seatIds[], snacks: [{snackId, quantity}]}`
