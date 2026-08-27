import { useEffect, useState } from 'react'
import type { DesktopRatio } from '../../data/wallpapers'

/**
 * A laptop showing the photograph as an actual desktop wallpaper — menu bar and
 * dock are drawn over the image, and the screen reshapes to whichever aspect
 * ratio the visitor picked so they see the true crop they'd be buying.
 */

const RATIO_CSS: Record<DesktopRatio, string> = {
  '16:9': '16 / 9',
  '16:10': '16 / 10',
  '4:3': '4 / 3',
  '5:4': '5 / 4',
}

const MENUS = ['Finder', 'File', 'Edit', 'View', 'Go', 'Window', 'Help']

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])
  return now
}

export function DesktopScreen({
  src,
  ratio,
  className = '',
}: {
  src: string
  ratio: DesktopRatio
  className?: string
}) {
  const now = useClock()
  const stamp = `${now.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })}  ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}`

  return (
    <div className={`mx-auto w-full ${className}`}>
      {/* lid */}
      <div className="rounded-[1.1%/2.4%] bg-neutral-900 p-[0.7%] shadow-[0_24px_60px_-24px_rgba(0,0,0,0.45)] ring-1 ring-black/20">
        <div
          className="relative w-full overflow-hidden rounded-[0.5%/1.2%] bg-black"
          style={{ aspectRatio: RATIO_CSS[ratio] }}
        >
          <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />

          {/* menu bar */}
          <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between bg-black/25 px-[1.6%] py-[0.7%] text-[9px] text-white backdrop-blur-md">
            <div className="flex items-center gap-[10px]">
              <svg width="9" height="11" viewBox="0 0 10 12" fill="currentColor" aria-hidden="true">
                <path d="M6.8 1.9c.4-.5.7-1.2.6-1.9-.6 0-1.4.4-1.8 1-.4.5-.7 1.2-.6 1.9.7 0 1.4-.4 1.8-1Zm.6 1.2c-1 0-1.9.6-2.4.6-.5 0-1.2-.6-2-.6C1.9 3.1.8 3.8.2 5c-1 1.9-.3 4.6.8 6.1.5.7 1.1 1.5 1.9 1.5.8 0 1-.5 2-.5s1.1.5 2 .5c.8 0 1.3-.7 1.8-1.4.6-.8.8-1.6.8-1.7 0 0-1.6-.6-1.6-2.4 0-1.5 1.2-2.2 1.3-2.3-.7-1-1.8-1.1-2.2-1.1l-.6.4Z" />
              </svg>
              {MENUS.map((m, i) => (
                <span key={m} className={i === 0 ? 'font-semibold' : 'opacity-90'}>
                  {m}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-[9px]">
              <svg width="11" height="9" viewBox="0 0 13 10" fill="currentColor" aria-hidden="true" opacity="0.9">
                <rect x="0" y="6" width="2.4" height="3.4" rx="0.6" />
                <rect x="3.5" y="4.2" width="2.4" height="5.2" rx="0.6" />
                <rect x="7" y="2" width="2.4" height="7.4" rx="0.6" />
                <rect x="10.5" y="0" width="2.4" height="9.4" rx="0.6" />
              </svg>
              <svg width="11" height="8" viewBox="0 0 13 9" fill="currentColor" aria-hidden="true" opacity="0.9">
                <path d="M6.5 8.6 4.7 6.8a2.5 2.5 0 0 1 3.6 0L6.5 8.6Z" />
                <path d="M2.8 4.8a5.3 5.3 0 0 1 7.4 0" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
                <path d="M0.8 2.7a8.2 8.2 0 0 1 11.4 0" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
              </svg>
              <span className="tabular-nums opacity-95">{stamp}</span>
            </div>
          </div>

          {/* dock */}
          <div className="absolute bottom-[1.6%] left-1/2 z-20 flex -translate-x-1/2 items-end gap-[0.9%] rounded-[14%/22%] bg-white/18 px-[1%] py-[0.6%] backdrop-blur-md ring-1 ring-white/15">
            {[205, 140, 25, 300, 180, 45, 265, 110].map((hue, i) => (
              <div
                key={i}
                className="aspect-square w-[2.9cqw] min-w-[16px] rounded-[24%] shadow-sm"
                style={{
                  background: `linear-gradient(160deg, hsl(${hue} 48% 64%), hsl(${hue + 20} 44% 46%))`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* base */}
      <div className="mx-auto h-[6px] w-[74%] rounded-b-[10px] bg-neutral-800 shadow-[0_10px_18px_-10px_rgba(0,0,0,0.5)]" />
      <div className="mx-auto h-[3px] w-[16%] rounded-b-full bg-neutral-700/70" />
    </div>
  )
}
