import type { Orientation, PrintSize } from '../data/prints'

export type FrameStyle = 'black' | 'oak' | 'white' | 'none'

/**
 * A framed print built to read as a physical object rather than an image in a
 * box. The layers, outside in:
 *
 *   wall shadow   — soft cast shadow plus a tight contact shadow at the base
 *   moulding      — with a lit top-left edge and a shaded bottom-right edge
 *   rabbet        — the dark inner lip where the moulding meets the glazing
 *   glazing       — a single low-opacity diagonal sheen, no glare
 *   mount         — warm paper with a bevel-cut inner edge
 *   photograph    — untouched; only ever scaled, never filtered or re-cropped
 *
 * Every effect is deliberately weak. Overdo any of them and it stops looking
 * photographed and starts looking rendered.
 */
const FRAMES: Record<
  FrameStyle,
  { face: string; lit: string; shade: string; width: number }
> = {
  black: { face: '#1b1b1e', lit: '#33333a', shade: '#0c0c0e', width: 2.4 },
  oak: { face: '#c3a883', lit: '#d8c19c', shade: '#a08a68', width: 2.8 },
  white: { face: '#f2efe9', lit: '#ffffff', shade: '#d6d1c7', width: 2.6 },
  none: { face: 'transparent', lit: 'transparent', shade: 'transparent', width: 0 },
}

export function FramedPrint({
  src,
  alt,
  size,
  orientation,
  frame = 'black',
  className = '',
}: {
  src: string
  alt: string
  size: PrintSize
  orientation: Orientation
  frame?: FrameStyle
  className?: string
}) {
  const ratio =
    orientation === 'portrait' ? `${size.short} / ${size.long}` : `${size.long} / ${size.short}`

  // Bigger prints carry proportionally wider mounts, as they do in practice.
  const mat = size.long >= 100 ? 9.5 : size.long >= 70 ? 8 : 6.5
  const f = FRAMES[frame]
  const framed = frame !== 'none'

  return (
    <div className={`relative mx-auto w-full ${className}`} style={{ aspectRatio: ratio }}>
      {/* cast shadow on the wall — offset down, never symmetrical */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          transform: 'translate(1.5%, 2.5%)',
          filter: 'blur(14px)',
          background: 'rgba(38,32,26,0.30)',
          zIndex: 0,
        }}
      />
      {/* tight contact shadow — what stops it looking like it floats */}
      <div
        className="pointer-events-none absolute inset-x-[2%] bottom-[-1%] h-[3%]"
        style={{ filter: 'blur(5px)', background: 'rgba(38,32,26,0.34)', zIndex: 0 }}
      />

      {/* moulding */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          zIndex: 1,
          padding: framed ? `${f.width}%` : 0,
          background: framed
            ? `linear-gradient(145deg, ${f.lit} 0%, ${f.face} 34%, ${f.face} 66%, ${f.shade} 100%)`
            : 'transparent',
          boxShadow: framed ? 'inset 0 0 0 1px rgba(0,0,0,0.35)' : 'none',
        }}
      >
        {/* rabbet — the dark lip inside the moulding */}
        <div
          className="relative h-full w-full"
          style={{
            boxShadow: framed
              ? 'inset 0 0 0 1px rgba(0,0,0,0.5), inset 0 2px 6px rgba(0,0,0,0.32)'
              : '0 0 0 1px rgba(0,0,0,0.10)',
          }}
        >
          {/* mount */}
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              padding: `${mat}%`,
              background: 'linear-gradient(150deg, #faf8f3 0%, #f4f1ea 55%, #ece8df 100%)',
            }}
          >
            {/* bevel cut + the photograph */}
            <div
              className="relative max-h-full max-w-full"
              style={{
                boxShadow:
                  '0 0 0 1px rgba(255,255,255,0.9), 0 0 0 2px rgba(140,130,115,0.45), 0 2px 5px rgba(60,50,40,0.20)',
              }}
            >
              <img src={src} alt={alt} className="block max-h-full max-w-full object-contain" />
            </div>
          </div>

          {/* glazing — one weak diagonal sheen */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(118deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 18%, rgba(255,255,255,0) 34%, rgba(255,255,255,0) 100%)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
