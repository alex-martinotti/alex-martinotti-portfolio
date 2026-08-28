import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageTransition } from '../components/PageTransition'
import { TextReveal } from '../components/TextReveal'
import { Footer } from '../components/Footer'
import { FramedPrint, type FrameStyle } from '../components/FramedPrint'
import { useCursor } from '../lib/cursor-context'
import { useCart, lineId } from '../lib/cart-context'
import {
  prints,
  SIZES,
  COLLECTIONS,
  sizeLabel,
  priceFor,
  formatPrice,
  type Collection,
  type Edition,
} from '../data/prints'

const FRAMES: { id: FrameStyle; label: string }[] = [
  { id: 'black', label: 'Black' },
  { id: 'oak', label: 'Oak' },
  { id: 'none', label: 'Unframed' },
]

const SPEC = [
  ['Paper', 'Hahnemühle Photo Rag® 308gsm'],
  ['Process', 'Giclée fine art'],
  ['Ink', 'Archival pigment'],
  ['Signed', 'On request'],
]

export function Prints() {
  const { setMode } = useCursor()
  const { add, has } = useCart()

  const [selectedId, setSelectedId] = useState(prints[0].id)
  const [sizeId, setSizeId] = useState(SIZES[1].id)
  const [edition, setEdition] = useState<Edition>('open')
  const [frame, setFrame] = useState<FrameStyle>('black')
  const [filter, setFilter] = useState<Collection | 'All'>('All')
  const [zoom, setZoom] = useState(false)

  const selected = useMemo(() => prints.find((p) => p.id === selectedId) ?? prints[0], [selectedId])
  const size = useMemo(() => SIZES.find((s) => s.id === sizeId) ?? SIZES[1], [sizeId])
  const visible = useMemo(
    () => (filter === 'All' ? prints : prints.filter((p) => p.collection === filter)),
    [filter],
  )

  const price = priceFor(size, edition)
  const id = lineId(selected.id, size.id, edition, frame)
  const inCart = has(id)

  useEffect(() => {
    if (!zoom) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setZoom(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zoom])

  const addToCart = () =>
    add({
      id,
      slug: selected.id,
      title: selected.title,
      label: `${sizeLabel(size, selected.orientation)} · ${edition === 'limited' ? 'Ed. 25' : 'Open'}${
        frame === 'none' ? '' : ` · ${frame === 'oak' ? 'Oak' : 'Black'}`
      }`,
      size: size.id,
      edition,
      frame,
      price,
      preview: selected.thumbnail,
    })

  const chip = (active: boolean) =>
    `px-4 py-2 text-[11px] uppercase tracking-[0.15em] transition-colors duration-300 ${
      active ? 'bg-ink text-void' : 'border border-line text-muted hover:border-ink hover:text-ink'
    }`

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl px-6 pb-32 pt-28 md:px-10 md:pt-36">
        <TextReveal as="span" inView={false}>
          <h1 className="font-display text-[clamp(2rem,6vw,4rem)] font-black uppercase leading-[0.9] tracking-tight">
            Art
          </h1>
        </TextReveal>

        <div className="mt-10 grid gap-12 md:mt-14 md:grid-cols-[minmax(0,340px)_minmax(0,1fr)] md:gap-16">
          {/* details */}
          <div className="order-2 flex flex-col justify-center md:order-1">
            <p className="text-sm text-muted">{selected.number}</p>
            <h2 className="mt-1 font-display text-4xl font-black uppercase leading-none tracking-tight md:text-5xl">
              {selected.title}
            </h2>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted">
              {selected.location} · {selected.year}
            </p>
            <p className="mt-4 max-w-xs text-sm text-muted">
              Giclée fine art print on archival paper. Made to order.
            </p>

            <p className="mt-8 font-display text-2xl font-black tracking-tight">
              {formatPrice(price)}
            </p>

            <div className="mt-8">
              <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-muted">Size</p>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSizeId(s.id)}
                    onMouseEnter={() => setMode('hover')}
                    onMouseLeave={() => setMode('default')}
                    className={chip(size.id === s.id)}
                  >
                    {sizeLabel(s, selected.orientation)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-muted">Edition</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setEdition('open')}
                  onMouseEnter={() => setMode('hover')}
                  onMouseLeave={() => setMode('default')}
                  className={chip(edition === 'open')}
                >
                  Open edition
                </button>
                <button
                  onClick={() => setEdition('limited')}
                  onMouseEnter={() => setMode('hover')}
                  onMouseLeave={() => setMode('default')}
                  className={chip(edition === 'limited')}
                >
                  Edition of 25
                </button>
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-muted">Frame</p>
              <div className="flex flex-wrap gap-2">
                {FRAMES.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFrame(f.id)}
                    onMouseEnter={() => setMode('hover')}
                    onMouseLeave={() => setMode('default')}
                    className={chip(frame === f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={addToCart}
              disabled={inCart}
              onMouseEnter={() => setMode('hover')}
              onMouseLeave={() => setMode('default')}
              className="mt-8 w-full bg-ink px-6 py-4 font-display text-sm font-black uppercase tracking-[0.15em] text-void transition-opacity duration-300 hover:opacity-85 disabled:opacity-40"
            >
              {inCart ? 'In cart' : 'Add to cart'}
            </button>

            <ul className="mt-6 space-y-1.5 text-xs text-muted">
              <li>Made to order in 3–5 days</li>
              <li>Worldwide shipping from Luxembourg</li>
              <li>Secure packaging in reinforced tube</li>
            </ul>
          </div>

          {/* the print on a wall */}
          <div className="order-1 flex flex-col items-center justify-center md:order-2">
            <div className="flex w-full items-center justify-center rounded-sm bg-[#e9e5df] p-8 md:p-14">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selected.id}-${size.id}-${frame}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className={selected.orientation === 'portrait' ? 'w-[62%] md:w-[52%]' : 'w-[86%] md:w-[78%]'}
                >
                  <FramedPrint
                    src={selected.image}
                    alt={selected.title}
                    size={size}
                    orientation={selected.orientation}
                    frame={frame}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-4 flex w-full items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
                {sizeLabel(size, selected.orientation)}
                {frame !== 'none' && ` · ${frame === 'oak' ? 'Oak' : 'Black'} frame`}
              </p>
              <button
                onClick={() => setZoom(true)}
                onMouseEnter={() => setMode('hover')}
                onMouseLeave={() => setMode('default')}
                className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted transition-colors duration-300 hover:text-ink"
              >
                View print <span aria-hidden="true">⤢</span>
              </button>
            </div>
          </div>
        </div>

        {/* specification */}
        <div className="mt-20 grid gap-8 border-t border-line pt-8 sm:grid-cols-2 md:mt-28">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted">Print information</p>
            <dl className="mt-4 space-y-2">
              {SPEC.map(([k, v]) => (
                <div key={k} className="flex gap-4 text-xs">
                  <dt className="w-20 shrink-0 text-muted">{k}</dt>
                  <dd className="text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted">Returns</p>
            <p className="mt-4 max-w-sm text-xs text-muted">
              Each print is made to order, so returns are accepted if a print arrives damaged or
              defective. Anything wrong with your order — email me and I'll replace it.
            </p>
          </div>
        </div>

        {/* catalogue */}
        <div className="mt-16 border-t border-line pt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted">
              {filter === 'All' ? 'All prints' : filter} — {String(visible.length).padStart(2, '0')}
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
            {visible.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                onMouseEnter={() => setMode('project')}
                onMouseLeave={() => setMode('default')}
                className="group shrink-0 text-left"
              >
                <div
                  className={`relative aspect-[3/4] w-24 overflow-hidden bg-line ring-1 transition-all duration-300 sm:w-28 ${
                    selected.id === item.id ? 'ring-ink' : 'ring-transparent'
                  }`}
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className={`h-full w-full object-cover transition-opacity duration-300 ${
                      selected.id === item.id ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'
                    }`}
                  />
                </div>
                <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-muted">{item.number}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {zoom && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setZoom(false)}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/95 p-6"
          >
            <img
              src={selected.image}
              alt={selected.title}
              className="max-h-full max-w-full object-contain"
            />
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
