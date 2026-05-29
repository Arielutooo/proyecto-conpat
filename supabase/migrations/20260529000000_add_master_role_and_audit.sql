-- ============================================================
-- 1. Ampliar check constraint de user_roles para incluir 'master'
-- ============================================================
ALTER TABLE "public"."user_roles"
  DROP CONSTRAINT "user_roles_role_check";

ALTER TABLE "public"."user_roles"
  ADD CONSTRAINT "user_roles_role_check"
    CHECK (role = ANY (ARRAY['admin'::text, 'cfo_externo'::text, 'master'::text]));


-- ============================================================
-- 2. Tabla audit_log
-- ============================================================
CREATE TABLE IF NOT EXISTS "public"."audit_log" (
  "id"           uuid        NOT NULL DEFAULT gen_random_uuid(),
  "user_id"      uuid        NOT NULL REFERENCES "auth"."users"("id") ON DELETE SET NULL,
  "user_email"   text        NOT NULL,
  "action"       text        NOT NULL,
  "description"  text        NOT NULL,
  "entity_type"  text        NOT NULL,
  "entity_id"    uuid,
  "metadata"     jsonb,
  "created_at"   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "public"."audit_log" OWNER TO "postgres";

-- Índices para las consultas más comunes
CREATE INDEX IF NOT EXISTS "audit_log_created_at_idx"  ON "public"."audit_log" ("created_at" DESC);
CREATE INDEX IF NOT EXISTS "audit_log_entity_type_idx" ON "public"."audit_log" ("entity_type");
CREATE INDEX IF NOT EXISTS "audit_log_user_id_idx"     ON "public"."audit_log" ("user_id");


-- ============================================================
-- 3. Row Level Security
-- ============================================================
ALTER TABLE "public"."audit_log" ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede insertar (lo controlan las server actions)
CREATE POLICY "al_authenticated_insert" ON "public"."audit_log"
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Solo el rol master puede leer
CREATE POLICY "al_master_select" ON "public"."audit_log"
  FOR SELECT
  USING (public.get_my_role() = 'master');

-- Nadie puede actualizar ni eliminar registros de auditoría
-- (no se crean políticas UPDATE/DELETE → bloqueado por defecto con RLS)


-- ============================================================
-- 4. Grants
-- ============================================================
GRANT ALL ON TABLE "public"."audit_log" TO "anon";
GRANT ALL ON TABLE "public"."audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_log" TO "service_role";
