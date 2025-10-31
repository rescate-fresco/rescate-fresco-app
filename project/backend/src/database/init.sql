-- Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contrasena_hash TEXT NOT NULL,
    rol VARCHAR(20) CHECK (rol IN ('tienda', 'consumidor', 'admin')) NOT NULL,
    direccion_usuario TEXT,
    ubicacion_usuario POINT,
    tienda BOOLEAN DEFAULT FALSE
);

-- Tiendas
CREATE TABLE IF NOT EXISTS tiendas (
    id_tienda SERIAL PRIMARY KEY,
    id_usuario INT UNIQUE REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    nombre_tienda VARCHAR(100) NOT NULL,
    telefono_tienda VARCHAR(20),
    direccion_tienda TEXT,
    ubicacion_tienda POINT
);

-- Lotes
CREATE TABLE IF NOT EXISTS lotes (
    id_lote SERIAL PRIMARY KEY,
    id_tienda INT REFERENCES tiendas(id_tienda) ON DELETE CASCADE,
    nombre_lote VARCHAR(100) NOT NULL,
    categoria VARCHAR(50),
    descripcion TEXT,
    peso_qty NUMERIC(10,2),
    precio_original NUMERIC(10,2) NOT NULL,
    precio_rescate NUMERIC(10,2) NOT NULL CHECK (precio_rescate < precio_original),
    fecha_vencimiento TIMESTAMP NOT NULL,
    ventana_retiro_inicio TIMESTAMP NOT NULL,
    ventana_retiro_fin TIMESTAMP NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('DISPONIBLE','NO DISPONIBLE','CANCELADO','RESERVADO','OCULTO', 'ELIMINADO')) DEFAULT 'DISPONIBLE',
    reserva_expires_at TIMESTAMP WITH TIME ZONE,
    reserva_user_id INT NULL REFERENCES usuarios(id_usuario)
);

-- Imágenes de Lotes
CREATE TABLE IF NOT EXISTS imagenes_lotes (
    id_imagen SERIAL PRIMARY KEY,
    id_lote INT REFERENCES lotes(id_lote) ON DELETE CASCADE,
    url_imagen TEXT NOT NULL
);

-- Reservas
CREATE TABLE IF NOT EXISTS reservas (
    id_reserva SERIAL PRIMARY KEY,
    id_lote INT REFERENCES lotes(id_lote) ON DELETE CASCADE,
    id_usuario INT REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    fecha_reserva TIMESTAMP DEFAULT NOW(),
    estado VARCHAR(20) CHECK (estado IN ('PENDIENTE','CONFIRMADA','CANCELADA','RETIRADA')) DEFAULT 'PENDIENTE',
    pin VARCHAR(50)
);

-- Pagos
CREATE TABLE IF NOT EXISTS pagos (
    id_pago SERIAL PRIMARY KEY,
    id_reserva INT REFERENCES reservas(id_reserva) ON DELETE CASCADE,
    proveedor VARCHAR(50) NOT NULL,
    monto NUMERIC(10,2) NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('PENDIENTE','APROBADO','RECHAZADO')) DEFAULT 'PENDIENTE',
    fecha_pago TIMESTAMP DEFAULT NOW()
);

-- Notificaciones (opcional)
CREATE TABLE IF NOT EXISTS notificaciones (
    id_notif SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(50),
    fecha_envio TIMESTAMP DEFAULT NOW()
);


ALTER TABLE lotes
ADD COLUMN lotes_search_tsv tsvector;
CREATE OR REPLACE FUNCTION actualizar_lotes_tsv() RETURNS trigger AS $$
BEGIN
    NEW.lotes_search_tsv :=
        setweight(to_tsvector('spanish', coalesce(NEW.nombre_lote, '')), 'A') ||
        setweight(to_tsvector('spanish', coalesce(NEW.descripcion, '')), 'B') ||
        setweight(to_tsvector('spanish', coalesce(NEW.categoria, '')), 'C');
    RETURN NEW;
END
$$ LANGUAGE plpgsql;
CREATE TRIGGER tgr_lotes_search_update
BEFORE INSERT OR UPDATE ON lotes
FOR EACH ROW EXECUTE FUNCTION actualizar_lotes_tsv();
CREATE INDEX lotes_tsv_idx ON lotes USING GIN (lotes_search_tsv);
