import { FramedPrint, type FrameStyle } from './FramedPrint'
import { SIZES, type Orientation } from '../data/prints'

export type Room = 'living' | 'kitchen' | 'bedroom' | 'office' | 'detail'

export const ROOM_ORDER: Room[] = ['living', 'kitchen', 'bedroom', 'office', 'detail']

export const ROOM_LABELS: Record<Room, string> = {
  living: 'Living room',
  kitchen: 'Kitchen',
  bedroom: 'Bedroom',
  office: 'Office',
  detail: 'Detail',
}

/**
 * Interiors rendered as warm tonal architecture — wall, floor, daylight,
 * furniture silhouettes — with the real framed print hung in them.
 *
 * Scale is honest: the wall is 260cm, so a 100×140 print genuinely covers
 * more of it than a 50×70. Changing size visibly changes the artwork's
 * presence in the room, which is the whole point of these views.
 */
const WALL_CM = 260

const ROOMS: Record<
  Exclude<Room, 'detail'>,
  { wall: string; floor: string; floorPct: number }
> = {
  living: { wall: '#e6e0d6', floor: '#c9bfae', floorPct: 24 },
  kitchen: { wall: '#e3e0d9', floor: '#b8ad9c', floorPct: 22 },
  bedroom: { wall: '#e9e3d9', floor: '#cfc5b5', floorPct: 26 },
  office: { wall: '#e4e2dc', floor: '#c2b8a8', floorPct: 24 },
}

const heightPctFor = (longCm: number, orientation: Orientation) => {
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
}: {
  src: string
  alt: string
  room: Room
  sizeId: string
  orientation: Orientation
  frame: FrameStyle
}) {
  const size = SIZES.find((s) => s.id === sizeId) ?? SIZES[1]

  /* ── Detail: a corner of the frame, enlarged ────────────────────────── */
  if (room === 'detail') {
    return (
      <div
        className="relative w-full overflow-hidden bg-[#ded7cb]"
        style={{ aspectRatio: '4 / 3' }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(115deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 55%, rgba(0,0,0,0.06) 100%)',
          }}
        />
        {/* enlarged and offset so the frame's top-left corner — moulding,
            mount, bevel and the paper edge — sits in the middle of the crop */}
        <div className="absolute left-[-6%] top-[-8%] w-[260%]">
          <FramedPrint
            src={src}
            alt={alt}
            size={size}
            orientation={orientation}
            frame={frame === 'none' ? 'black' : frame}
          />
        </div>
        <p className="absolute bottom-4 left-4 text-[10px] uppercase tracking-[0.2em] text-ink/45">
          Mount, bevel and frame edge
        </p>
      </div>
    )
  }

  const scene = ROOMS[room]
  const artH = heightPctFor(size.long, orientation)
  // Hung so the centre sits near eye level whatever the size.
  const top = Math.max(6, 46 - artH / 2)
  const count = room === 'kitchen' ? 3 : room === 'bedroom' ? 2 : 1

  return (
    <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4 / 3' }}>
      <div className="absolute inset-0" style={{ background: scene.wall }} />
      <div
        className="absolute inset-x-0 bottom-0"
        style={{ height: `${scene.floorPct}%`, background: scene.floor }}
      />
      {/* skirting */}
      <div
        className="absolute inset-x-0"
        style={{ bottom: `${scene.floorPct}%`, height: '1.5%', background: 'rgba(255,255,255,0.55)' }}
      />
      {/* daylight raking in from the left */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(105deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.12) 38%, rgba(0,0,0,0.03) 72%, rgba(0,0,0,0.10) 100%)',
        }}
      />

      {/* the artwork */}
      <div
        className="absolute inset-x-0 flex items-start justify-center gap-[2.5%] px-[8%]"
        style={{ top: `${top}%`, height: `${artH}%` }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="h-full"
            style={{
              aspectRatio:
                orientation === 'portrait'
                  ? `${size.short} / ${size.long}`
                  : `${size.long} / ${size.short}`,
            }}
          >
            <FramedPrint
              src={src}
              alt={alt}
              size={size}
              orientation={orientation}
              frame={frame === 'none' ? 'black' : frame}
            />
          </div>
        ))}
      </div>

      {/* furniture — silhouettes only, always subordinate to the print */}
      {room === 'living' && (
        <div className="absolute inset-x-0" style={{ bottom: `${scene.floorPct}%` }}>
          <div className="relative mx-auto h-[70px] w-[62%] max-w-[440px] md:h-[92px]">
            <div className="absolute inset-x-0 bottom-[13px] top-[16px] rounded-t-[6px] bg-[#b7a794]" />
            <div className="absolute inset-x-[6%] bottom-[13px] top-0 rounded-t-[10px] bg-[#c6b6a2]" />
            <div className="absolute bottom-0 left-[10%] h-[14px] w-[4px] bg-[#8d7d6b]" />
            <div className="absolute bottom-0 right-[10%] h-[14px] w-[4px] bg-[#8d7d6b]" />
          </div>
        </div>
      )}

      {room === 'kitchen' && (
        <>
          <div
            className="absolute inset-x-0"
            style={{ bottom: `${scene.floorPct}%`, height: '20%', background: '#9c9083' }}
          />
          <div
            className="absolute inset-x-0"
            style={{ bottom: `calc(${scene.floorPct}% + 20%)`, height: '2%', background: '#efeae1' }}
          />
        </>
      )}

      {room === 'bedroom' && (
        <div className="absolute inset-x-0" style={{ bottom: `${scene.floorPct}%` }}>
          <div className="mx-auto h-[58px] w-[54%] max-w-[400px] rounded-t-[6px] bg-[#c8bcab] md:h-[76px]" />
        </div>
      )}

      {room === 'office' && (
        <div className="absolute inset-x-0" style={{ bottom: `${scene.floorPct}%` }}>
          <div className="relative mx-auto h-[62px] w-[52%] max-w-[380px] md:h-[80px]">
            <div className="absolute inset-x-0 top-0 h-[5px] bg-[#a4907a]" />
            <div className="absolute bottom-0 left-[8%] top-[5px] w-[4px] bg-[#8d7d6b]" />
            <div className="absolute bottom-0 right-[8%] top-[5px] w-[4px] bg-[#8d7d6b]" />
          </div>
        </div>
      )}
    </div>
  )
}
