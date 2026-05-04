ALTER TABLE public.clientes
ADD COLUMN iniciacion_actividades BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN actividad_economica TEXT,
ADD COLUMN codigo_sii TEXT,
ADD COLUMN rentas_presuntas BOOLEAN NOT NULL DEFAULT false;
