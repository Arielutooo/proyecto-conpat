'use server'

import { createClient } from '@/lib/supabase/server'
import type { Role } from '@/lib/types'

export class AuthError extends Error {
  readonly statusCode: number
  constructor(message = 'No autorizado', statusCode = 401) {
    super(message)
    this.name = 'AuthError'
    this.statusCode = statusCode
  }
}

export interface AuthContext {
  userId: string
  role: Role
}

/**
 * Verifica que hay una sesión activa. Lanza AuthError si no hay usuario.
 * Usar al inicio de cualquier Server Action que requiera autenticación.
 */
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

/**
 * Verifica que el usuario es administrador. Lanza AuthError si no tiene el rol.
 * Usar en acciones exclusivas de admin (crear/eliminar clientes, socios, etc.).
 */
export async function requireAdmin(): Promise<AuthContext> {
  const ctx = await requireAuth()
  if (ctx.role !== 'admin') {
    throw new AuthError('Se requiere rol de administrador', 403)
  }
  return ctx
}

/**
 * Convierte cualquier error en un resultado genérico para el cliente,
 * sin exponer detalles internos. Loguea el error real en el servidor.
 */
export function handleActionError(error: unknown, context?: string): { error: string } {
  const label = context ? `[${context}]` : '[action]'

  if (error instanceof AuthError) {
    console.warn(`${label} AuthError: ${error.message}`)
    return { error: error.message }
  }

  console.error(`${label} Error inesperado:`, error)
  return { error: 'Error al procesar la solicitud. Intenta nuevamente.' }
}
