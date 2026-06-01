'use server'

import { createClient } from '@supabase/supabase-js'

const MAX_ATTEMPTS  = 5
const BLOCK_MINUTES = 15

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function checkLoginAttempts(
  email: string
): Promise<{ blocked: boolean; minutesLeft?: number }> {
  try {
    const supabase = getServiceClient()
    const { data } = await supabase
      .from('login_attempts')
      .select('attempts, blocked_until')
      .eq('email', email.toLowerCase())
      .single()

    if (!data) return { blocked: false }

    if (data.blocked_until) {
      const blockedUntil = new Date(data.blocked_until).getTime()
      const now = Date.now()
      if (now < blockedUntil) {
        const minutesLeft = Math.ceil((blockedUntil - now) / 60_000)
        return { blocked: true, minutesLeft }
      }
      // Bloqueo vencido: resetear
      await supabase
        .from('login_attempts')
        .update({ attempts: 0, blocked_until: null })
        .eq('email', email.toLowerCase())
    }

    return { blocked: false }
  } catch {
    return { blocked: false } // fail open para no bloquear en errores transitorios
  }
}

export async function recordFailedAttempt(email: string): Promise<void> {
  try {
    const supabase      = getServiceClient()
    const normalizedEmail = email.toLowerCase()

    const { data } = await supabase
      .from('login_attempts')
      .select('attempts')
      .eq('email', normalizedEmail)
      .single()

    const attempts      = (data?.attempts ?? 0) + 1
    const blocked_until = attempts >= MAX_ATTEMPTS
      ? new Date(Date.now() + BLOCK_MINUTES * 60_000).toISOString()
      : null

    await supabase.from('login_attempts').upsert(
      { email: normalizedEmail, attempts, last_attempt: new Date().toISOString(), blocked_until },
      { onConflict: 'email' }
    )
  } catch {
    // fail silently — no debe romper el flujo de login
  }
}

export async function resetAttempts(email: string): Promise<void> {
  try {
    const supabase = getServiceClient()
    await supabase.from('login_attempts').delete().eq('email', email.toLowerCase())
  } catch {
    // fail silently
  }
}
