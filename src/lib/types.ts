// Tipos derivados del schema de Supabase (supabase/migrations/20240101000000_initial.sql)

export type Role = 'admin' | 'cfo_externo' | 'master'

export interface AuditLog {
  id: string
  user_id: string
  user_email: string
  action: string
  description: string
  entity_type: string
  entity_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

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
  iniciacion_actividades: boolean
  actividad_economica: string | null
  codigo_sii: string | null
  rentas_presuntas: boolean
  anio_inicio?: number | null
  fecha_constitucion?: string | null
  sin_rrhh?: boolean | null
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
  valor_apertura: number
  fecha_apertura: string | null
  fecha_cierre: string | null
  anio: number
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
  valid_from?: number | null
  valid_until?: number | null
  nota?: string | null
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

export interface CartolaInversion {
  id: string
  inversion_id: string
  cliente_id: string
  anio: number
  mes: number
  comentario: string | null
  archivo_url: string
  archivo_nombre: string
  created_at: string
}

export interface ClienteConRelaciones extends Cliente {
  socios: SocioConRelaciones[]
  inversiones: Inversion[]
  cartolas: CartolaMensual[]
  documentos: Documento[]
  entregables: EntregableCFO[]
  cartolas_inversion: CartolaInversion[]
}

export interface ClienteConStats extends Cliente {
  socios_count: number
  inversiones_count: number
  retiros_mes: number
  entregables_count: number
}
