'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { ClienteWizard } from './ClienteWizard'

export function NuevoClienteBtn() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        <Plus size={15} />
        Nuevo Cliente
      </button>
      <ClienteWizard open={open} onClose={() => setOpen(false)} />
    </>
  )
}
