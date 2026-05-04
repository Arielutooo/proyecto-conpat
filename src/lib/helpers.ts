export const formatCLP = (n: number): string =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

export const formatUSD = (n: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export const BANCOS = [
  'Banco de Chile', 'BCI', 'Santander', 'Scotiabank', 'Itaú',
  'BICE', 'Security', 'Estado', 'Falabella', 'Ripley', 'Otro',
]

export const TIPO_SOCIEDAD_OPTIONS = ['SpA', 'Ltda', 'EIRL', 'SA', 'EU', 'Fundación']

export const REGIMEN_OPTIONS = ['Primera Categoría', 'Segunda Categoría', 'Semi Integrado', 'Atribuido', 'Renta Presunta']

export const TIPO_INVERSION_LABELS: Record<string, string> = {
  Fondo_Mutuo: 'Fondo Mutuo',
  Acciones: 'Acciones',
  Deposito_Plazo: 'Depósito a Plazo',
  Bonos: 'Bonos',
  Otro: 'Otro',
  Departamento: 'Departamento',
  Casa: 'Casa',
  Oficina: 'Oficina',
  Local: 'Local Comercial',
}

export const DOCS_LEGALES = [
  { key: 'escritura',      label: 'Escritura Social',          obligatorio: true  },
  { key: 'constitucion',   label: 'Constitución',              obligatorio: true  },
  { key: 'extracto',       label: 'Extracto C.B.',             obligatorio: true  },
  { key: 'patente',        label: 'Patente Comercial',         obligatorio: false },
  { key: 'modificaciones', label: 'Modificaciones de Acta',    obligatorio: false },
  { key: 'cedulas',        label: 'Cédulas Representante',     obligatorio: false },
  { key: 'poderes',        label: 'Poderes Notariales',        obligatorio: false },
]

export const DOCS_TRIBUTARIOS = [
  { key: 'balance',         label: 'Balance Tributario' },
  { key: 'rli',             label: 'Renta Líquida Imponible (RLI)' },
  { key: 'capital_propio',  label: 'Capital Propio Tributario' },
  { key: 'libro_mayor',     label: 'Libro Mayor' },
]

export const DOCS_RRHH = [
  { key: 'contratos',      label: 'Contratos de Trabajo' },
  { key: 'liquidaciones',  label: 'Liquidaciones de Sueldo' },
]

export const TIPO_ENTREGABLE_OPTIONS = [
  'Informe Patrimonial', 'Análisis de Inversiones', 'Proyección Tributaria',
  'Resumen Retiros', 'Otro',
]

export const getSociedadColor = (tipo: string | null): string => {
  const map: Record<string, string> = {
    SpA: 'blue', Ltda: 'purple', EIRL: 'amber', SA: 'indigo', EU: 'green', 'Fundación': 'slate',
  }
  return map[tipo ?? ''] ?? 'slate'
}

export const TIPO_CAMBIO_USD_CLP = 920
