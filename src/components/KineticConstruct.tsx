import { useMemo } from 'react'
import { motion } from 'framer-motion'

/**
 * The line assembles itself on entrance: characters resolve out of a blur in a
 * fast wave (not a typewriter — no per-character delay you can consciously
 * track), tracking starts expanded and tightens as it locks into place, and a
 * single thin scan line sweeps through once. ~900ms total, then it's static —
 * a motion identity moment, not a looping effect.
 */
export function KineticConstruct({
  text,
  delay = 0,
  className = '',
}: {
  text: string
  delay?: number
  className?: string
}) {
  const chars = useMemo(() => text.split(''), [text])
  const duration = 0.9
  const charDuration = 0.5
  const stagger = 0.013

  return (
    <span className={`relative inline-block ${className}`}>
      <motion.span
        className="inline-block"
        initial={{ letterSpacing: '0.4em' }}
        animate={{ letterSpacing: '0.04em' }}
        transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {chars.map((ch, i) => (
          <motion.span
            key={i}
            className="inline-block"
            initial={{ opacity: 0, filter: 'blur(6px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: charDuration, delay: delay + i * stagger, ease: 'easeOut' }}
          >
            {ch === ' ' ? ' ' : ch}
          </motion.span>
        ))}
      </motion.span>

      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute top-0 h-full w-px bg-current"
        style={{ boxShadow: '0 0 10px 1px currentColor' }}
        initial={{ left: '-2%', opacity: 0 }}
        animate={{ left: '102%', opacity: [0, 0.9, 0.9, 0] }}
        transition={{ duration, delay, ease: [0.65, 0, 0.35, 1] }}
      />
    </span>
  )
}
