import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function securityLog(event: string, meta: Record<string, string | undefined>) {
  const entry = {
    ts: new Date().toISOString(),
    event,
    ip: meta.ip ?? 'unknown',
    path: meta.path,
    userId: meta.userId,
  }
  console.log('[security]', JSON.stringify(entry))
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? request.headers.get('x-real-ip') ?? undefined
  const isLoginPage = pathname === '/login'
  const isPasswordChangePage = pathname === '/cambiar-contrasena'
  const isPublicAsset = pathname.startsWith('/_next') || pathname.startsWith('/favicon')
  const mustChangePassword = user?.user_metadata?.must_change_password === true

  if (isPublicAsset) return supabaseResponse

  if (!user && !isLoginPage) {
    securityLog('unauthorized_access', { path: pathname, ip })
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Usuario con contraseña temporal: solo puede ir a /cambiar-contrasena
  if (user && mustChangePassword && !isPasswordChangePage) {
    securityLog('force_password_change', { path: pathname, ip, userId: user.id })
    const url = request.nextUrl.clone()
    url.pathname = '/cambiar-contrasena'
    return NextResponse.redirect(url)
  }

  // Usuario normal intentando acceder a /cambiar-contrasena sin necesitarlo
  if (user && !mustChangePassword && isPasswordChangePage) {
    const url = request.nextUrl.clone()
    url.pathname = '/clientes'
    return NextResponse.redirect(url)
  }

  if (user && isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/clientes'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
