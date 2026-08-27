import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCursor } from '../lib/cursor-context'
import { BrowsePanel } from './BrowsePanel'

/**
 * AM (top-left, a signature/home-link) and Menu (top-right, the nav trigger)
 * float independently rather than sharing a header bar — small, precise
 * marks rather than a corporate nav strip. Opening the menu darkens and
 * slightly shrinks whatever page is behind it, so the panel reads as
 * sliding in as another layer regardless of that page's own background.
 */
export function Navigation({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { setMode } = useCursor()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [open])

  /**
   * The panel scales the whole page behind it, and scaling a *playing* video
   * makes the browser re-rasterise every frame — the single biggest cause of
   * the menu feeling sluggish. Park the autoplaying hero while the panel is
   * open (it's hidden anyway) and resume it on close. Only `autoplay` videos
   * are touched, so a project film the viewer started is left alone.
   */
  useEffect(() => {
    const heroes = Array.from(document.querySelectorAll('video')).filter((v) => v.autoplay)
    heroes.forEach((v) => {
      if (open) v.pause()
      else void v.play().catch(() => {})
    })
  }, [open])

  const hasDarkHero = location.pathname === '/' || location.pathname.startsWith('/work/')
  const overDark = open || (hasDarkHero && !scrolled)
  const tone = overDark ? 'text-white' : 'text-ink'

  return (
    <>
      <Link
        to="/"
        onMouseEnter={() => setMode('hover')}
        onMouseLeave={() => setMode('default')}
        className="group fixed left-6 top-5 z-50 md:left-10 md:top-7"
      >
        <span className="relative inline-block">
          <span className={`block font-display text-sm font-bold tracking-[0.2em] transition-all duration-300 group-hover:tracking-[0.28em] ${tone}`}>
            AM
          </span>
          <span
            aria-hidden="true"
            className={`absolute inset-0 block font-display text-sm font-bold tracking-[0.2em] opacity-0 transition-all duration-300 group-hover:translate-x-[1.5px] group-hover:translate-y-[1px] group-hover:opacity-30 ${tone}`}
          >
            AM
          </span>
        </span>
      </Link>

      <button
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setMode('hover')}
        onMouseLeave={() => setMode('default')}
        className="group fixed right-6 top-5 z-50 md:right-10 md:top-7"
      >
        <span
          className={`inline-block text-xs font-medium uppercase tracking-[0.2em] transition-all duration-300 group-hover:tracking-[0.35em] ${tone}`}
        >
          {open ? 'Close' : 'Menu'}
        </span>
        <span
          className={`mt-1.5 block h-px w-full origin-right scale-x-0 transition-transform duration-300 group-hover:scale-x-100 ${
            overDark ? 'bg-white' : 'bg-ink'
          }`}
        />
      </button>

      <BrowsePanel open={open} onClose={() => setOpen(false)} />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-30 bg-black"
        initial={false}
        animate={{ opacity: open ? 0.5 : 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      />

      <motion.div
        animate={{ scale: open ? 0.97 : 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ willChange: open ? 'transform' : 'auto' }}
      >
        {children}
      </motion.div>
    </>
  )
}
