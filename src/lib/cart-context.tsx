import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Device, DesktopRatio } from '../data/wallpapers'

export interface CartLine {
  /** Unique per wallpaper + device + ratio, so the same photo can be bought twice in different crops. */
  id: string
  slug: string
  title: string
  device: Device
  ratio?: DesktopRatio
  price: number
  preview: string
}

interface CartValue {
  lines: CartLine[]
  add: (line: CartLine) => void
  remove: (id: string) => void
  clear: () => void
  has: (id: string) => boolean
  total: number
}

const CartContext = createContext<CartValue | null>(null)
const STORAGE_KEY = 'am-cart'

export function lineId(slug: string, device: Device, ratio?: DesktopRatio) {
  return device === 'iphone' ? `${slug}:iphone` : `${slug}:desktop:${ratio ?? '16:9'}`
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as CartLine[]) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
    } catch {
      /* private mode — cart just won't persist */
    }
  }, [lines])

  const value = useMemo<CartValue>(
    () => ({
      lines,
      add: (line) => setLines((prev) => (prev.some((l) => l.id === line.id) ? prev : [...prev, line])),
      remove: (id) => setLines((prev) => prev.filter((l) => l.id !== id)),
      clear: () => setLines([]),
      has: (id) => lines.some((l) => l.id === id),
      total: lines.reduce((sum, l) => sum + l.price, 0),
    }),
    [lines],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
