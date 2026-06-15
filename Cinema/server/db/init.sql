-- ============================================================
-- CineMax - Database Initialization Script
-- PostgreSQL 16
-- ============================================================

-- 1. ROLES
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

-- 2. USERS
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(255),
  phone VARCHAR(20),
  role_id INTEGER REFERENCES roles(id) DEFAULT 2,
  token_version INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. GENRES
CREATE TABLE genres (
  id SERIAL PRIMARY KEY,
  name VARCHAR(80) UNIQUE NOT NULL
);

-- 4. MOVIES
CREATE TABLE movies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  rating VARCHAR(10),
  poster_url VARCHAR(255),
  trailer_url VARCHAR(255),
  director VARCHAR(150),
  cast_list TEXT,
  release_year INTEGER,
  language VARCHAR(50) DEFAULT 'Español',
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. MOVIE_GENRES (many-to-many)
CREATE TABLE movie_genres (
  movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
  genre_id INTEGER REFERENCES genres(id) ON DELETE CASCADE,
  PRIMARY KEY (movie_id, genre_id)
);

-- 6. ROOMS
CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  total_seats INTEGER NOT NULL,
  rows INTEGER NOT NULL,
  seats_per_row INTEGER NOT NULL,
  room_type VARCHAR(50) DEFAULT 'standard'
);

-- 7. SCREENINGS
CREATE TABLE screenings (
  id SERIAL PRIMARY KEY,
  movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
  room_id INTEGER REFERENCES rooms(id),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  base_price NUMERIC(8,2) NOT NULL,
  language VARCHAR(50) DEFAULT 'Español',
  subtitle_language VARCHAR(50),
  format VARCHAR(20) DEFAULT '2D',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. SEATS
CREATE TABLE seats (
  id SERIAL PRIMARY KEY,
  room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
  row_label VARCHAR(5) NOT NULL,
  seat_number INTEGER NOT NULL,
  seat_type VARCHAR(20) DEFAULT 'standard',
  UNIQUE(room_id, row_label, seat_number)
);

-- 9. RESERVATIONS
CREATE TABLE reservations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  screening_id INTEGER REFERENCES screenings(id),
  status VARCHAR(30) DEFAULT 'pending',
  total_amount NUMERIC(10,2) NOT NULL,
  confirmation_code VARCHAR(20) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 10. RESERVATION_SEATS
CREATE TABLE reservation_seats (
  id SERIAL PRIMARY KEY,
  reservation_id INTEGER REFERENCES reservations(id) ON DELETE CASCADE,
  seat_id INTEGER REFERENCES seats(id),
  price NUMERIC(8,2) NOT NULL
);

-- 11. SNACKS
CREATE TABLE snacks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price NUMERIC(8,2) NOT NULL,
  image_url VARCHAR(255),
  category VARCHAR(50),
  is_available BOOLEAN DEFAULT TRUE,
  stock INTEGER DEFAULT 100
);

-- 12. RESERVATION_SNACKS
CREATE TABLE reservation_snacks (
  id SERIAL PRIMARY KEY,
  reservation_id INTEGER REFERENCES reservations(id) ON DELETE CASCADE,
  snack_id INTEGER REFERENCES snacks(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(8,2) NOT NULL
);

-- ============================================================
-- TRIGGER: Prevent double-booking of seats per screening
-- ============================================================
CREATE OR REPLACE FUNCTION check_seat_availability()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM reservation_seats rs
    JOIN reservations r ON rs.reservation_id = r.id
    WHERE rs.seat_id = NEW.seat_id
      AND r.screening_id = (SELECT screening_id FROM reservations WHERE id = NEW.reservation_id)
      AND r.status NOT IN ('cancelled')
      AND r.id != NEW.reservation_id
  ) THEN
    RAISE EXCEPTION 'El asiento % ya está reservado para esta función', NEW.seat_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_seat_availability
