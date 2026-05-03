'use client'

import { createContext, useContext } from 'react'
import type { AppContextType } from './types'

export const AppContext = createContext<AppContextType | null>(null)

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppContext.Provider')
  return ctx
}
