'use client'

import { createContext, useContext, useState } from 'react'

interface AnoFiscalContextType {
  anioFiscal: number
  setAnioFiscal: (year: number) => void
}

const AnoFiscalContext = createContext<AnoFiscalContextType>({
  anioFiscal: new Date().getFullYear(),
  setAnioFiscal: () => {},
})

export function AnoFiscalProvider({ children }: { children: React.ReactNode }) {
  const [anioFiscal, setAnioFiscal] = useState(new Date().getFullYear())
  return (
    <AnoFiscalContext.Provider value={{ anioFiscal, setAnioFiscal }}>
      {children}
    </AnoFiscalContext.Provider>
  )
}

export function useAnoFiscal() {
  return useContext(AnoFiscalContext)
}

export const ANOS_FISCALES = [2022, 2023, 2024, 2025, 2026]
