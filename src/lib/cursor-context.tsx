import { createContext, useContext, useState, type ReactNode } from 'react'

/** 'project' is reserved for actual project preview/list items — everything else clickable uses 'hover'. */
export type CursorMode = 'default' | 'hover' | 'project'

interface CursorContextValue {
  mode: CursorMode
  setMode: (mode: CursorMode) => void
}

const CursorContext = createContext<CursorContextValue | null>(null)

export function CursorProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<CursorMode>('default')
  return <CursorContext.Provider value={{ mode, setMode }}>{children}</CursorContext.Provider>
}

export function useCursor() {
  const ctx = useContext(CursorContext)
  if (!ctx) throw new Error('useCursor must be used within a CursorProvider')
  return ctx
}
