import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageTransition } from '../components/PageTransition'
import { TextReveal } from '../components/TextReveal'
import { Footer } from '../components/Footer'
import { IPhoneScreen } from '../components/devices/IPhoneScreen'
import { DesktopScreen } from '../components/devices/DesktopScreen'
import { useCursor } from '../lib/cursor-context'
import { useCart, lineId } from '../lib/cart-context'
import {
  wallpapers,
  ratiosFor,
  formatPrice,
  COLLECTIONS,
  type Device,
  type DesktopRatio,
  type IPhoneMode,
  type Collection,
} from '../data/wallpapers'

const INCLUDED = ['High-resolution JPG', 'Instant download', 'Personal use']

export function Wallpapers() {
  const { setMode } = useCursor()
  const { add, has } = useCart()

  const [selectedId, setSelectedId] = useState(wallpapers[0].id)
  const [device, setDevice] = useState<Device>('iphone')
  const [screen, setScreen] = useState<IPhoneMode>('lock')
  const [ratio, setRatio] = useState<DesktopRatio>('16:9')
  const [fullscreen, setFullscreen] = useState(false)
  const [filter, setFilter] = useState<Collection | 'All'>('All')

  const visible = useMemo(
    () => (filter === 'All' ? wallpapers : wallpapers.filter((w) => w.collection === filter)),
    [filter],
  )

  const selected = useMemo(
    () => wallpapers.find((w) => w.id === selectedId) ?? wallpapers[0],
    [selectedId],
  )
  const ratios = ratiosFor(selected)

  // Keep the selection valid when moving between photographs that offer
  // different formats — never leave a dead option selected.
  useEffect(() => {
    if (device === 'iphone' && !selected.iphone && ratios.length) setDevice('desktop')
    if (device === 'desktop' && !ratios.length && selected.iphone) setDevice('iphone')
    if (device === 'desktop' && ratios.length && !ratios.includes(ratio)) setRatio(ratios[0])
  }, [selected, device, ratio, ratios])

  useEffect(() => {
    if (!fullscreen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setFullscreen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [fullscreen])

  const previewSrc =
    device === 'iphone' ? selected.iphone?.preview : selected.desktop?.[ratio]

  const id = lineId(selected.id, device, device === 'desktop' ? ratio : undefined)
  const inCart = has(id)
  const available = Boolean(previewSrc)

  const addToCart = () => {
    if (!available) return
    add({
      id,
      slug: selected.id,
      title: selected.title,
      device,
      ratio: device === 'desktop' ? ratio : undefined,
      price: selected.price,
      preview: selected.thumbnail,
    })
  }

  const optionClass = (active: boolean) =>
    `px-4 py-2 text-[11px] uppercase tracking-[0.18em] transition-colors duration-300 ${
      active ? 'bg-ink text-void' : 'border border-line text-muted hover:border-ink hover:text-ink'
    }`

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl px-6 pb-32 pt-28 md:px-10 md:pt-36">
        <TextReveal as="span" inView={false}>
          <h1 className="font-display text-[clamp(2rem,6vw,4rem)] font-black uppercase leading-[0.9] tracking-tight">
            Wallpaper
          </h1>
        </TextReveal>

        {/* device preview leads on mobile, sits right on desktop */}
        <div className="mt-10 grid gap-12 md:mt-14 md:grid-cols-[minmax(0,360px)_minmax(0,1fr)] md:gap-16">
          <div className="order-2 flex flex-col justify-center md:order-1">
            <p className="text-sm text-muted">{selected.number}</p>
            <h2 className="mt-1 font-display text-4xl font-black uppercase leading-none tracking-tight md:text-5xl">
              {selected.title}
            </h2>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted">
              {selected.collection}
            </p>
            <p className="mt-1 text-xs text-muted">
              {selected.location} · {selected.year}
            </p>

            <p className="mt-8 font-display text-2xl font-black tracking-tight">
              {formatPrice(selected.price)}
            </p>

            {/* device */}
            <div className="mt-8 flex gap-6">
              {selected.iphone && (
                <button
                  onClick={() => setDevice('iphone')}
                  onMouseEnter={() => setMode('hover')}
                  onMouseLeave={() => setMode('default')}
                  className={`border-b pb-1 text-xs uppercase tracking-[0.2em] transition-colors duration-300 ${
                    device === 'iphone' ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'
                  }`}
                >
                  iPhone
                </button>
              )}
              {ratios.length > 0 && (
                <button
                  onClick={() => setDevice('desktop')}
                  onMouseEnter={() => setMode('hover')}
                  onMouseLeave={() => setMode('default')}
                  className={`border-b pb-1 text-xs uppercase tracking-[0.2em] transition-colors duration-300 ${
                    device === 'desktop' ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'
                  }`}
                >
                  Desktop
                </button>
              )}
            </div>

            {/* device-specific options */}
            <div className="mt-6">
              <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-muted">
                {device === 'iphone' ? 'Screen' : 'Ratio'}
              </p>
              <div className="flex flex-wrap gap-2">
                {device === 'iphone'
                  ? (['lock', 'home'] as IPhoneMode[]).map((m) => (
                      <button
                        key={m}
                        onClick={() => setScreen(m)}
                        onMouseEnter={() => setMode('hover')}
                        onMouseLeave={() => setMode('default')}
                        className={optionClass(screen === m)}
                      >
                        {m === 'lock' ? 'Lock screen' : 'Home screen'}
                      </button>
                    ))
                  : ratios.map((r) => (
                      <button
                        key={r}
                        onClick={() => setRatio(r)}
                        onMouseEnter={() => setMode('hover')}
                        onMouseLeave={() => setMode('default')}
                        className={optionClass(ratio === r)}
                      >
                        {r}
                      </button>
                    ))}
              </div>
            </div>

            <ul className="mt-8 space-y-1.5">
              {INCLUDED.map((line) => (
                <li key={line} className="flex items-center gap-2 text-xs text-muted">
                  <span className="text-ink">✓</span>
                  {line}
                </li>
              ))}
            </ul>

            <button
              onClick={addToCart}
              disabled={!available || inCart}
              onMouseEnter={() => setMode('hover')}
              onMouseLeave={() => setMode('default')}
              className="mt-8 w-full bg-ink px-6 py-4 font-display text-sm font-black uppercase tracking-[0.15em] text-void transition-opacity duration-300 hover:opacity-85 disabled:opacity-40 sm:w-auto"
            >
              {inCart ? 'In cart' : 'Add to cart'}
            </button>

            <button
              onClick={() => setFullscreen(true)}
              disabled={!available}
              onMouseEnter={() => setMode('hover')}
              onMouseLeave={() => setMode('default')}
              className="mt-4 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted transition-colors duration-300 hover:text-ink disabled:opacity-40"
            >
              Preview fullscreen
              <span aria-hidden="true">⤢</span>
            </button>
          </div>

          {/* the device — only the photograph crossfades, the frame never moves */}
          <div className="order-1 flex items-center justify-center md:order-2">
            {available ? (
              <div className="w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${selected.id}-${device}-${screen}-${ratio}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  >
                    {device === 'iphone' ? (
                      <IPhoneScreen src={previewSrc!} mode={screen} />
                    ) : (
                      <DesktopScreen src={previewSrc!} ratio={ratio} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            ) : (
              <p className="text-sm text-muted">Not available in this format.</p>
            )}
          </div>
        </div>

        {/* catalogue — lazy, thumbnails only */}
        <div className="mt-20 border-t border-line pt-8 md:mt-28">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted">
              {filter === 'All' ? 'All wallpapers' : filter} —{' '}
              {String(visible.length).padStart(2, '0')}
            </p>

            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {(['All', ...COLLECTIONS] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  onMouseEnter={() => setMode('hover')}
                  onMouseLeave={() => setMode('default')}
                  className={`text-[10px] uppercase tracking-[0.2em] transition-colors duration-300 ${
                    filter === c ? 'text-ink' : 'text-muted hover:text-ink'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex gap-3 overflow-x-auto pb-3">
            {visible.map((w) => (
              <button
                key={w.id}
                onClick={() => setSelectedId(w.id)}
                onMouseEnter={() => setMode('project')}
                onMouseLeave={() => setMode('default')}
                className="group shrink-0 text-left"
              >
                <div
                  className={`relative aspect-[3/4] w-24 overflow-hidden bg-line ring-1 transition-all duration-300 sm:w-28 ${
                    selected.id === w.id ? 'ring-ink' : 'ring-transparent'
                  }`}
                >
                  <img
                    src={w.thumbnail}
                    alt={w.title}
                    loading="lazy"
                    decoding="async"
                    className={`h-full w-full object-cover transition-opacity duration-300 ${
                      selected.id === w.id ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'
                    }`}
                  />
                </div>
                <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-muted">{w.number}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {fullscreen && previewSrc && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setFullscreen(false)}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/95 p-6"
          >
            <img src={previewSrc} alt={selected.title} className="max-h-full max-w-full object-contain" />
            <span className="absolute bottom-6 text-[11px] uppercase tracking-[0.2em] text-white/60">
              Click anywhere to close
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <Footer />
    </PageTransition>
  )
}
