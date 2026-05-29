'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, requireAdmin } from '@/lib/actions/auth-helpers'
import { handleActionError } from '@/lib/auth'
import { logAudit } from '@/lib/actions/audit'
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
    await logAudit({
      action:      'documento_subido',
      description: `Documento '${data.tipo_documento}' subido (categoría: ${data.categoria})`,
      entity_type: 'documento',
      entity_id:   row.id,
      metadata:    { cliente_id: data.cliente_id, categoria: data.categoria, anio: data.anio },
    })
    return { id: row.id }
  } catch (err) {
    return handleActionError(err, 'createDocumento')
  }
}

export async function deleteDocumento(id: string, clienteId: string): Promise<ActionResult> {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { data: prev } = await supabase.from('documentos').select('tipo_documento, categoria').eq('id', id).single()
    const { error } = await supabase.from('documentos').delete().eq('id', id)
    if (error) {
      console.error('[deleteDocumento] DB error:', error.message)
      return { error: 'No se pudo eliminar el documento.' }
    }
    revalidatePath(`/clientes/${clienteId}`)
    await logAudit({
      action:      'documento_eliminado',
      description: `Documento '${prev?.tipo_documento ?? id}' eliminado (categoría: ${prev?.categoria ?? '?'})`,
      entity_type: 'documento',
      entity_id:   id,
      metadata:    { cliente_id: clienteId },
    })
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
    await logAudit({
      action:      'cartola_subida',
      description: `Cartola bancaria subida (${data.banco}, ${data.mes}/${data.anio})`,
      entity_type: 'cartola',
      entity_id:   row.id,
      metadata:    { cliente_id: data.cliente_id, banco: data.banco, mes: data.mes, anio: data.anio },
    })
    return { id: row.id }
  } catch (err) {
    return handleActionError(err, 'createCartola')
  }
}

export async function deleteCartola(id: string, clienteId: string): Promise<ActionResult> {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { data: prev } = await supabase.from('cartolas_mensuales').select('banco, mes, anio').eq('id', id).single()
    const { error } = await supabase.from('cartolas_mensuales').delete().eq('id', id)
    if (error) {
      console.error('[deleteCartola] DB error:', error.message)
      return { error: 'No se pudo eliminar la cartola.' }
    }
    revalidatePath(`/clientes/${clienteId}`)
    await logAudit({
      action:      'cartola_eliminada',
      description: `Cartola bancaria eliminada (${prev?.banco ?? '?'}, ${prev?.mes ?? '?'}/${prev?.anio ?? '?'})`,
      entity_type: 'cartola',
      entity_id:   id,
      metadata:    { cliente_id: clienteId },
    })
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
    await logAudit({
      action:      'entregable_subido',
      description: `Entregable CFO '${data.tipo_documento}' subido (${data.mes ? `${data.mes}/` : ''}${data.anio})`,
      entity_type: 'entregable',
      entity_id:   row.id,
      metadata:    { cliente_id: data.cliente_id, tipo: data.tipo_documento, anio: data.anio },
    })
    return { id: row.id }
  } catch (err) {
    return handleActionError(err, 'createEntregableCFO')
  }
}

export async function deleteEntregableCFO(id: string, clienteId: string): Promise<ActionResult> {
  try {
    await requireAuth()
    const supabase = await createClient()
    const { data: prev } = await supabase.from('entregables_cfo').select('tipo_documento').eq('id', id).single()
    const { error } = await supabase.from('entregables_cfo').delete().eq('id', id)
    if (error) {
      console.error('[deleteEntregableCFO] DB error:', error.message)
      return { error: 'No se pudo eliminar el entregable.' }
    }
    revalidatePath(`/clientes/${clienteId}`)
    await logAudit({
      action:      'entregable_eliminado',
      description: `Entregable CFO '${prev?.tipo_documento ?? id}' eliminado`,
      entity_type: 'entregable',
      entity_id:   id,
      metadata:    { cliente_id: clienteId },
    })
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
    await logAudit({
      action:      'certificado_retiro_subido',
      description: `Certificado de retiro anual subido (socio ${data.socio_id}, año ${data.anio})`,
      entity_type: 'certificado_retiro',
      entity_id:   row.id,
      metadata:    { socio_id: data.socio_id, anio: data.anio },
    })
    return { id: row.id }
  } catch (err) {
    return handleActionError(err, 'createCertificadoRetiro')
  }
}
