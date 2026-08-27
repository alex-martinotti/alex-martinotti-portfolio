import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

interface Pending {
  src: string
  rect: { top: number; left: number; width: number; height: number }
}

interface Ctx {
  /** Animate `src` growing from `rect` to fill the screen, then route to `path`. */
  expandTo: (src: string, rect: DOMRect, path: string) => void
}

const ProjectTransitionContext = createContext<Ctx | null>(null)

export function useProjectTransition() {
  const ctx = useContext(ProjectTransitionContext)
  if (!ctx) throw new Error('useProjectTransition must be used within ProjectTransitionProvider')
  return ctx
}

/**
 * "Entering the image": the clicked row's photo grows to fill the viewport,
 * the route swaps underneath while fully covered, then the overlay fades to
 * reveal the project page's own hero (same image, already in place).
 */
export function ProjectTransitionProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null)
  const [phase, setPhase] = useState<'expanding' | 'fading'>('expanding')
  const navigate = useNavigate()
  const timers = useRef<number[]>([])

  const expandTo = useCallback(
    (src: string, rect: DOMRect, path: string) => {
      timers.current.forEach((t) => window.clearTimeout(t))
      timers.current = []

      setPending({ src, rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height } })
      setPhase('expanding')
      navigate(path)

      timers.current.push(window.setTimeout(() => setPhase('fading'), 550))
      timers.current.push(window.setTimeout(() => setPending(null), 900))
    },
    [navigate],
  )

  return (
    <ProjectTransitionContext.Provider value={{ expandTo }}>
      {children}
      {pending && (
        <motion.img
          src={pending.src}
          alt=""
          className="pointer-events-none fixed z-[300] object-cover grayscale contrast-110"
          initial={{
            top: pending.rect.top,
            left: pending.rect.left,
            width: pending.rect.width,
            height: pending.rect.height,
            opacity: 1,
          }}
          animate={
            phase === 'fading'
              ? { top: 0, left: 0, width: '100vw', height: '100vh', opacity: 0 }
              : { top: 0, left: 0, width: '100vw', height: '100vh', opacity: 1 }
          }
          transition={
            phase === 'fading'
              ? { duration: 0.35, ease: 'easeInOut' }
              : { duration: 0.55, ease: [0.76, 0, 0.24, 1] }
          }
        />
      )}
    </ProjectTransitionContext.Provider>
  )
}
