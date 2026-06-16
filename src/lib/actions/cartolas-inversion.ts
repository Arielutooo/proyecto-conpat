'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, requireAuth } from '@/lib/actions/auth-helpers'
import { handleActionError } from '@/lib/auth'
import { logAudit } from '@/lib/actions/audit'
import type { CartolaInversion } from '@/lib/types'

type ActionResult = { error?: string; id?: string }

async function getEmpresa(clienteId: string): Promise<string | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('clientes').select('razon_social').eq('id', clienteId).single()
    return data?.razon_social ?? null
  } catch {
    return null
  }
}

export async function createCartolaInversion(
  data: Omit<CartolaInversion, 'id' | 'created_at'>
): Promise<ActionResult> {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { data: row, error } = await supabase
      .from('cartolas_inversion')
      .insert(data)
      .select('id')
      .single()
    if (error) {
      console.error('[createCartolaInversion] DB error:', error.message)
      return { error: 'No se pudo guardar la cartola de inversión.' }
    }
    revalidatePath(`/clientes/${data.cliente_id}`)
    const empresa = await getEmpresa(data.cliente_id)
    await logAudit({
      action:      'cartola_inversion_subida',
      description: `Cartola de inversión subida (mes ${data.mes}/${data.anio})`,
      entity_type: 'cartola_inversion',
      entity_id:   row.id,
      empresa,
      metadata:    { cliente_id: data.cliente_id, inversion_id: data.inversion_id, mes: data.mes, anio: data.anio },
    })
    return { id: row.id }
  } catch (err) {
    return handleActionError(err, 'createCartolaInversion')
  }
}

export async function deleteCartolaInversion(
  id: string,
  clienteId: string
): Promise<ActionResult> {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { data: prev } = await supabase
      .from('cartolas_inversion')
      .select('mes, anio, inversion_id')
      .eq('id', id)
      .single()
    const { error } = await supabase.from('cartolas_inversion').delete().eq('id', id)
    if (error) {
      console.error('[deleteCartolaInversion] DB error:', error.message)
      return { error: 'No se pudo eliminar la cartola de inversión.' }
    }
    revalidatePath(`/clientes/${clienteId}`)
    const empresa = await getEmpresa(clienteId)
    await logAudit({
      action:      'cartola_inversion_eliminada',
      description: `Cartola de inversión eliminada (mes ${prev?.mes ?? '?'}/${prev?.anio ?? '?'})`,
      entity_type: 'cartola_inversion',
      entity_id:   id,
      empresa,
      metadata:    { cliente_id: clienteId, inversion_id: prev?.inversion_id },
    })
    return {}
  } catch (err) {
    return handleActionError(err, 'deleteCartolaInversion')
  }
}

export async function getCartolasInversion(
  inversionId: string,
  anio: number
): Promise<{ data?: CartolaInversion[]; error?: string }> {
  try {
    await requireAuth()
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('cartolas_inversion')
      .select('*')
      .eq('inversion_id', inversionId)
      .eq('anio', anio)
      .order('mes')
    if (error) return { error: error.message }
    return { data: data ?? [] }
  } catch (err) {
    return { error: 'Error al obtener cartolas de inversión.' }
  }
}
