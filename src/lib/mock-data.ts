import type { Cliente } from './types'

export const MOCK_CLIENTES: Cliente[] = [
  {
    id: '1',
    razon_social: 'Inversiones del Sur SpA',
    rut: '76.123.456-7',
    tipo_sociedad: 'SpA',
    regimen_tributario: '14A Semi-Integrado',
    tiene_nomina: true,
    emite_facturas: true,
    boletas_honorarios: false,
    created_at: '2024-01-15',
    socios: [
      { id: 's1', nombre: 'Rodrigo Vargas M.', rut: '12.345.678-9', porcentaje_participacion: 60 },
      { id: 's2', nombre: 'Catalina Soto P.', rut: '13.456.789-0', porcentaje_participacion: 40 },
    ],
    inversiones: [
      { id: 'i1', tipo_inversion: 'Fondo_Mutuo', descripcion: 'BCI Asset Management · Renta Fija', ingreso_mensual_asociado: 850000 },
      { id: 'i2', tipo_inversion: 'Inmueble_Arrendado', descripcion: 'Oficina Providencia 480m²', ingreso_mensual_asociado: 1200000 },
    ],
    retiros: [
      { id: 'r1', socio_id: 's1', socio_nombre: 'Rodrigo Vargas M.', monto: 3500000, fecha: '2025-01-15', comprobante_url: 'comprobante_r1.pdf' },
      { id: 'r2', socio_id: 's2', socio_nombre: 'Catalina Soto P.', monto: 2200000, fecha: '2025-01-20', comprobante_url: 'comprobante_r2.pdf' },
    ],
    cartolas: [{ id: 'c1', mes: 1, anio: 2025, archivo_url: 'cartola_enero_2025.pdf' }],
    entregables: [
      { id: 'e1', mes: 12, anio: 2024, tipo_documento: 'Balance', archivo_url: 'balance_dic2024.pdf', created_at: '2025-01-10' },
      { id: 'e2', mes: 1, anio: 2025, tipo_documento: 'F29', archivo_url: 'f29_ene2025.pdf', created_at: '2025-02-05' },
    ],
  },
  {
    id: '2',
    razon_social: 'Constructora Andina Ltda',
    rut: '77.654.321-K',
    tipo_sociedad: 'Ltda',
    regimen_tributario: '14D Transparente',
    tiene_nomina: true,
    emite_facturas: true,
    boletas_honorarios: true,
    created_at: '2024-03-22',
    socios: [
      { id: 's3', nombre: 'Felipe Morales R.', rut: '14.567.890-1', porcentaje_participacion: 50 },
      { id: 's4', nombre: 'Andrea Muñoz L.', rut: '15.678.901-2', porcentaje_participacion: 30 },
      { id: 's5', nombre: 'Inversiones FM SpA', rut: '76.987.654-3', porcentaje_participacion: 20 },
    ],
    inversiones: [
      { id: 'i3', tipo_inversion: 'Inmueble_Propio', descripcion: 'Bodega industrial Quilicura 2.400m²', ingreso_mensual_asociado: 0 },
      { id: 'i4', tipo_inversion: 'Acciones', descripcion: 'CMPC, Falabella, Banco de Chile', ingreso_mensual_asociado: 320000 },
    ],
    retiros: [],
    cartolas: [],
    entregables: [],
  },
  {
    id: '3',
    razon_social: 'Agrícola Los Robles EIRL',
    rut: '78.111.222-3',
    tipo_sociedad: 'EIRL',
    regimen_tributario: '14A Semi-Integrado',
    tiene_nomina: false,
    emite_facturas: true,
    boletas_honorarios: false,
    created_at: '2024-06-10',
    socios: [
      { id: 's6', nombre: 'Ignacio Pereira B.', rut: '16.789.012-3', porcentaje_participacion: 100 },
    ],
    inversiones: [
      { id: 'i5', tipo_inversion: 'Fondo_Mutuo', descripcion: 'Santander AM · Renta Variable', ingreso_mensual_asociado: 410000 },
    ],
    retiros: [
      { id: 'r3', socio_id: 's6', socio_nombre: 'Ignacio Pereira B.', monto: 4800000, fecha: '2025-01-08', comprobante_url: 'comprobante_r3.pdf' },
    ],
    cartolas: [{ id: 'c2', mes: 1, anio: 2025, archivo_url: 'cartola_enero_2025.pdf' }],
    entregables: [
      { id: 'e3', mes: 1, anio: 2025, tipo_documento: 'Informe_Contable', archivo_url: 'informe_ene2025.pdf', created_at: '2025-02-08' },
    ],
  },
  {
    id: '4',
    razon_social: 'Tech Ventures SpA',
    rut: '76.500.100-5',
    tipo_sociedad: 'SpA',
    regimen_tributario: '14A Semi-Integrado',
    tiene_nomina: true,
    emite_facturas: true,
    boletas_honorarios: true,
    created_at: '2024-09-01',
    socios: [
      { id: 's7', nombre: 'Valentina Cruz H.', rut: '17.890.123-4', porcentaje_participacion: 70 },
      { id: 's8', nombre: 'Matías Ibáñez O.', rut: '18.901.234-5', porcentaje_participacion: 30 },
    ],
    inversiones: [
      { id: 'i6', tipo_inversion: 'Acciones', descripcion: 'Portfolio NYSE: AAPL, MSFT, NVDA', ingreso_mensual_asociado: 620000 },
    ],
    retiros: [],
    cartolas: [],
    entregables: [],
  },
]
