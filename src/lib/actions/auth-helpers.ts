'use server'

import { createClient } from '@/lib/supabase/server'
import { AuthError } from '@/lib/auth'
import type { AuthContext } from '@/lib/auth'
import type { Role } from '@/lib/types'

export async function requireAuth(): Promise<AuthContext> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new AuthError('Sesión no válida o expirada')
  }

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  return {
    userId: user.id,
    role: (roleRow?.role ?? 'cfo_externo') as Role,
  }
}

export async function requireAdmin(): Promise<AuthContext> {
  const ctx = await requireAuth()
  if (ctx.role !== 'admin') {
    throw new AuthError('Se requiere rol de administrador', 403)
  }
  return ctx
}
