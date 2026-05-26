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

export function handleActionError(error: unknown, context?: string): { error: string } {
  const label = context ? `[${context}]` : '[action]'

  if (error instanceof AuthError) {
    console.warn(`${label} AuthError: ${error.message}`)
    return { error: error.message }
  }

  console.error(`${label} Error inesperado:`, error)
  return { error: 'Error al procesar la solicitud. Intenta nuevamente.' }
}
