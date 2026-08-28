import { useEffect, useState } from 'react'

/**
 * A believable iPhone with the photograph set as its actual wallpaper — the
 * iOS chrome is drawn over the image rather than the image being dropped into
 * an empty frame. App glyphs are our own abstract shapes, not Apple artwork.
 *
 * The photograph is always the hero: chrome sits at low contrast over it and
 * the frame itself is deliberately plain (no 3D, no gloss, one soft shadow).
 */

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])
  return now
}

const time = (d: Date) =>
  d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })

const longDate = (d: Date) =>
  d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

/** Signal · wifi · battery, drawn small and light so they read as real chrome. */
function StatusIcons() {
  return (
    <div className="flex items-center gap-[3px] text-white">
      <svg width="15" height="10" viewBox="0 0 17 11" fill="currentColor" aria-hidden="true">
        <rect x="0" y="7" width="3" height="4" rx="0.7" />
        <rect x="4.5" y="5" width="3" height="6" rx="0.7" />
        <rect x="9" y="2.5" width="3" height="8.5" rx="0.7" />
        <rect x="13.5" y="0" width="3" height="11" rx="0.7" />
      </svg>
      <svg width="14" height="10" viewBox="0 0 16 11" fill="currentColor" aria-hidden="true">
        <path d="M8 10.5 5.8 8.2a3.1 3.1 0 0 1 4.4 0L8 10.5Z" />
        <path
          d="M3.4 5.9a6.5 6.5 0 0 1 9.2 0"
          stroke="currentColor"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M1 3.4a10 10 0 0 1 14 0"
          stroke="currentColor"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      <svg width="22" height="11" viewBox="0 0 25 12" aria-hidden="true">
        <rect x="0.5" y="0.5" width="20" height="11" rx="3" stroke="currentColor" fill="none" opacity="0.5" />
        <rect x="2" y="2" width="15" height="8" rx="1.8" fill="currentColor" />
        <path d="M22.5 4v4a2.3 2.3 0 0 0 0-4Z" fill="currentColor" opacity="0.5" />
      </svg>
    </div>
  )
}

function AppIcon({ hue, label }: { hue: number; label?: string }) {
  return (
    <div className="flex flex-col items-center gap-[3px]">
      <div
        className="aspect-square w-full rounded-[22%] shadow-sm"
        style={{
          background: `linear-gradient(160deg, hsl(${hue} 45% 62%), hsl(${hue + 18} 42% 44%))`,
        }}
      />
      {label && <span className="text-[5px] text-white/90 drop-shadow">{label}</span>}
    </div>
  )
}

export function IPhoneScreen({
  src,
  mode,
  className = '',
}: {
  src: string
  mode: 'lock' | 'home'
  className?: string
}) {
  const now = useClock()

  return (
    <div className={`relative mx-auto w-full max-w-[300px] ${className}`}>
      {/* device body — thin bezel, one soft shadow, no gloss */}
      <div className="relative aspect-[9/19.5] w-full rounded-[13%/6.2%] bg-neutral-900 p-[2.5%] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)] ring-1 ring-black/20">
        <div className="relative h-full w-full overflow-hidden rounded-[11.5%/5.6%] bg-black">
          {/* the product itself */}
          <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />

          {/* status bar */}
          <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-[8%] pt-[4.5%]">
            <span className="text-[10px] font-semibold text-white drop-shadow-sm">{time(now)}</span>
            <StatusIcons />
          </div>

          {/* dynamic island */}
          <div className="absolute left-1/2 top-[2.6%] z-30 h-[3.4%] w-[30%] -translate-x-1/2 rounded-full bg-black" />

          {mode === 'lock' ? (
            <div className="absolute inset-0 z-10 flex flex-col items-center">
              {/* lock glyph */}
              <svg
                className="mt-[15%] text-white/95 drop-shadow"
                width="13"
                height="17"
                viewBox="0 0 14 18"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M7 0a4 4 0 0 0-4 4v2.2h2V4a2 2 0 1 1 4 0v2.2h2V4a4 4 0 0 0-4-4Z" />
                <rect x="1" y="6.6" width="12" height="11" rx="3" />
              </svg>

              <p className="mt-[3%] text-[10px] font-medium text-white/95 drop-shadow">{longDate(now)}</p>
              <p className="-mt-[1%] text-[52px] font-light leading-none tracking-[-0.03em] text-white drop-shadow-sm">
                {time(now)}
              </p>

              {/* flashlight + camera */}
              <div className="absolute inset-x-0 bottom-[7%] flex items-center justify-between px-[14%]">
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-black/35 backdrop-blur-[2px]"
                  >
                    {i === 0 ? (
                      <svg width="10" height="14" viewBox="0 0 10 14" fill="white" aria-hidden="true">
                        <path d="M2 0h6l-1 3H3L2 0Zm1 4h4v3l-1 7H4L3 7V4Z" />
                      </svg>
                    ) : (
                      <svg width="14" height="12" viewBox="0 0 16 13" fill="white" aria-hidden="true">
                        <path d="M5.6 0h4.8l1 1.8H14a2 2 0 0 1 2 2V11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3.8a2 2 0 0 1 2-2h2.6L5.6 0Zm2.4 4a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8Z" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 z-10 flex flex-col px-[7%] pb-[4%] pt-[16%]">
              {/* a single widget, then two rows of apps — enough to read as a home screen */}
              <div className="mb-[6%] grid grid-cols-4 gap-[5%]">
                <div className="col-span-2 row-span-2 flex aspect-square flex-col justify-between rounded-[12%] bg-white/15 p-[7%] backdrop-blur-md">
                  <p className="text-[6px] font-semibold uppercase tracking-wide text-white/80">
                    {now.toLocaleDateString('en-GB', { weekday: 'short' })}
                  </p>
                  <p className="text-[26px] font-light leading-none text-white">{now.getDate()}</p>
                </div>
                {[210, 25, 150, 340].map((hue, i) => (
                  <AppIcon key={i} hue={hue} />
                ))}
              </div>

              <div className="grid grid-cols-4 gap-x-[5%] gap-y-[7%]">
                {[190, 45, 265, 100, 320, 15, 230, 130].map((hue, i) => (
                  <AppIcon key={i} hue={hue} />
                ))}
              </div>

              {/* dock */}
              <div className="mt-auto grid grid-cols-4 gap-[5%] rounded-[9%] bg-white/15 p-[4%] backdrop-blur-md">
                {[205, 140, 20, 300].map((hue, i) => (
                  <AppIcon key={i} hue={hue} />
                ))}
              </div>
            </div>
          )}

          {/* home indicator */}
          <div className="absolute bottom-[1.2%] left-1/2 z-30 h-[0.45%] w-[32%] -translate-x-1/2 rounded-full bg-white/85" />
        </div>
      </div>
    </div>
  )
}
