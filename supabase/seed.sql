-- ═══════════════════════════════════════════════════════════════════
-- CONPAT CRM — Seed datos de desarrollo local
-- Credenciales: conpat.cl / admin1234 | cfo@conpat.cl / cfo12345
-- ═══════════════════════════════════════════════════════════════════


-- Clientes
INSERT INTO public.clientes (
  id, razon_social, rut, tipo_sociedad, regimen_tributario,
  representante_legal, metodo_creacion,
  conpat_factura, moneda_facturacion, cantidad_facturacion,
  tiene_nomina, emite_facturas, boletas_honorarios, sin_inversiones, cantidad_trabajadores
) VALUES
  (
    'aaaa0001-0000-0000-0000-000000000001',
    'Inversiones Los Andes SpA', '76.543.210-1', 'SpA', 'Primera Categoría',
    'Carlos Rodríguez Fuentes', 'Notaría Pública',
    true, 'UF', 8.50,
    true, true, false, false, 12
  ),
  (
    'aaaa0002-0000-0000-0000-000000000002',
    'Constructora Patagonia Ltda', '76.123.456-7', 'Ltda', 'Primera Categoría',
    'Ana María Soto Vergara', 'Escritura Pública',
    false, 'CLP', NULL,
    false, true, false, false, 0
  ),
  (
    'aaaa0003-0000-0000-0000-000000000003',
    'Holding Familiar Silva SA', '76.999.888-5', 'SA', 'Semi Integrado',
    'Roberto Silva Mora', 'Notaría Pública',
    true, 'CLP', 250000,
    true, false, true, false, 5
  );

-- Socios
INSERT INTO public.socios (id, cliente_id, nombre, rut, porcentaje_participacion) VALUES
  ('bbbb0001-0000-0000-0000-000000000001', 'aaaa0001-0000-0000-0000-000000000001', 'Carlos Rodríguez Fuentes', '12.345.678-9', 60.00),
  ('bbbb0002-0000-0000-0000-000000000002', 'aaaa0001-0000-0000-0000-000000000001', 'María Fernández López',    '18.765.432-0', 40.00),
  ('bbbb0003-0000-0000-0000-000000000003', 'aaaa0003-0000-0000-0000-000000000003', 'Roberto Silva Mora',       '10.111.222-3', 50.00),
  ('bbbb0004-0000-0000-0000-000000000004', 'aaaa0003-0000-0000-0000-000000000003', 'Carmen Silva Mora',        '10.333.444-5', 30.00),
  ('bbbb0005-0000-0000-0000-000000000005', 'aaaa0003-0000-0000-0000-000000000003', 'Diego Silva Mora',         '10.555.666-7', 20.00);

-- Inversiones (simulación CLP/USD)
INSERT INTO public.inversiones (cliente_id, categoria, tipo_inversion, descripcion, saldo_clp, saldo_usd, cantidad, es_propia, valor_uf, tiene_dfl2) VALUES
  ('aaaa0001-0000-0000-0000-000000000001', 'financiera',   'Fondo_Mutuo',  'BICE Renta Variable Nacional',     85000000, 0,     1, true, NULL,    false),
  ('aaaa0001-0000-0000-0000-000000000001', 'financiera',   'Acciones',     'Cartera Acciones BCS + ADR',       42000000, 18500, 1, true, NULL,    false),
  ('aaaa0001-0000-0000-0000-000000000001', 'inmobiliaria', 'Departamento', 'Dpto. Las Condes, Avda. Apoquindo',0,       0,     1, true, 4200.00, true),
  ('aaaa0003-0000-0000-0000-000000000003', 'financiera',   'Fondo_Mutuo',  'LarrainVial Liquidez',             120000000,45000, 1, true, NULL,    false),
  ('aaaa0003-0000-0000-0000-000000000003', 'financiera',   'Deposito_Plazo','BCI DAP 180 días',                55000000, 0,     1, true, NULL,    false),
  ('aaaa0003-0000-0000-0000-000000000003', 'inmobiliaria', 'Oficina',      'Oficina Providencia (arrendada)',  0,        0,     2, false,2800.00, false);

-- Retiros societarios (ejemplo)
INSERT INTO public.retiros_societarios (socio_id, monto, fecha) VALUES
  ('bbbb0001-0000-0000-0000-000000000001', 8500000,  '2025-03-15'),
  ('bbbb0001-0000-0000-0000-000000000001', 12000000, '2025-06-30'),
  ('bbbb0002-0000-0000-0000-000000000002', 6000000,  '2025-04-20'),
  ('bbbb0003-0000-0000-0000-000000000003', 15000000, '2025-02-28');
