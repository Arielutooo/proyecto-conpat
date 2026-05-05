

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."get_my_role"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1
$$;


ALTER FUNCTION "public"."get_my_role"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."cartolas_mensuales" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "cliente_id" "uuid" NOT NULL,
    "banco" "text" NOT NULL,
    "mes" integer NOT NULL,
    "anio" integer NOT NULL,
    "archivo_url" "text" NOT NULL,
    "archivo_nombre" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "cartolas_mensuales_mes_check" CHECK ((("mes" >= 1) AND ("mes" <= 12)))
);


ALTER TABLE "public"."cartolas_mensuales" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."certificados_retiro_anual" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "socio_id" "uuid" NOT NULL,
    "anio" integer NOT NULL,
    "archivo_url" "text" NOT NULL,
    "archivo_nombre" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."certificados_retiro_anual" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clientes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "razon_social" "text" NOT NULL,
    "rut" "text" NOT NULL,
    "tipo_sociedad" "text",
    "regimen_tributario" "text",
    "representante_legal" "text",
    "metodo_creacion" "text",
    "conpat_factura" boolean DEFAULT false NOT NULL,
    "moneda_facturacion" "text" DEFAULT 'CLP'::"text" NOT NULL,
    "cantidad_facturacion" numeric(14,2),
    "tiene_nomina" boolean DEFAULT false NOT NULL,
    "emite_facturas" boolean DEFAULT false NOT NULL,
    "boletas_honorarios" boolean DEFAULT false NOT NULL,
    "sin_inversiones" boolean DEFAULT false NOT NULL,
    "cantidad_trabajadores" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "iniciacion_actividades" boolean DEFAULT false NOT NULL,
    "actividad_economica" "text",
    "codigo_sii" "text",
    "rentas_presuntas" boolean DEFAULT false NOT NULL,
    CONSTRAINT "clientes_moneda_facturacion_check" CHECK (("moneda_facturacion" = ANY (ARRAY['CLP'::"text", 'UF'::"text"])))
);


ALTER TABLE "public"."clientes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."documentos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "cliente_id" "uuid" NOT NULL,
    "categoria" "text" NOT NULL,
    "tipo_documento" "text" NOT NULL,
    "anio" integer,
    "archivo_url" "text" NOT NULL,
    "archivo_nombre" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "documentos_categoria_check" CHECK (("categoria" = ANY (ARRAY['legal'::"text", 'tributario'::"text", 'rrhh'::"text"])))
);


ALTER TABLE "public"."documentos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."entregables_cfo" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "cliente_id" "uuid" NOT NULL,
    "mes" integer,
    "anio" integer NOT NULL,
    "tipo_documento" "text" NOT NULL,
    "archivo_url" "text" NOT NULL,
    "archivo_nombre" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "entregables_cfo_mes_check" CHECK ((("mes" >= 1) AND ("mes" <= 12)))
);


ALTER TABLE "public"."entregables_cfo" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inversiones" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "cliente_id" "uuid" NOT NULL,
    "categoria" "text" NOT NULL,
    "tipo_inversion" "text" NOT NULL,
    "descripcion" "text",
    "saldo_clp" bigint DEFAULT 0 NOT NULL,
    "saldo_usd" numeric(14,2) DEFAULT 0 NOT NULL,
    "cantidad" integer DEFAULT 1 NOT NULL,
    "es_propia" boolean DEFAULT true NOT NULL,
    "valor_uf" numeric(14,2),
    "tiene_dfl2" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "valor_apertura" bigint DEFAULT 0 NOT NULL,
    "fecha_apertura" "date",
    "fecha_cierre" "date",
    "anio" integer DEFAULT 2025 NOT NULL,
    CONSTRAINT "inversiones_categoria_check" CHECK (("categoria" = ANY (ARRAY['financiera'::"text", 'inmobiliaria'::"text"])))
);


