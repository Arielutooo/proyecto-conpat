'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, requireAdmin } from '@/lib/actions/auth-helpers'
import { handleActionError } from '@/lib/auth'
import type { Documento, CartolaMensual, EntregableCFO, CertificadoRetiroAnual } from '@/lib/types'

type ActionResult = { error?: string; id?: string }

// Documentos — solo admin (cartolas y documentos legales/tributarios)
export async function createDocumento(data: Omit<Documento, 'id' | 'created_at'>): Promise<ActionResult> {
  try {
    await requireAuth() // RLS controla permisos por categoría (admin y cfo)
    const supabase = await createClient()
    const { data: row, error } = await supabase.from('documentos').insert(data).select('id').single()
    if (error) {
      console.error('[createDocumento] DB error:', error.message)
      return { error: 'No se pudo guardar el documento.' }
    }
    revalidatePath(`/clientes/${data.cliente_id}`)
    return { id: row.id }
  } catch (err) {
    return handleActionError(err, 'createDocumento')
  }
}

export async function deleteDocumento(id: string, clienteId: string): Promise<ActionResult> {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { error } = await supabase.from('documentos').delete().eq('id', id)
    if (error) {
      console.error('[deleteDocumento] DB error:', error.message)
      return { error: 'No se pudo eliminar el documento.' }
    }
    revalidatePath(`/clientes/${clienteId}`)
    return {}
  } catch (err) {
    return handleActionError(err, 'deleteDocumento')
  }
}

// Cartolas — solo admin
export async function createCartola(data: Omit<CartolaMensual, 'id' | 'created_at'>): Promise<ActionResult> {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { data: row, error } = await supabase.from('cartolas_mensuales').insert(data).select('id').single()
    if (error) {
      console.error('[createCartola] DB error:', error.message)
      return { error: 'No se pudo guardar la cartola.' }
    }
    revalidatePath(`/clientes/${data.cliente_id}`)
    return { id: row.id }
  } catch (err) {
    return handleActionError(err, 'createCartola')
  }
}

export async function deleteCartola(id: string, clienteId: string): Promise<ActionResult> {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { error } = await supabase.from('cartolas_mensuales').delete().eq('id', id)
    if (error) {
      console.error('[deleteCartola] DB error:', error.message)
      return { error: 'No se pudo eliminar la cartola.' }
    }
    revalidatePath(`/clientes/${clienteId}`)
    return {}
  } catch (err) {
    return handleActionError(err, 'deleteCartola')
  }
}

// Entregables CFO — accesible por admin y cfo_externo (RLS los gestiona)
export async function createEntregableCFO(data: Omit<EntregableCFO, 'id' | 'created_at'>): Promise<ActionResult> {
  try {
    await requireAuth()
    const supabase = await createClient()
    const { data: row, error } = await supabase.from('entregables_cfo').insert(data).select('id').single()
    if (error) {
      console.error('[createEntregableCFO] DB error:', error.message)
      return { error: 'No se pudo guardar el entregable.' }
    }
    revalidatePath(`/clientes/${data.cliente_id}`)
    return { id: row.id }
  } catch (err) {
    return handleActionError(err, 'createEntregableCFO')
  }
}

export async function deleteEntregableCFO(id: string, clienteId: string): Promise<ActionResult> {
  try {
    await requireAuth()
    const supabase = await createClient()
    const { error } = await supabase.from('entregables_cfo').delete().eq('id', id)
    if (error) {
      console.error('[deleteEntregableCFO] DB error:', error.message)
      return { error: 'No se pudo eliminar el entregable.' }
    }
    revalidatePath(`/clientes/${clienteId}`)
    return {}
  } catch (err) {
    return handleActionError(err, 'deleteEntregableCFO')
  }
}

export async function createCertificadoRetiro(data: Omit<CertificadoRetiroAnual, 'id' | 'created_at'>): Promise<ActionResult> {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { data: row, error } = await supabase.from('certificados_retiro_anual').insert(data).select('id').single()
    if (error) {
      console.error('[createCertificadoRetiro] DB error:', error.message)
      return { error: 'No se pudo guardar el certificado.' }
    }
    return { id: row.id }
  } catch (err) {
    return handleActionError(err, 'createCertificadoRetiro')
  }
}
