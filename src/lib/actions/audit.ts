'use server'

import { createClient } from '@/lib/supabase/server'

interface AuditEntry {
  action: string
  description: string
  entity_type: string
  entity_id?: string | null
  empresa?: string | null
  metadata?: Record<string, unknown> | null
}

export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('audit_log').insert({
      user_id:     user.id,
      user_email:  user.email ?? 'desconocido',
      action:      entry.action,
      description: entry.description,
      entity_type: entry.entity_type,
      entity_id:   entry.entity_id ?? null,
      metadata:    {
        ...(entry.empresa ? { empresa: entry.empresa } : {}),
        ...(entry.metadata ?? {}),
      },
    })
  } catch {
    // El logging nunca debe interrumpir la acción principal
  }
}
