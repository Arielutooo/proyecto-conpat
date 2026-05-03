import type { TipoSociedad } from './types'

export const formatCLP = (n: number): string =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(n)

export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export const TIPO_DOC_LABELS: Record<string, string> = {
  Balance: 'Balance',
  F29: 'Form. 29',
  Informe_Contable: 'Inf. Contable',
  Pago_IVA: 'Pago IVA',
}

export const TIPO_INV_LABELS: Record<string, string> = {
  Fondo_Mutuo: 'Fondo Mutuo',
  Inmueble_Propio: 'Inmueble Propio',
  Inmueble_Arrendado: 'Inmueble Arrendado',
  Acciones: 'Acciones',
  Bonos: 'Bonos',
  Deposito_Plazo: 'Depósito a Plazo',
  Otro: 'Otro',
}

export const getSociedadColor = (tipo: TipoSociedad): string =>
  ({ SpA: 'blue', Ltda: 'purple', EIRL: 'amber', SA: 'indigo', EU: 'green', 'Fundación': 'slate' } as Record<string, string>)[tipo] ?? 'slate'
