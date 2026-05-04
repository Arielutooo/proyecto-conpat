ALTER TABLE public.inversiones
ADD COLUMN valor_apertura BIGINT NOT NULL DEFAULT 0,
ADD COLUMN fecha_apertura DATE,
ADD COLUMN fecha_cierre DATE;

-- Asegurar que el bucket sea público para evitar el error 404
UPDATE storage.buckets SET public = true WHERE id = 'documentos_patrimoniales';
