// Tipos derivados del schema de Supabase (supabase/migrations/20240101000000_initial.sql)

export type Role = 'admin' | 'cfo_externo'

export interface UserRole {
  id: string
  user_id: string
  role: Role
  created_at: string
}

export interface Cliente {
  id: string
  razon_social: string
  rut: string
  tipo_sociedad: string | null
  regimen_tributario: string | null
  representante_legal: string | null
  metodo_creacion: string | null
  conpat_factura: boolean
  moneda_facturacion: 'CLP' | 'UF'
  cantidad_facturacion: number | null
  tiene_nomina: boolean
  emite_facturas: boolean
  boletas_honorarios: boolean
  sin_inversiones: boolean
  cantidad_trabajadores: number
  created_at: string
}

export interface Socio {
  id: string
  cliente_id: string
  nombre: string
  rut: string | null
  porcentaje_participacion: number | null
  created_at: string
}

export interface Inversion {
  id: string
  cliente_id: string
  categoria: 'financiera' | 'inmobiliaria'
  tipo_inversion: string
  descripcion: string | null
  saldo_clp: number
  saldo_usd: number
  cantidad: number
  es_propia: boolean
  valor_uf: number | null
  tiene_dfl2: boolean
  created_at: string
}

export interface RetiroSocietario {
  id: string
  socio_id: string
  monto: number
  fecha: string
  comprobante_url: string | null
  created_at: string
}

export interface CartolaMensual {
  id: string
  cliente_id: string
  banco: string
  mes: number
  anio: number
  archivo_url: string
  archivo_nombre: string | null
  created_at: string
}

export interface EntregableCFO {
  id: string
  cliente_id: string
  mes: number | null
  anio: number
  tipo_documento: string
  archivo_url: string
  archivo_nombre: string | null
  created_at: string
}

export interface Documento {
  id: string
  cliente_id: string
  categoria: 'legal' | 'tributario' | 'rrhh'
  tipo_documento: string
  anio: number | null
  archivo_url: string
  archivo_nombre: string | null
  created_at: string
}

export interface CertificadoRetiroAnual {
  id: string
  socio_id: string
  anio: number
  archivo_url: string
  archivo_nombre: string | null
  created_at: string
}

export interface SocioConRelaciones extends Socio {
  retiros: RetiroSocietario[]
  certificados: CertificadoRetiroAnual[]
}

export interface ClienteConRelaciones extends Cliente {
  socios: SocioConRelaciones[]
  inversiones: Inversion[]
  cartolas: CartolaMensual[]
  documentos: Documento[]
  entregables: EntregableCFO[]
}

export interface ClienteConStats extends Cliente {
  socios_count: number
  inversiones_count: number
  retiros_mes: number
  entregables_count: number
}
