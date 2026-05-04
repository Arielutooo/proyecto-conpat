'use client'

import { usePathname } from 'next/navigation'
import { AnoFiscalSelector } from './AnoFiscalSelector'
import type { Role } from '@/lib/types'

interface TopBarProps {
  userName: string
  userEmail: string
  role: Role
}

function getTitle(pathname: string): string {
  if (pathname === '/clientes') return 'Clientes'
  if (pathname.includes('/clientes/')) return 'Ficha de Cliente'
  return 'CONPAT'
}

export function TopBar({ userName, userEmail, role }: TopBarProps) {
  const pathname = usePathname()

  const initials = userName
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()

  return (
    <header className="h-14 flex-shrink-0 bg-white border-b border-slate-200 flex items-center px-6 gap-4">
      <div className="flex-1">
        <h1 className="text-sm font-semibold text-slate-900">{getTitle(pathname)}</h1>
      </div>

      <AnoFiscalSelector />

      <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
          <span className="text-white text-xs font-semibold">{initials || 'U'}</span>
        </div>
        <div className="hidden sm:block">
          <div className="text-xs font-semibold text-slate-800 leading-none">{userName}</div>
          <div className="text-xs text-slate-400 mt-0.5">{role === 'admin' ? 'Admin' : 'CFO'}</div>
        </div>
      </div>
    </header>
  )
}
