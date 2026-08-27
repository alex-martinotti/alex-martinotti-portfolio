import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageTransition } from '../components/PageTransition'
import { TextReveal } from '../components/TextReveal'
import { Footer } from '../components/Footer'
import { useCursor } from '../lib/cursor-context'
import { useCart, lineId } from '../lib/cart-context'
import {
  wallpapers,
  DESKTOP_RATIOS,
  formatPrice,
  type Device,
  type DesktopRatio,
  type Wallpaper,
} from '../data/wallpapers'

/**
 * The archive's structure, applied to a shop: pick a photograph, pick the
 * device, pick the crop. Kept monochrome and type-led so it reads as part of
 * the same site rather than a storefront bolted on.
 */
export function Wallpapers() {
  const { setMode } = useCursor()
  const { add, has } = useCart()
  const [selected, setSelected] = useState<Wallpaper>(wallpapers[0])
  const [device, setDevice] = useState<Device>('iphone')
  const [ratio, setRatio] = useState<DesktopRatio>('16:9')

  const price = device === 'iphone' ? selected.iphone?.price : selected.desktop?.price
  const available = device === 'iphone' ? !!selected.iphone : !!selected.desktop
  const id = lineId(selected.slug, device, ratio)
  const inCart = has(id)

  const addToCart = () => {
    if (!price) return
    add({
      id,
      slug: selected.slug,
      title: selected.title,
      device,
      ratio: device === 'desktop' ? ratio : undefined,
      price,
      preview: selected.preview,
    })
  }

  const tab = (value: Device, label: string) => (
    <button
      key={value}
      onClick={() => setDevice(value)}
      onMouseEnter={() => setMode('hover')}
      onMouseLeave={() => setMode('default')}
      className={`border-b pb-1 text-xs uppercase tracking-[0.2em] transition-colors duration-300 ${
        device === value ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'
      }`}
    >
      {label}
    </button>
  )

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-32 md:px-10 md:pt-40">
        <TextReveal as="span" inView={false}>
          <h1 className="font-display text-[clamp(2.5rem,8vw,6rem)] font-black uppercase leading-[0.9] tracking-tight">
            Wallpaper
          </h1>
        </TextReveal>

        <p className="mt-6 max-w-md text-base text-muted md:text-lg">
          Photographs sized for your screen.
        </p>

        {/* selected item */}
        <div className="mt-16 grid gap-10 md:mt-20 md:grid-cols-[1.1fr_1fr] md:gap-16">
          <div className="relative overflow-hidden bg-line">
            <AnimatePresence mode="wait">
              <motion.img
                key={`${selected.slug}-${device}`}
                src={selected.preview}
                alt={selected.title}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className={`w-full object-cover grayscale contrast-110 ${
                  device === 'iphone' ? 'aspect-[9/16]' : 'aspect-[16/10]'
                }`}
              />
            </AnimatePresence>
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-sm text-muted">{selected.number}</p>
            <h2 className="mt-2 font-display text-4xl font-black uppercase leading-none tracking-tight md:text-6xl">
              {selected.title}
            </h2>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted">
              {selected.location} · {selected.year}
            </p>

            <div className="mt-10 flex gap-6">
              {tab('iphone', 'iPhone')}
              {tab('desktop', 'Desktop')}
            </div>

            {device === 'desktop' && (
              <div className="mt-6 flex flex-wrap gap-3">
                {DESKTOP_RATIOS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRatio(r)}
                    onMouseEnter={() => setMode('hover')}
                    onMouseLeave={() => setMode('default')}
                    className={`border px-3 py-1.5 text-xs tracking-[0.1em] transition-colors duration-300 ${
                      ratio === r ? 'border-ink text-ink' : 'border-line text-muted hover:border-ink hover:text-ink'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}

            <p className="mt-10 font-display text-2xl font-black tracking-tight">
              {available && price ? formatPrice(price) : 'Not available'}
            </p>

            <button
              onClick={addToCart}
              disabled={!available || inCart}
              onMouseEnter={() => setMode('hover')}
              onMouseLeave={() => setMode('default')}
              className="group mt-6 inline-flex w-fit items-center gap-3 border-b border-ink pb-1 font-display text-xl font-black uppercase tracking-tight transition-colors duration-300 hover:text-muted disabled:opacity-40 md:text-2xl"
            >
              {inCart ? 'In cart' : 'Add to cart'}
              <span className="transition-transform duration-300 group-hover:translate-x-2">→</span>
            </button>
          </div>
        </div>

        {/* the collection */}
        <div className="mt-24 border-t border-line pt-10 md:mt-32">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Collection — {String(wallpapers.length).padStart(2, '0')}
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {wallpapers.map((w) => (
              <button
                key={w.slug}
                onClick={() => setSelected(w)}
                onMouseEnter={() => setMode('project')}
                onMouseLeave={() => setMode('default')}
                className="group text-left"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-line">
                  <img
                    src={w.preview}
                    alt={w.title}
                    loading="lazy"
                    className={`h-full w-full object-cover grayscale contrast-110 transition-all duration-500 group-hover:scale-[1.03] ${
                      selected.slug === w.slug ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
                    }`}
                  />
                </div>
                <p className="mt-2 font-display text-sm font-black uppercase tracking-tight">
                  {w.number} {w.title}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </PageTransition>
  )
}