BEFORE INSERT ON reservation_seats
FOR EACH ROW EXECUTE FUNCTION check_seat_availability();

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_movies_active ON movies(is_active);
CREATE INDEX idx_movies_featured ON movies(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_screenings_movie ON screenings(movie_id);
CREATE INDEX idx_screenings_room ON screenings(room_id);
CREATE INDEX idx_screenings_start ON screenings(start_time);
CREATE INDEX idx_screenings_active ON screenings(is_active);
CREATE INDEX idx_seats_room ON seats(room_id);
CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_screening ON reservations(screening_id);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservation_seats_seat ON reservation_seats(seat_id);
CREATE INDEX idx_reservation_seats_reservation ON reservation_seats(reservation_id);
CREATE INDEX idx_snacks_category ON snacks(category);
CREATE INDEX idx_snacks_available ON snacks(is_available);

-- ============================================================
-- SEED DATA
-- ============================================================

-- ROLES
INSERT INTO roles (name) VALUES ('admin'), ('user');

-- GENRES
INSERT INTO genres (name) VALUES
('Acción'), ('Drama'), ('Comedia'), ('Terror'), ('Ciencia Ficción'),
('Animación'), ('Romance'), ('Thriller'), ('Aventura'), ('Fantasía');

-- MOVIES
INSERT INTO movies (title, description, duration_minutes, rating, poster_url, trailer_url, director, cast_list, release_year, language, is_featured, is_active) VALUES
(
  'Dune: Part Two',
  'Paul Atreides se une a los Fremen para vengar la caída de su familia mientras lidera una guerra contra quienes destruyeron a su casa. En su camino deberá elegir entre el amor de su vida y el destino del universo.',
  166, 'PG-13',
  'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
  'https://www.youtube.com/watch?v=Way9Dexny3w',
  'Denis Villeneuve',
  '["Timothée Chalamet","Zendaya","Rebecca Ferguson","Josh Brolin","Austin Butler","Florence Pugh"]',
  2024, 'Español', TRUE, TRUE
),
(
  'Oppenheimer',
  'El físico J. Robert Oppenheimer lidera el Proyecto Manhattan para desarrollar la bomba atómica durante la Segunda Guerra Mundial. Una historia sobre el poder, la ciencia y las consecuencias morales de la destrucción masiva.',
  180, 'R',
  'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
  'https://www.youtube.com/watch?v=uYPbbksJxIg',
  'Christopher Nolan',
  '["Cillian Murphy","Robert Downey Jr.","Matt Damon","Emily Blunt","Florence Pugh"]',
  2023, 'Español', TRUE, TRUE
),
(
  'Inside Out 2',
  'Riley ya es una adolescente y su cuartel central se enfrenta a una repentina demolición para hacer espacio a nuevas emociones. Ansiedad, Envidia, Ennui y Vergüenza llegan para revolucionar la vida de la joven.',
  96, 'PG',
  'https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
  'https://www.youtube.com/watch?v=LEjhY15eCx0',
  'Kelsey Mann',
  '["Amy Poehler","Maya Hawke","Kensington Tallman","Tony Hale","Liza Lapira"]',
  2024, 'Español', TRUE, TRUE
),
(
  'Godzilla x Kong: The New Empire',
  'Godzilla y Kong unen fuerzas para enfrentar una amenaza colosal oculta en las profundidades de la Tierra. Una nueva aventura que expande el MonsterVerse con batallas épicas y criaturas nunca antes vistas.',
  115, 'PG-13',
  'https://image.tmdb.org/t/p/w500/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg',
  'https://www.youtube.com/watch?v=lV1OOlGwExM',
  'Adam Wingard',
  '["Rebecca Hall","Dan Stevens","Kaylee Hottle","Brian Tyree Henry"]',
  2024, 'Español', FALSE, TRUE
),
(
  'Deadpool & Wolverine',
  'Deadpool viaja por el multiverso para reclutar a una variante de Wolverine y salvar su universo de una amenaza existencial. La dupla más explosiva de Marvel finalmente se une en una aventura llena de humor y acción.',
  128, 'R',
  'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
  'https://www.youtube.com/watch?v=73_1biulkYk',
  'Shawn Levy',
  '["Ryan Reynolds","Hugh Jackman","Emma Corrin","Morena Baccarin","Rob Delaney"]',
  2024, 'Español', FALSE, TRUE
),
(
  'Kingdom of the Planet of the Apes',
  'Generaciones después del reinado de César, los simios viven en armonía mientras los humanos han quedado relegados. Un joven simio emprende un viaje que lo llevará a cuestionar todo lo que sabe sobre el pasado.',
  145, 'PG-13',
  'https://image.tmdb.org/t/p/w500/gKkl37BQuKTanygYQG1pyYgLVgf.jpg',
  'https://www.youtube.com/watch?v=X0tOpBuYasI',
  'Wes Ball',
  '["Owen Teague","Freya Allan","Kevin Durand","Peter Macon"]',
  2024, 'Español', FALSE, TRUE
),
(
  'Alien: Romulus',
  'Un grupo de colonos espaciales descubre una estación abandonada y se enfrenta a la criatura más letal del universo. Una nueva entrega de la franquicia Alien que regresa a sus raíces de terror y supervivencia.',
  119, 'R',
  'https://image.tmdb.org/t/p/w500/2uSWRTtCG336nuBiG8jOTEUKSy8.jpg',
  'https://www.youtube.com/watch?v=OzY2r2J2iNk',
  'Fede Álvarez',
  '["Cailee Spaeny","David Jonsson","Archie Renaux","Isabela Merced"]',
  2024, 'Español', FALSE, TRUE
),
(
  'Twisters',
  'Una excazadora de tormentas regresa a Oklahoma para probar un nuevo sistema de predicción meteorológica, pero se encuentra con una temporada de tornados devastadora. Kate y Tyler deberán unir fuerzas para sobrevivir.',
  122, 'PG-13',
  'https://image.tmdb.org/t/p/w500/pjnD08FlMAIXsfOLKQbvmO0f0MD.jpg',
  'https://www.youtube.com/watch?v=obMcGKn5h5M',
  'Lee Isaac Chung',
  '["Daisy Edgar-Jones","Glen Powell","Anthony Ramos","Brandon Perea"]',
  2024, 'Español', FALSE, TRUE
);

-- MOVIE_GENRES
INSERT INTO movie_genres (movie_id, genre_id) VALUES
(1, 1), (1, 5), (1, 9),
(2, 2), (2, 8),
(3, 6), (3, 3),
(4, 1), (4, 5), (4, 9),
(5, 1), (5, 3), (5, 5),
(6, 1), (6, 9), (6, 2),
(7, 4), (7, 5),
(8, 1), (8, 2), (8, 9);

-- ROOMS
INSERT INTO rooms (name, total_seats, rows, seats_per_row, room_type) VALUES
('Sala 1 - Standard', 80, 10, 8, 'standard'),
('Sala 2 - VIP', 40, 5, 8, 'vip'),
('Sala 3 - IMAX', 120, 12, 10, 'imax'),
('Sala 4 - 4DX', 60, 6, 10, '4dx');

-- SEATS (generated programmatically)
DO $$
DECLARE
  room RECORD;
  row_letter CHAR(1);
  seat_num INTEGER;
  seat_type_val VARCHAR(20);
BEGIN
  FOR room IN SELECT * FROM rooms LOOP
    FOR row_num IN 0..(room.rows - 1) LOOP
      row_letter := CHR(65 + row_num);
      FOR seat_num IN 1..room.seats_per_row LOOP
        IF room.room_type = 'vip' THEN
          seat_type_val := 'vip';
        ELSIF row_num = 0 AND seat_num IN (1, room.seats_per_row) THEN
          seat_type_val := 'accessible';
        ELSE
          seat_type_val := 'standard';
        END IF;
        INSERT INTO seats (room_id, row_label, seat_number, seat_type)
        VALUES (room.id, row_letter, seat_num, seat_type_val);
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- SCREENINGS (next 7 days, distributed across rooms)
INSERT INTO screenings (movie_id, room_id, start_time, end_time, base_price, language, subtitle_language, format, is_active)
SELECT
  m.id,
  r.id,
  date_start + time_start,
  date_start + time_start + (m.duration_minutes || ' minutes')::INTERVAL,
  CASE r.room_type
    WHEN 'standard' THEN 22.00
    WHEN 'vip' THEN 38.00
    WHEN 'imax' THEN 35.00
    WHEN '4dx' THEN 42.00
  END,
  'Español',
  NULL,
  CASE r.room_type
    WHEN 'imax' THEN 'IMAX'
    WHEN '4dx' THEN '4DX'
    ELSE '2D'
  END,
  TRUE
FROM (VALUES
  (1, 1, '14:00'::TIME), (1, 3, '17:00'::TIME), (2, 1, '19:30'::TIME),
  (3, 2, '14:00'::TIME), (3, 4, '16:30'::TIME), (4, 3, '22:00'::TIME),
  (5, 1, '22:00'::TIME), (5, 4, '19:30'::TIME), (6, 3, '14:00'::TIME),
  (7, 2, '19:30'::TIME), (7, 4, '14:00'::TIME), (8, 1, '17:00'::TIME),
  (2, 3, '19:30'::TIME), (4, 1, '14:00'::TIME), (6, 2, '17:00'::TIME),
  (8, 3, '22:00'::TIME)
) AS s(movie_id, room_id, time_start)
CROSS JOIN LATERAL (
  SELECT NOW()::DATE + GENERATE_SERIES(1, 7) AS date_start
) AS dates
JOIN movies m ON m.id = s.movie_id
JOIN rooms r ON r.id = s.room_id;

-- SNACKS
INSERT INTO snacks (name, description, price, image_url, category, is_available, stock) VALUES
('Palomitas Pequeñas', 'Palomitas de maíz recién hechas, porción individual', 12.00, 'https://placehold.co/200x200/d4a373/333?text=Palomitas+Peq', 'palomitas', TRUE, 200),
('Palomitas Medianas', 'Palomitas de maíz, porción mediana para compartir', 18.00, 'https://placehold.co/200x200/d4a373/333?text=Palomitas+Med', 'palomitas', TRUE, 150),
('Palomitas Grandes', 'Palomitas de maíz gigantes, ideal para dos personas', 24.00, 'https://placehold.co/200x200/d4a373/333?text=Palomitas+Gde', 'palomitas', TRUE, 100),
('Combo Dúo', '2 palomitas medianas + 2 bebidas medianas', 45.00, 'https://placehold.co/200x200/e9c46a/333?text=Combo+Duo', 'combos', TRUE, 80),
('Combo Familiar', 'Palomitas grandes + 4 bebidas + nachos', 65.00, 'https://placehold.co/200x200/e9c46a/333?text=Combo+Familiar', 'combos', TRUE, 60),
('Combo VIP', 'Palomitas grandes + 2 bebidas grandes + hot dog + dulce', 55.00, 'https://placehold.co/200x200/e9c46a/333?text=Combo+VIP', 'combos', TRUE, 50),
('Coca-Cola Personal', 'Coca-Cola clásica 400ml', 8.00, 'https://placehold.co/200x200/e63946/fff?text=Coca+Personal', 'bebidas', TRUE, 300),
('Coca-Cola Grande', 'Coca-Cola clásica 750ml', 12.00, 'https://placehold.co/200x200/e63946/fff?text=Coca+Grande', 'bebidas', TRUE, 200),
('Agua Mineral', 'Agua mineral sin gas 500ml', 6.00, 'https://placehold.co/200x200/a8dadc/333?text=Agua+Mineral', 'bebidas', TRUE, 300),
('Jugo de Naranja', 'Jugo natural de naranja 400ml', 10.00, 'https://placehold.co/200x200/f4a261/333?text=Jugo+Naranja', 'bebidas', TRUE, 100),
('Nachos con Queso', 'Nachos crujientes bañados en queso cheddar', 16.00, 'https://placehold.co/200x200/dda15e/333?text=Nachos', 'dulces', TRUE, 120),
('Hot Dog Clásico', 'Pan con salchicha, salsa de tomate, mostaza y mayonesa', 15.00, 'https://placehold.co/200x200/bc6c25/fff?text=Hot+Dog', 'dulces', TRUE, 90),
('M&M''s', 'Chocolates M&M''s bolsa individual', 10.00, 'https://placehold.co/200x200/6b705c/fff?text=M%26M', 'dulces', TRUE, 200),
('Dulces Surtidos', 'Bolsa de dulces variados (gominolas, caramelo)', 11.00, 'https://placehold.co/200x200/c77dff/fff?text=Dulces', 'dulces', TRUE, 150);

-- USERS (bcrypt hashes)
-- admin@cinemax.pe / Admin123!
-- juan.perez@gmail.com / User123!
-- maria.garcia@gmail.com / User123!
INSERT INTO users (name, email, password_hash, avatar_url, phone, role_id) VALUES
('Admin CineMax', 'admin@cinemax.pe', '$2b$10$PAr/IRwGa2UD/pAelWnwoOMLVpK3I2EzApEbOO9J5bh54nD0MiR7y', NULL, '999000000', 1),
('Juan Pérez', 'juan.perez@gmail.com', '$2b$10$PAr/IRwGa2UD/pAelWnwoOxNlSO6HW2ZXPdwAZz01EzWSYYymR9wq', NULL, '999111222', 2),
('María García', 'maria.garcia@gmail.com', '$2b$10$PAr/IRwGa2UD/pAelWnwoOxNlSO6HW2ZXPdwAZz01EzWSYYymR9wq', NULL, '999333444', 2);
