-- 1. Actualizar RLS de entregables_cfo
DROP POLICY IF EXISTS "e_cfo_r" ON public.entregables_cfo;
DROP POLICY IF EXISTS "e_cfo_ins" ON public.entregables_cfo;

CREATE POLICY "e_cfo_all" ON public.entregables_cfo 
FOR ALL USING (public.get_my_role() = 'cfo_externo');

-- 2. Actualizar RLS de documentos para dar permisos totales en la sección Tributario
-- Eliminar política anterior de solo lectura para evitar superposiciones (opcional, pero d_cfo_r no molesta si existe)
-- Mejor añadimos la nueva de ALL para tributario y f29
CREATE POLICY "d_cfo_all_trib" ON public.documentos 
FOR ALL USING (
  public.get_my_role() = 'cfo_externo' 
  AND categoria IN ('tributario', 'f29')
);

-- 3. Actualizar RLS de certificados_retiro_anual (que es parte del fichero Tributario)
CREATE POLICY "cra_cfo_all" ON public.certificados_retiro_anual
FOR ALL USING (public.get_my_role() = 'cfo_externo');

-- 4. Actualizar Storage (Bucket documentos_patrimoniales)
-- El rol cfo_externo pasará a poder modificar y eliminar archivos tributarios y entregables

-- Modificar la política existente de INSERT para incluir 'tributario'
DROP POLICY IF EXISTS "sto_cfo_ins" ON storage.objects;

CREATE POLICY "sto_cfo_ins_mod" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documentos_patrimoniales'
    AND public.get_my_role() = 'cfo_externo'
    AND (storage.foldername(name))[1] IN ('entregables', 'tributario')
  );

CREATE POLICY "sto_cfo_upd" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'documentos_patrimoniales'
    AND public.get_my_role() = 'cfo_externo'
    AND (storage.foldername(name))[1] IN ('entregables', 'tributario')
  );

CREATE POLICY "sto_cfo_del" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documentos_patrimoniales'
    AND public.get_my_role() = 'cfo_externo'
    AND (storage.foldername(name))[1] IN ('entregables', 'tributario')
  );
