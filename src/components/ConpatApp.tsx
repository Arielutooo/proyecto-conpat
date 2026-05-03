'use client'

import React, { useState } from 'react'
import { AppContext } from '@/lib/context'
import { MOCK_CLIENTES } from '@/lib/mock-data'
import { Sidebar } from '@/components/shared'
import { LoginPage } from '@/components/auth/LoginPage'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import { AdminClientPanel } from '@/components/admin/client/AdminClientPanel'
import { OnboardingWizard } from '@/components/wizard/OnboardingWizard'
import { CFODashboard } from '@/components/cfo/CFODashboard'
import { CFOClientView } from '@/components/cfo/CFOClientView'
import type { Role } from '@/lib/types'
import type { Cliente } from '@/lib/types'

type View =
  | 'admin-dashboard'
  | 'admin-wizard'
  | 'admin-client'
  | 'cfo-dashboard'
  | 'cfo-client'

interface Tweaks {
  accentColor: string
  sidebarBg: string
  density: string
}

const TWEAK_DEFAULTS: Tweaks = {
  accentColor: 'oklch(0.55 0.18 245)',
  sidebarBg: '#0d1117',
  density: 'normal',
}

export const ConpatApp = () => {
  const [tweaks] = useState<Tweaks>(TWEAK_DEFAULTS)
  const [role, setRole] = useState<Role | null>(null)
  const [userName, setUserName] = useState('')
  const [view, setView] = useState<View>('admin-dashboard')
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [clientes, setClientes] = useState<Cliente[]>(MOCK_CLIENTES)

  const handleLogin = (r: Role, name: string) => {
    setRole(r)
    setUserName(name)
    setView(r === 'admin' ? 'admin-dashboard' : 'cfo-dashboard')
  }

  const handleUpdateCliente = (updated: Cliente) => {
    setClientes(prev => prev.map(c => c.id === updated.id ? updated : c))
    if (selectedCliente?.id === updated.id) setSelectedCliente(updated)
  }

  const handleNewCliente = (newC: Cliente) => {
    setClientes(prev => [...prev, newC])
    setView('admin-dashboard')
  }

  const navigate = (v: string) => {
    setView(v as View)
    setSelectedCliente(null)
  }

  const appCtx = { setView: navigate, setRole, tweaks, userName }

  if (!role) {
    return (
      <AppContext.Provider value={appCtx}>
        <LoginPage onLogin={handleLogin} />
      </AppContext.Provider>
    )
  }

  return (
    <AppContext.Provider value={appCtx}>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Sidebar role={role} view={view} onNavigate={navigate} userName={userName} />

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f1f5f9' }}>
          {role === 'admin' && view === 'admin-dashboard' && (
            <AdminDashboard
              clientes={clientes}
              onSelectCliente={c => { setSelectedCliente(c); setView('admin-client') }}
              onNewCliente={() => setView('admin-wizard')}
            />
          )}
          {role === 'admin' && view === 'admin-wizard' && (
            <OnboardingWizard
              onFinish={handleNewCliente}
              onCancel={() => setView('admin-dashboard')}
            />
          )}
          {role === 'admin' && view === 'admin-client' && selectedCliente && (
            <AdminClientPanel
              cliente={selectedCliente}
              onBack={() => setView('admin-dashboard')}
              onUpdate={handleUpdateCliente}
            />
          )}

          {role === 'cfo_externo' && view === 'cfo-dashboard' && (
            <CFODashboard
              clientes={clientes}
              onSelectCliente={c => { setSelectedCliente(c); setView('cfo-client') }}
            />
          )}
          {role === 'cfo_externo' && view === 'cfo-client' && selectedCliente && (
            <CFOClientView
              cliente={selectedCliente}
              onBack={() => setView('cfo-dashboard')}
              onUpdate={handleUpdateCliente}
            />
          )}
        </main>
      </div>
    </AppContext.Provider>
  )
}
