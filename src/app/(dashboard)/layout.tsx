import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AnoFiscalProvider } from '@/lib/contexts/ano-fiscal'
import { Sidebar } from './_components/Sidebar'
import { TopBar } from './_components/TopBar'
import type { Role } from '@/lib/types'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  const role = (roleRow?.role ?? 'cfo_externo') as Role
  const userName = (user.user_metadata?.name as string | undefined) ?? user.email ?? 'Usuario'

  return (
    <AnoFiscalProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar role={role} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar userName={userName} userEmail={user.email ?? ''} role={role} />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </AnoFiscalProvider>
  )
}
