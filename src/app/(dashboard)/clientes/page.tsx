import { createClient } from '@/lib/supabase/server'
import { getClientes } from '@/lib/queries/clientes'
import { ClientesTable } from './_components/ClientesTable'
import { NuevoClienteBtn } from './_components/NuevoClienteBtn'
import type { Role } from '@/lib/types'

export default async function ClientesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user!.id)
    .single()

  const role = (roleRow?.role ?? 'cfo_externo') as Role
  const clientes = await getClientes()

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Clientes</h2>
          <p className="text-sm text-slate-500 mt-0.5">{clientes.length} cliente{clientes.length !== 1 ? 's' : ''} registrado{clientes.length !== 1 ? 's' : ''}</p>
        </div>
        {role === 'admin' && <NuevoClienteBtn />}
      </div>
      <ClientesTable clientes={clientes} role={role} />
    </div>
  )
}