ALTER TABLE "public"."inversiones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."retiros_societarios" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "socio_id" "uuid" NOT NULL,
    "monto" bigint NOT NULL,
    "fecha" "date" NOT NULL,
    "comprobante_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."retiros_societarios" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."socios" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "cliente_id" "uuid" NOT NULL,
    "nombre" "text" NOT NULL,
    "rut" "text",
    "porcentaje_participacion" numeric(5,2),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."socios" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_roles_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'cfo_externo'::"text"])))
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."cartolas_mensuales"
    ADD CONSTRAINT "cartolas_mensuales_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."certificados_retiro_anual"
    ADD CONSTRAINT "certificados_retiro_anual_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clientes"
    ADD CONSTRAINT "clientes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clientes"
    ADD CONSTRAINT "clientes_rut_key" UNIQUE ("rut");



ALTER TABLE ONLY "public"."documentos"
    ADD CONSTRAINT "documentos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."entregables_cfo"
    ADD CONSTRAINT "entregables_cfo_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inversiones"
    ADD CONSTRAINT "inversiones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."retiros_societarios"
    ADD CONSTRAINT "retiros_societarios_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."socios"
    ADD CONSTRAINT "socios_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."cartolas_mensuales"
    ADD CONSTRAINT "cartolas_mensuales_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."certificados_retiro_anual"
    ADD CONSTRAINT "certificados_retiro_anual_socio_id_fkey" FOREIGN KEY ("socio_id") REFERENCES "public"."socios"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documentos"
    ADD CONSTRAINT "documentos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."entregables_cfo"
    ADD CONSTRAINT "entregables_cfo_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inversiones"
    ADD CONSTRAINT "inversiones_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."retiros_societarios"
    ADD CONSTRAINT "retiros_societarios_socio_id_fkey" FOREIGN KEY ("socio_id") REFERENCES "public"."socios"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."socios"
    ADD CONSTRAINT "socios_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "c_admin" ON "public"."clientes" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "c_cfo_r" ON "public"."clientes" FOR SELECT USING (("public"."get_my_role"() = 'cfo_externo'::"text"));



ALTER TABLE "public"."cartolas_mensuales" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."certificados_retiro_anual" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."clientes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "cm_admin" ON "public"."cartolas_mensuales" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "cm_cfo_r" ON "public"."cartolas_mensuales" FOR SELECT USING (("public"."get_my_role"() = 'cfo_externo'::"text"));



CREATE POLICY "cra_admin" ON "public"."certificados_retiro_anual" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "cra_cfo_all" ON "public"."certificados_retiro_anual" USING (("public"."get_my_role"() = 'cfo_externo'::"text"));



CREATE POLICY "cra_cfo_r" ON "public"."certificados_retiro_anual" FOR SELECT USING (("public"."get_my_role"() = 'cfo_externo'::"text"));



CREATE POLICY "d_admin" ON "public"."documentos" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "d_cfo_all_trib" ON "public"."documentos" USING ((("public"."get_my_role"() = 'cfo_externo'::"text") AND ("categoria" = ANY (ARRAY['tributario'::"text", 'f29'::"text"]))));



CREATE POLICY "d_cfo_r" ON "public"."documentos" FOR SELECT USING (("public"."get_my_role"() = 'cfo_externo'::"text"));



ALTER TABLE "public"."documentos" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "e_admin" ON "public"."entregables_cfo" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "e_cfo_all" ON "public"."entregables_cfo" USING (("public"."get_my_role"() = 'cfo_externo'::"text"));



ALTER TABLE "public"."entregables_cfo" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "i_admin" ON "public"."inversiones" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "i_cfo_r" ON "public"."inversiones" FOR SELECT USING (("public"."get_my_role"() = 'cfo_externo'::"text"));



ALTER TABLE "public"."inversiones" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "r_admin" ON "public"."retiros_societarios" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "r_cfo_r" ON "public"."retiros_societarios" FOR SELECT USING (("public"."get_my_role"() = 'cfo_externo'::"text"));



