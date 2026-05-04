import Link from 'next/link'

export function NuevoClienteBtn() {
  return (
    <Link
      href="/clientes/nuevo"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '9px 18px', borderRadius: 8,
        background: 'oklch(0.55 0.18 245)', color: 'white',
        fontSize: 13, fontWeight: 600, textDecoration: 'none',
        boxShadow: '0 1px 3px oklch(0.55 0.18 245 / 0.4)',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
      + Nuevo Cliente
    </Link>
  )
}
