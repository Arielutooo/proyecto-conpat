-- ═══════════════════════════════════════════════════════════════════
-- CONPAT CRM — Schema completo + RLS + Storage
-- ═══════════════════════════════════════════════════════════════════


-- ── Tablas ──────────────────────────────────────────────────────────

CREATE TABLE public.user_roles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role       TEXT NOT NULL CHECK (role IN ('admin','cfo_externo')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Función helper para obtener rol del usuario autenticado
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1
$$;

-- ── Tablas ──────────────────────────────────────────────────────────

CREATE TABLE public.clientes (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razon_social          TEXT NOT NULL,
  rut                   TEXT NOT NULL UNIQUE,
  tipo_sociedad         TEXT,
  regimen_tributario    TEXT,
  representante_legal   TEXT,
  metodo_creacion       TEXT,
  conpat_factura        BOOLEAN NOT NULL DEFAULT false,
  moneda_facturacion    TEXT NOT NULL DEFAULT 'CLP' CHECK (moneda_facturacion IN ('CLP','UF')),
  cantidad_facturacion  NUMERIC(14,2),
  tiene_nomina          BOOLEAN NOT NULL DEFAULT false,
  emite_facturas        BOOLEAN NOT NULL DEFAULT false,
  boletas_honorarios    BOOLEAN NOT NULL DEFAULT false,
  sin_inversiones       BOOLEAN NOT NULL DEFAULT false,
  cantidad_trabajadores INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.socios (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id               UUID REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
  nombre                   TEXT NOT NULL,
  rut                      TEXT,
  porcentaje_participacion NUMERIC(5,2),
  created_at               TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.inversiones (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id     UUID REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
  categoria      TEXT NOT NULL CHECK (categoria IN ('financiera','inmobiliaria')),
  tipo_inversion TEXT NOT NULL,
  descripcion    TEXT,
  saldo_clp      BIGINT NOT NULL DEFAULT 0,
  saldo_usd      NUMERIC(14,2) NOT NULL DEFAULT 0,
  cantidad       INTEGER NOT NULL DEFAULT 1,
  es_propia      BOOLEAN NOT NULL DEFAULT true,
  valor_uf       NUMERIC(14,2),
  tiene_dfl2     BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.retiros_societarios (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  socio_id        UUID REFERENCES public.socios(id) ON DELETE CASCADE NOT NULL,
  monto           BIGINT NOT NULL,
  fecha           DATE NOT NULL,
  comprobante_url TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.cartolas_mensuales (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id     UUID REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
  banco          TEXT NOT NULL,
  mes            INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  anio           INTEGER NOT NULL,
  archivo_url    TEXT NOT NULL,
  archivo_nombre TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.entregables_cfo (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id     UUID REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
  mes            INTEGER CHECK (mes BETWEEN 1 AND 12),
  anio           INTEGER NOT NULL,
  tipo_documento TEXT NOT NULL,
  archivo_url    TEXT NOT NULL,
  archivo_nombre TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.documentos (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id     UUID REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
  categoria      TEXT NOT NULL CHECK (categoria IN ('legal','tributario','rrhh')),
  tipo_documento TEXT NOT NULL,
  anio           INTEGER,
  archivo_url    TEXT NOT NULL,
  archivo_nombre TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.certificados_retiro_anual (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  socio_id       UUID REFERENCES public.socios(id) ON DELETE CASCADE NOT NULL,
  anio           INTEGER NOT NULL,
  archivo_url    TEXT NOT NULL,
  archivo_nombre TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row Level Security ───────────────────────────────────────────────

ALTER TABLE public.user_roles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.socios                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inversiones               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retiros_societarios       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cartolas_mensuales        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entregables_cfo           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificados_retiro_anual ENABLE ROW LEVEL SECURITY;

-- user_roles
CREATE POLICY "ur_own"   ON public.user_roles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "ur_admin" ON public.user_roles FOR ALL    USING (public.get_my_role() = 'admin');

-- clientes
CREATE POLICY "c_admin" ON public.clientes FOR ALL    USING (public.get_my_role() = 'admin');
CREATE POLICY "c_cfo_r" ON public.clientes FOR SELECT USING (public.get_my_role() = 'cfo_externo');

-- socios
CREATE POLICY "s_admin" ON public.socios FOR ALL    USING (public.get_my_role() = 'admin');
CREATE POLICY "s_cfo_r" ON public.socios FOR SELECT USING (public.get_my_role() = 'cfo_externo');

-- inversiones
CREATE POLICY "i_admin" ON public.inversiones FOR ALL    USING (public.get_my_role() = 'admin');
CREATE POLICY "i_cfo_r" ON public.inversiones FOR SELECT USING (public.get_my_role() = 'cfo_externo');

-- retiros_societarios
CREATE POLICY "r_admin" ON public.retiros_societarios FOR ALL    USING (public.get_my_role() = 'admin');
CREATE POLICY "r_cfo_r" ON public.retiros_societarios FOR SELECT USING (public.get_my_role() = 'cfo_externo');

-- cartolas_mensuales
CREATE POLICY "cm_admin" ON public.cartolas_mensuales FOR ALL    USING (public.get_my_role() = 'admin');
CREATE POLICY "cm_cfo_r" ON public.cartolas_mensuales FOR SELECT USING (public.get_my_role() = 'cfo_externo');

-- entregables_cfo
CREATE POLICY "e_admin"   ON public.entregables_cfo FOR ALL    USING  (public.get_my_role() = 'admin');
CREATE POLICY "e_cfo_r"   ON public.entregables_cfo FOR SELECT USING  (public.get_my_role() = 'cfo_externo');
CREATE POLICY "e_cfo_ins" ON public.entregables_cfo FOR INSERT WITH CHECK (public.get_my_role() = 'cfo_externo');

-- documentos
CREATE POLICY "d_admin" ON public.documentos FOR ALL    USING (public.get_my_role() = 'admin');
CREATE POLICY "d_cfo_r" ON public.documentos FOR SELECT USING (public.get_my_role() = 'cfo_externo');

-- certificados_retiro_anual
CREATE POLICY "cra_admin" ON public.certificados_retiro_anual FOR ALL    USING (public.get_my_role() = 'admin');
CREATE POLICY "cra_cfo_r" ON public.certificados_retiro_anual FOR SELECT USING (public.get_my_role() = 'cfo_externo');

-- ── Storage ──────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
  VALUES ('documentos_patrimoniales', 'documentos_patrimoniales', false)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "sto_admin" ON storage.objects
  FOR ALL USING (
    bucket_id = 'documentos_patrimoniales'
    AND public.get_my_role() = 'admin'
  );

CREATE POLICY "sto_cfo_r" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documentos_patrimoniales'
    AND public.get_my_role() = 'cfo_externo'
  );

CREATE POLICY "sto_cfo_ins" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documentos_patrimoniales'
    AND public.get_my_role() = 'cfo_externo'
    AND (storage.foldername(name))[1] = 'entregables'
  );
