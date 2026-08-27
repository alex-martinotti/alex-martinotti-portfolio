import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useCursor } from '../lib/cursor-context'

/**
 * A small trailing mark — never text. Default is a solid dot; hovering anything
 * clickable shrinks the dot and brings up a secondary ring, offset a few
 * pixels off-center (a small registration shift, echoing the AM mark), which
 * under mix-blend-difference reads as a distinct visual change against any
 * background. Project items get a slightly larger ring as a subtle
 * contextual cue. Clicking compresses it briefly. The native cursor is never
 * hidden, so clicking, scrolling, trackpad gestures and text selection all
 * behave exactly as expected. Disabled entirely on touch/coarse pointers.
 *
 * Centering uses margin math (not transform: translate) so it never conflicts
 * with the scale/position values Framer animates via inline `transform`.
 * Mouse position itself is tracked with motion values, not React state, so
 * pointer movement never triggers a re-render.
 */
export function CustomCursor() {
  const { mode } = useCursor()
  const [enabled, setEnabled] = useState(false)
  const [pressed, setPressed] = useState(false)
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const springX = useSpring(x, { damping: 22, stiffness: 620, mass: 0.35 })
  const springY = useSpring(y, { damping: 22, stiffness: 620, mass: 0.35 })

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    setEnabled(fine)
    if (!fine) return

    const move = (e: MouseEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
    }
    const down = () => setPressed(true)
    const up = () => setPressed(false)

    window.addEventListener('mousemove', move)
    window.addEventListener('mousedown', down)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mousedown', down)
      window.removeEventListener('mouseup', up)
    }
  }, [x, y])

  if (!enabled) return null

  const isHover = mode !== 'default'
  const ringSize = mode === 'project' ? 40 : 26
  const pressScale = pressed ? 0.8 : 1
  const dotSize = 8

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[100] mix-blend-difference"
      style={{ x: springX, y: springY }}
    >
      <motion.div
        animate={{
          width: dotSize,
          height: dotSize,
          marginLeft: -(dotSize / 2),
          marginTop: -(dotSize / 2),
          scale: (isHover ? 0.35 : 1) * pressScale,
          opacity: 1,
        }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="absolute left-1/2 top-1/2 rounded-full bg-white"
      />
      <motion.div
        animate={{
          width: ringSize,
          height: ringSize,
          marginLeft: -(ringSize / 2) + (isHover ? 4 : 0),
          marginTop: -(ringSize / 2) + (isHover ? 3 : 0),
          opacity: isHover ? 1 : 0,
          scale: pressScale,
        }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="absolute left-1/2 top-1/2 rounded-full border border-white"
      />
    </motion.div>
  )
}
