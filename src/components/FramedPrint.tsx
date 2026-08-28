import type { Orientation, PrintSize } from '../data/prints'

export type FrameStyle = 'black' | 'oak' | 'none'

/**
 * A print shown the way it's actually framed: the frame takes the chosen size's
 * proportions, and the photograph sits inside a paper mount that absorbs any
 * difference in aspect ratio — which is what a mount does in real framing.
 * Nothing is stretched or re-cropped.
 *
 * Frame and mount are nested padding, not borders: CSS border-width rejects
 * percentages, so a percentage border silently collapses to 0.
 *
 * Deliberately restrained — one soft shadow, no gloss, no reflections.
 */
const FRAMES: Record<FrameStyle, { color: string; width: number; shadow: string }> = {
  black: { color: '#17171a', width: 2.2, shadow: '0 18px 40px -18px rgba(0,0,0,0.45)' },
  oak: { color: '#c2a882', width: 2.6, shadow: '0 18px 40px -18px rgba(0,0,0,0.34)' },
  none: { color: 'transparent', width: 0, shadow: '0 14px 34px -18px rgba(0,0,0,0.28)' },
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

  // Bigger prints carry proportionally wider margins, as they do in practice.
  const mat = size.long >= 100 ? 10 : size.long >= 70 ? 8.5 : 7

  const f = FRAMES[frame]

  return (
    <div className={`mx-auto w-full ${className}`}>
      {/* frame */}
      <div
        className="w-full"
        style={{
          aspectRatio: ratio,
          padding: `${f.width}%`,
          background: f.color,
          boxShadow: f.shadow,
        }}
      >
        {/* archival paper mount */}
        <div
          className="flex h-full w-full items-center justify-center bg-[#f6f4ef]"
          style={{ padding: `${mat}%` }}
        >
          <img
            src={src}
            alt={alt}
            className="max-h-full max-w-full object-contain"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.18)' }}
          />
        </div>
      </div>
    </div>
  )
}
