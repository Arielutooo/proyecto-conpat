-- ============================================================
-- Tabla de control de intentos de login fallidos
-- ============================================================
CREATE TABLE IF NOT EXISTS "public"."login_attempts" (
  "email"         text        NOT NULL,
  "attempts"      integer     NOT NULL DEFAULT 0,
  "last_attempt"  timestamptz NOT NULL DEFAULT now(),
  "blocked_until" timestamptz,
  CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("email")
);

ALTER TABLE "public"."login_attempts" OWNER TO "postgres";

-- Acceso exclusivo vía service_role.
-- Con RLS habilitado y sin políticas, anon/authenticated no pueden acceder.
-- El service_role bypass RLS por completo.
ALTER TABLE "public"."login_attempts" ENABLE ROW LEVEL SECURITY;

-- Índice para búsquedas por blocked_until (limpieza periódica)
CREATE INDEX IF NOT EXISTS "login_attempts_blocked_until_idx"
  ON "public"."login_attempts" ("blocked_until")
  WHERE "blocked_until" IS NOT NULL;

-- Grants al service_role (anon/authenticated se mantienen bloqueados por RLS)
GRANT ALL ON TABLE "public"."login_attempts" TO "service_role";
