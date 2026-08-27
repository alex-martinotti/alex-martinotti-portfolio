import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../lib/cart-context'
import { formatPrice } from '../data/wallpapers'
import { useCursor } from '../lib/cursor-context'

/**
 * Only appears once something is in the cart — no persistent shop chrome on a
 * portfolio. Checkout hands off to Stripe's hosted page; the cart is cleared
 * by the thank-you page, not here, so a cancelled payment keeps the basket.
 */
export function CartBar() {
  const { lines, total, remove, clear } = useCart()
  const { setMode } = useCursor()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkout = async () => {
    if (busy || !lines.length) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: lines.map((l) => ({
            id: l.slug,
            format: l.device === 'iphone' ? 'iphone' : l.ratio,
          })),
        }),
      })
      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Checkout unavailable')
      window.location.href = data.url
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Checkout unavailable')
      setBusy(false)
    }
  }

  return (
    <AnimatePresence>
      {lines.length > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-0 inset-x-0 z-40 border-t border-line bg-void/95 px-6 py-4 backdrop-blur-sm md:px-10"
        >
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {lines.map((l) => (
                <button
                  key={l.id}
                  onClick={() => remove(l.id)}
                  onMouseEnter={() => setMode('hover')}
                  onMouseLeave={() => setMode('default')}
                  title="Remove"
                  className="group flex items-center gap-2 border border-line px-3 py-1.5 text-xs uppercase tracking-[0.1em] text-muted transition-colors duration-300 hover:border-ink hover:text-ink"
                >
                  {l.title}
                  <span className="text-[10px]">{l.device === 'iphone' ? 'iPhone' : l.ratio}</span>
                  <span className="opacity-40 transition-opacity group-hover:opacity-100">×</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={clear}
                className="text-xs uppercase tracking-[0.2em] text-muted transition-colors duration-300 hover:text-ink"
              >
                Clear
              </button>
              <span className="font-display text-lg font-black tracking-tight">{formatPrice(total)}</span>
              <button
                onClick={checkout}
                disabled={busy}
                onMouseEnter={() => setMode('hover')}
                onMouseLeave={() => setMode('default')}
                className="border-b border-ink pb-0.5 font-display text-lg font-black uppercase tracking-tight transition-opacity duration-300 hover:opacity-70 disabled:opacity-40"
              >
                {busy ? 'Opening…' : 'Checkout →'}
              </button>
            </div>
          </div>

          {error && (
            <p className="mx-auto mt-3 max-w-6xl text-xs text-muted">{error}</p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
