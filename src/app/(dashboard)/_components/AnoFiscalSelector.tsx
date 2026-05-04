'use client'

import * as Select from '@radix-ui/react-select'
import { ChevronDown } from 'lucide-react'
import { useAnoFiscal, ANOS_FISCALES } from '@/lib/contexts/ano-fiscal'

export function AnoFiscalSelector() {
  const { anioFiscal, setAnioFiscal } = useAnoFiscal()

  return (
    <Select.Root value={String(anioFiscal)} onValueChange={v => setAnioFiscal(Number(v))}>
      <Select.Trigger className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
        <span className="text-slate-400 font-normal">Año Fiscal</span>
        <Select.Value />
        <ChevronDown size={12} className="text-slate-400" />
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={6}
          className="z-50 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden min-w-[100px]"
        >
          <Select.Viewport className="p-1">
            {ANOS_FISCALES.map(year => (
              <Select.Item
                key={year}
                value={String(year)}
                className="px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg cursor-pointer focus:outline-none focus:bg-blue-50 data-[state=checked]:text-blue-700 data-[state=checked]:bg-blue-50"
              >
                <Select.ItemText>{year}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
