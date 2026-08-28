import { SIZES, sizeLabel, type Orientation, type PrintSize } from '../data/prints'

/**
 * Nested outlines at true relative scale beside a 175cm figure, so the jump
 * from 30×40 to 100×140 is understood rather than guessed at. The selected
 * size is filled; the rest are outlines.
 *
 * Every dimension is a percentage of the scene box's own height — the box has
 * a fixed aspect ratio, so those percentages always resolve. (Nesting them
 * inside an auto-height flex parent silently collapses them to nothing.)
 */
const PERSON_CM = 175
const SCENE_CM = 215 // wall height represented by the diagram
const FLOOR_PCT = 7 // where everything stands

export function SizeGuide({
  orientation,
  selectedId,
  onSelect,
}: {
  orientation: Orientation
  selectedId: string
  onSelect?: (size: PrintSize) => void
}) {
  /** cm → % of the scene box height. */
  const pct = (cm: number) => (cm / SCENE_CM) * (100 - FLOOR_PCT)

  // Largest first so the smaller outlines draw in front of the bigger ones.
  const ordered = [...SIZES].sort((a, b) => b.long - a.long)

  return (
    <div className="w-full">
      <div className="relative w-full overflow-hidden bg-[#efece6]" style={{ aspectRatio: '16 / 9' }}>
        <div className="absolute inset-x-0 bottom-0 bg-[#ddd7cc]" style={{ height: `${FLOOR_PCT}%` }} />

        {ordered.map((s) => {
          const hCm = orientation === 'portrait' ? s.long : s.short
          const wCm = orientation === 'portrait' ? s.short : s.long
          const active = s.id === selectedId
          return (
            <button
              key={s.id}
              onClick={() => onSelect?.(s)}
              className="absolute transition-colors duration-300"
              style={{
                left: '42%',
                transform: 'translateX(-50%)',
                bottom: `${FLOOR_PCT + 6}%`,
                height: `${pct(hCm)}%`,
                aspectRatio: `${wCm} / ${hCm}`,
                border: `1px solid ${active ? '#17171a' : 'rgba(23,23,26,0.3)'}`,
                background: active ? 'rgba(23,23,26,0.07)' : 'transparent',
                zIndex: active ? 20 : 10,
              }}
              aria-label={sizeLabel(s, orientation)}
              aria-pressed={active}
            >
              <span
                className={`absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] tracking-[0.08em] ${
                  active ? 'text-ink' : 'text-ink/40'
                }`}
              >
                {sizeLabel(s, orientation)}
              </span>
            </button>
          )
        })}

        {/* 175 cm figure, standing on the same floor line */}
        <div
          className="absolute flex flex-col items-center"
          style={{
            right: '14%',
            bottom: `${FLOOR_PCT}%`,
            height: `${pct(PERSON_CM)}%`,
            // a person is roughly a quarter as wide as they are tall
            aspectRatio: '1 / 4',
          }}
          aria-hidden="true"
        >
          <div className="rounded-full bg-[#17171a]/35" style={{ height: '13%', aspectRatio: '1' }} />
          <div
            className="mt-[1.5%] w-full rounded-t-[48%] bg-[#17171a]/35"
            style={{ height: '48%' }}
          />
          <div className="w-[76%] bg-[#17171a]/35" style={{ height: '37.5%' }} />
        </div>
      </div>

      <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-muted">
        Shown to scale against a 175 cm figure
      </p>
    </div>
  )
}
