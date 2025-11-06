-- Borra los lotes existentes (solo para desarrollo)
TRUNCATE TABLE lotes RESTART IDENTITY CASCADE;

-- Inserta 200 lotes de prueba
WITH categorias AS (
  SELECT unnest(ARRAY[
    'Frutas', 'Verduras', 'Panadería', 'Lácteos',
    'Carnes', 'Snacks', 'Dulces', 'Abarrotes',
    'Congelados', 'Bebidas'
  ]) AS categoria
),
tiendas_ids AS (
  SELECT COALESCE(MIN(id_tienda), 1) AS id_tienda FROM tiendas
),
base AS (
  SELECT
    (SELECT id_tienda FROM tiendas_ids) AS id_tienda,
    'Lote ' || gs::text || ' - ' || (SELECT categoria FROM categorias ORDER BY random() LIMIT 1) AS nombre_lote,
    (SELECT categoria FROM categorias ORDER BY random() LIMIT 1) AS categoria,
    'Productos en excelente estado, próximos a vencer.' AS descripcion,
    round((random() * 9.5 + 0.5)::numeric, 2) AS peso_qty,
    round((random() * 17000 + 3000)::numeric, 0) AS precio_original,
    NOW() + ((1 + floor(random() * 10))::text || ' days')::interval AS fecha_vencimiento,
    NOW() AS ventana_retiro_inicio,
    NOW() + ((2 + floor(random() * 4))::text || ' days')::interval AS ventana_retiro_fin,
    (ARRAY['DISPONIBLE', 'DISPONIBLE', 'RESERVADO', 'OCULTO'])[1 + floor(random() * 4)] AS estado
  FROM generate_series(1, 200) AS gs
)
INSERT INTO lotes (
  id_tienda,
  nombre_lote,
  categoria,
  descripcion,
  peso_qty,
  precio_original,
  precio_rescate,
  fecha_vencimiento,
  ventana_retiro_inicio,
  ventana_retiro_fin,
  estado
)
SELECT
  id_tienda,
  nombre_lote,
  categoria,
  descripcion,
  peso_qty,
  precio_original,
  round((precio_original * (0.3 + random() * 0.3))::numeric, 0) AS precio_rescate, -- 30–60% del original
  fecha_vencimiento,
  ventana_retiro_inicio,
  ventana_retiro_fin,
  estado
FROM base;
