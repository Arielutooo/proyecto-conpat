/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // A02: Impide que la app sea embebida en iframes (clickjacking)
          { key: 'X-Frame-Options', value: 'DENY' },
          // A02: Previene MIME type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // A02: Controla el referrer enviado en requests
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // A02: Desactiva APIs de hardware no utilizadas
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
          // A04: Fuerza HTTPS por 1 año (solo efectivo en producción con HTTPS)
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          // A02: Content Security Policy — permite Supabase y recursos propios
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Supabase API y Auth
              `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''} wss://*.supabase.co https://*.supabase.co`,
              // Scripts: solo propios + Next.js inline (necesario para HMR en dev)
              "script-src 'self' 'unsafe-inline'",
              // Estilos: inline necesario para Tailwind/styled-jsx
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Fuentes
              "font-src 'self' https://fonts.gstatic.com",
              // Imágenes: datos y blob para uploads
              "img-src 'self' data: blob: https://*.supabase.co",
              // Formularios: solo submit a mismo origen
              "form-action 'self'",
              // Frames
              "frame-ancestors 'none'",
              // Base URI
              "base-uri 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