ALTER TABLE "public"."retiros_societarios" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "s_admin" ON "public"."socios" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "s_cfo_r" ON "public"."socios" FOR SELECT USING (("public"."get_my_role"() = 'cfo_externo'::"text"));



ALTER TABLE "public"."socios" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "ur_admin" ON "public"."user_roles" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "ur_own" ON "public"."user_roles" FOR SELECT USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

















































































































































































GRANT ALL ON FUNCTION "public"."get_my_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "service_role";


















GRANT ALL ON TABLE "public"."cartolas_mensuales" TO "anon";
GRANT ALL ON TABLE "public"."cartolas_mensuales" TO "authenticated";
GRANT ALL ON TABLE "public"."cartolas_mensuales" TO "service_role";



GRANT ALL ON TABLE "public"."certificados_retiro_anual" TO "anon";
GRANT ALL ON TABLE "public"."certificados_retiro_anual" TO "authenticated";
GRANT ALL ON TABLE "public"."certificados_retiro_anual" TO "service_role";



GRANT ALL ON TABLE "public"."clientes" TO "anon";
GRANT ALL ON TABLE "public"."clientes" TO "authenticated";
GRANT ALL ON TABLE "public"."clientes" TO "service_role";



GRANT ALL ON TABLE "public"."documentos" TO "anon";
GRANT ALL ON TABLE "public"."documentos" TO "authenticated";
GRANT ALL ON TABLE "public"."documentos" TO "service_role";



GRANT ALL ON TABLE "public"."entregables_cfo" TO "anon";
GRANT ALL ON TABLE "public"."entregables_cfo" TO "authenticated";
GRANT ALL ON TABLE "public"."entregables_cfo" TO "service_role";



GRANT ALL ON TABLE "public"."inversiones" TO "anon";
GRANT ALL ON TABLE "public"."inversiones" TO "authenticated";
GRANT ALL ON TABLE "public"."inversiones" TO "service_role";



GRANT ALL ON TABLE "public"."retiros_societarios" TO "anon";
GRANT ALL ON TABLE "public"."retiros_societarios" TO "authenticated";
GRANT ALL ON TABLE "public"."retiros_societarios" TO "service_role";



GRANT ALL ON TABLE "public"."socios" TO "anon";
GRANT ALL ON TABLE "public"."socios" TO "authenticated";
GRANT ALL ON TABLE "public"."socios" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";































--
-- Dumped schema changes for auth and storage
--

CREATE POLICY "sto_admin" ON "storage"."objects" USING ((("bucket_id" = 'documentos_patrimoniales'::"text") AND ("public"."get_my_role"() = 'admin'::"text")));



CREATE POLICY "sto_cfo_del" ON "storage"."objects" FOR DELETE USING ((("bucket_id" = 'documentos_patrimoniales'::"text") AND ("public"."get_my_role"() = 'cfo_externo'::"text") AND (("storage"."foldername"("name"))[1] = ANY (ARRAY['entregables'::"text", 'tributario'::"text"]))));



CREATE POLICY "sto_cfo_ins_mod" ON "storage"."objects" FOR INSERT WITH CHECK ((("bucket_id" = 'documentos_patrimoniales'::"text") AND ("public"."get_my_role"() = 'cfo_externo'::"text") AND (("storage"."foldername"("name"))[1] = ANY (ARRAY['entregables'::"text", 'tributario'::"text"]))));



CREATE POLICY "sto_cfo_r" ON "storage"."objects" FOR SELECT USING ((("bucket_id" = 'documentos_patrimoniales'::"text") AND ("public"."get_my_role"() = 'cfo_externo'::"text")));



CREATE POLICY "sto_cfo_upd" ON "storage"."objects" FOR UPDATE USING ((("bucket_id" = 'documentos_patrimoniales'::"text") AND ("public"."get_my_role"() = 'cfo_externo'::"text") AND (("storage"."foldername"("name"))[1] = ANY (ARRAY['entregables'::"text", 'tributario'::"text"]))));



