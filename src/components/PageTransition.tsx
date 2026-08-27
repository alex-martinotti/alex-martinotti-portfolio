import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * Directional wipe used for every route change — new content sweeps in from the
 * left, the outgoing page is cut away to the right. Reads as an edit, not a fade.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ clipPath: 'inset(0 100% 0 0)' }}
      animate={{ clipPath: 'inset(0 0% 0 0)' }}
      exit={{ clipPath: 'inset(0 0 0 100%)' }}
      transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
    >
      {children}
    </motion.div>
  )
}
