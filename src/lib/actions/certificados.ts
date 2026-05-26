'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/actions/auth-helpers'
import { handleActionError } from '@/lib/auth'
import type { CertificadoRetiroAnual } from '@/lib/types'

type ActionResult = { error?: string; id?: string }

export async function createCertificado(data: Omit<CertificadoRetiroAnual, 'id' | 'created_at'>): Promise<ActionResult> {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { data: row, error } = await supabase.from('certificados_retiro_anual').insert(data).select('id').single()
    if (error) {
      console.error('[createCertificado] DB error:', error.message)
      return { error: 'No se pudo guardar el certificado.' }
    }
    revalidatePath('/clientes/[id]', 'page')
    return { id: row.id }
  } catch (err) {
    return handleActionError(err, 'createCertificado')
  }
}

export async function deleteCertificado(id: string): Promise<ActionResult> {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { error } = await supabase.from('certificados_retiro_anual').delete().eq('id', id)
    if (error) {
      console.error('[deleteCertificado] DB error:', error.message)
      return { error: 'No se pudo eliminar el certificado.' }
    }
    revalidatePath('/clientes/[id]', 'page')
    return {}
  } catch (err) {
    return handleActionError(err, 'deleteCertificado')
  }
}
