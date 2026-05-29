import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AnoFiscalProvider } from '@/lib/contexts/ano-fiscal'
import { Sidebar } from './_components/Sidebar'
import type { Role } from '@/lib/types'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (user.user_metadata?.must_change_password === true) redirect('/cambiar-contrasena')

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  const role     = (roleRow?.role ?? 'cfo_externo') as Role
  const userName = (user.user_metadata?.name as string | undefined) ?? user.email ?? 'Usuario'

  return (
    <AnoFiscalProvider>
      <div className="flex h-screen overflow-hidden" style={{ background: '#F3F3EB' }}>
        <Sidebar role={role} userName={userName} />
        <main className="flex-1 min-w-0 overflow-auto">
          {children}
        </main>
      </div>
    </AnoFiscalProvider>
  )
}
