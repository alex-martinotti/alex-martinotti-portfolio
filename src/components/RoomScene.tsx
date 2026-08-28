import { FramedPrint, type FrameStyle } from './FramedPrint'
import { SIZES, type Orientation } from '../data/prints'

export type Room = 'living' | 'kitchen' | 'bedroom'

/**
 * Shows a print hanging in a room so the size reads at human scale.
 *
 * The interiors are drawn — warm tonal blocks and furniture silhouettes, in
 * the site's own language — rather than photographed or generated. A stock or
 * AI-rendered living room would fight the photography and date badly; this
 * stays quiet and lets the print be the only detailed thing on screen.
 *
 * Wall height is treated as 260cm, so a 100×140 print genuinely occupies more
 * of the wall than a 30×40 one. The comparison is honest, not decorative.
 */
const WALL_CM = 260

const ROOMS: Record<Room, { label: string; wall: string; floor: string }> = {
  living: { label: 'Living room', wall: '#e7e2da', floor: '#cfc6b8' },
  kitchen: { label: 'Kitchen', wall: '#e4e1db', floor: '#bdb3a3' },
  bedroom: { label: 'Bedroom', wall: '#e9e4dc', floor: '#d3cabc' },
}

/** Height of the print as a % of the scene, given the room's wall height. */
const scaleFor = (longCm: number, orientation: Orientation) => {
  const cm = orientation === 'portrait' ? longCm : longCm * (100 / 140)
  return (cm / WALL_CM) * 100
}

export function RoomScene({
  src,
  alt,
  room,
  sizeId,
  orientation,
  frame,
  count = 1,
}: {
  src: string
  alt: string
  room: Room
  sizeId: string
  orientation: Orientation
  frame: FrameStyle
  count?: 1 | 2 | 3
}) {
  const size = SIZES.find((s) => s.id === sizeId) ?? SIZES[1]
  const heightPct = scaleFor(size.long, orientation)
  const scene = ROOMS[room]

  return (
    <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16 / 10' }}>
      {/* wall + floor */}
      <div className="absolute inset-0" style={{ background: scene.wall }} />
      <div className="absolute inset-x-0 bottom-0 h-[22%]" style={{ background: scene.floor }} />
      {/* soft daylight from the left */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(100deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.05) 100%)',
        }}
      />

      {/* the print(s), hung at eye level */}
      <div
        className="absolute inset-x-0 flex items-end justify-center gap-[3%]"
        style={{ top: '14%', height: `${heightPct}%` }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-full">
            <div className="h-full" style={{ aspectRatio: orientation === 'portrait' ? `${size.short} / ${size.long}` : `${size.long} / ${size.short}` }}>
              <FramedPrint
                src={src}
                alt={alt}
                size={size}
                orientation={orientation}
                frame={frame === 'none' ? 'black' : frame}
              />
            </div>
          </div>
        ))}
      </div>

      {/* furniture — silhouettes only, never competing with the print */}
      {room === 'living' && (
        <div className="absolute inset-x-0 bottom-[22%] flex items-end justify-center">
          <div className="relative h-[70px] w-[54%] max-w-[420px] md:h-[86px]">
            <div className="absolute inset-x-0 bottom-[14px] top-0 rounded-[3px] bg-[#a89684]/85" />
            <div className="absolute bottom-0 left-[8%] h-[16px] w-[3px] bg-[#8e7d6c]" />
            <div className="absolute bottom-0 right-[8%] h-[16px] w-[3px] bg-[#8e7d6c]" />
            {/* lamp */}
            <div className="absolute -top-[26px] left-[10%] h-[26px] w-[30px] rounded-t-full bg-[#f3efe8]" />
          </div>
        </div>
      )}

      {room === 'kitchen' && (
        <>
          <div className="absolute inset-x-0 bottom-[22%] h-[62px] bg-[#9d9184]/80 md:h-[78px]" />
          <div className="absolute inset-x-0 bottom-[calc(22%+62px)] h-[5px] bg-[#efeae1] md:bottom-[calc(22%+78px)]" />
          {/* pendant lights */}
          {[26, 74].map((left) => (
            <div key={left} className="absolute top-0" style={{ left: `${left}%` }}>
              <div className="mx-auto h-[26%] w-[1px] bg-[#a89684]/70" />
              <div className="h-[16px] w-[34px] -translate-x-1/2 rounded-b-full bg-[#8e7d6c]/80" />
            </div>
          ))}
        </>
      )}

      {room === 'bedroom' && (
        <div className="absolute inset-x-0 bottom-[22%] flex items-end justify-center">
          <div className="h-[54px] w-[46%] max-w-[360px] rounded-t-[4px] bg-[#b3a595]/85 md:h-[66px]" />
        </div>
      )}

      <p className="absolute left-4 top-4 text-[10px] uppercase tracking-[0.2em] text-ink/50">
        {scene.label}
      </p>
    </div>
  )
}
