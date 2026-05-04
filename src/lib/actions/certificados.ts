'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { CertificadoRetiroAnual } from '@/lib/types'

type ActionResult = { error?: string; id?: string }

export async function createCertificado(data: Omit<CertificadoRetiroAnual, 'id' | 'created_at'>): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: row, error } = await supabase.from('certificados_retiro_anual').insert(data).select('id').single()
  if (error) return { error: error.message }
  revalidatePath('/clientes/[id]', 'page')
  return { id: row.id }
}

export async function deleteCertificado(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('certificados_retiro_anual').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/clientes/[id]', 'page')
  return {}
}
