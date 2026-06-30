-- Agregar políticas de Storage para el rol master.
-- La migración 20260529 añadió el rol master a user_roles pero olvidó
-- crear las políticas correspondientes en storage.objects.
-- Sin esto, cualquier usuario con rol master no puede subir archivos.

CREATE POLICY "sto_master" ON "storage"."objects"
  USING (
    ("bucket_id" = 'documentos_patrimoniales'::text)
    AND (public.get_my_role() = 'master'::text)
  );
