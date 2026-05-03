import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 72, fontWeight: 700, color: '#e2e8f0', fontFamily: "'DM Serif Display', serif", lineHeight: 1 }}>404</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', marginTop: 16 }}>Página no encontrada</div>
        <div style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>La ruta solicitada no existe en CONPAT.</div>
        <Link href="/" style={{ display: 'inline-flex', marginTop: 24, padding: '10px 24px', background: 'oklch(0.55 0.18 245)', color: 'white', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
