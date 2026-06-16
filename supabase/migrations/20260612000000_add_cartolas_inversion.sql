CREATE TABLE public.cartolas_inversion (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  inversion_id uuid       REFERENCES public.inversiones(id) ON DELETE CASCADE,
  cliente_id  uuid        REFERENCES public.clientes(id)   ON DELETE CASCADE,
  anio        integer     NOT NULL,
  mes         integer     NOT NULL CHECK (mes BETWEEN 1 AND 12),
  comentario  text,
  archivo_url text        NOT NULL,
  archivo_nombre text     NOT NULL,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.cartolas_inversion ENABLE ROW LEVEL SECURITY;

-- Admin: acceso completo
CREATE POLICY "ci_admin"  ON public.cartolas_inversion
  USING (public.get_my_role() = 'admin');

-- Master: acceso completo
CREATE POLICY "ci_master" ON public.cartolas_inversion
  USING (public.get_my_role() = 'master');

-- CFO externo: solo lectura
CREATE POLICY "ci_cfo_r"  ON public.cartolas_inversion
  FOR SELECT USING (public.get_my_role() = 'cfo_externo');

GRANT ALL ON TABLE public.cartolas_inversion TO anon;
GRANT ALL ON TABLE public.cartolas_inversion TO authenticated;
GRANT ALL ON TABLE public.cartolas_inversion TO service_role;
