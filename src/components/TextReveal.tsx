import { motion } from 'framer-motion'
import type { ReactNode, ElementType } from 'react'

interface TextRevealProps {
  children: ReactNode
  delay?: number
  className?: string
  /** Wrapper tag — use "span" when nesting inside a heading. */
  as?: ElementType
  /** Set false for above-the-fold content that should reveal on mount rather than wait for scroll. */
  inView?: boolean
}

export function TextReveal({ children, delay = 0, className = '', as = 'div', inView = true }: TextRevealProps) {
  const Wrapper = as
  const revealProps = inView
    ? { whileInView: { y: '0%' }, viewport: { once: true, amount: 0.3 } }
    : { animate: { y: '0%' } }

  return (
    <Wrapper className={`block overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: '110%' }}
        {...revealProps}
        transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </Wrapper>
  )
}
