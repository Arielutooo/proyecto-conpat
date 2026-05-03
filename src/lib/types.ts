export type Role = 'admin' | 'cfo_externo'

export type TipoSociedad = 'SpA' | 'Ltda' | 'EIRL' | 'SA' | 'EU' | 'Fundación'

export type TipoInversion =
  | 'Fondo_Mutuo'
  | 'Inmueble_Propio'
  | 'Inmueble_Arrendado'
  | 'Acciones'
  | 'Bonos'
  | 'Deposito_Plazo'
  | 'Otro'

export type TipoDocumento = 'Balance' | 'F29' | 'Informe_Contable' | 'Pago_IVA'

export interface Socio {
  id: string
  nombre: string
  rut: string
  porcentaje_participacion: number
}

export interface Inversion {
  id: string
  tipo_inversion: TipoInversion
  descripcion: string
  ingreso_mensual_asociado: number
  aum_apertura?: number
  aum_cierre?: number
  fecha_apertura?: string
  fecha_cierre?: string
}

export interface Retiro {
  id: string
  socio_id: string
  socio_nombre: string
  monto: number
  fecha: string
  comprobante_url?: string
}

export interface Cartola {
  id: string
  mes: number
  anio: number
  archivo_url: string
}

export interface Entregable {
  id: string
  mes: number
  anio: number
  tipo_documento: TipoDocumento
  archivo_url: string
  created_at: string
}

export interface Cliente {
  id: string
  razon_social: string
  rut: string
  tipo_sociedad: TipoSociedad
  regimen_tributario: string
  tiene_nomina: boolean
  emite_facturas: boolean
  boletas_honorarios: boolean
  created_at: string
  socios: Socio[]
  inversiones: Inversion[]
  retiros: Retiro[]
  cartolas: Cartola[]
  entregables: Entregable[]
  // Campos opcionales del wizard
  actividad_economica?: string
  codigo_sii?: string
  iniciacion_actividades?: boolean
  rentas_presuntas?: boolean
  factura_conpat?: boolean
  factura_moneda?: string
  factura_monto?: string
  sin_inversiones?: boolean
  created_by?: string
  created_at_full?: string
}

export interface Tweaks {
  accentColor: string
  sidebarBg: string
  density: string
}

export interface AppContextType {
  setView: (view: string) => void
  setRole: (role: Role | null) => void
  tweaks: Tweaks
  userName: string
}
