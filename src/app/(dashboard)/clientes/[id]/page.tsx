import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClienteConRelaciones } from '@/lib/queries/clientes'
import { ClienteDetail } from './_components/ClienteDetail'
import type { Role } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ClientePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user!.id)
    .single()

  const role = (roleRow?.role ?? 'cfo_externo') as Role
  const cliente = await getClienteConRelaciones(id)

  if (!cliente) notFound()

  return <ClienteDetail cliente={cliente} role={role} />
}
