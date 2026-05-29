/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development'

const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: process.cwd(),
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // En dev se agrega ws://localhost para HMR y unsafe-eval para Fast Refresh
              isDev
                ? `connect-src 'self' ws://localhost:* ${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''} wss://*.supabase.co https://*.supabase.co`
                : `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''} wss://*.supabase.co https://*.supabase.co`,
              isDev
                ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
                : "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.supabase.co",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
