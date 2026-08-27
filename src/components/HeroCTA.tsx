import { useState } from 'react'
import { Link } from 'react-router-dom'

/**
 * An editorial CTA "door" — invisible at rest, a thin outline draws itself
 * in on hover, the label nudges toward its arrow, and the whole thing
 * compresses briefly on click. "left"/"right" mirror each other: the
 * outline grows from the outer edge inward and the label nudges outward,
 * so the two CTAs read as one balanced system moving in opposite directions.
 * No fills, no shadows, no gradients — just line, type and motion.
 */
export function HeroCTA({
  to,
  label,
  direction,
  onEnter,
  onLeave,
}: {
  to: string
  label: string
  direction: 'left' | 'right'
  onEnter: () => void
  onLeave: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const arrow = direction === 'left' ? '←' : '→'
  const isLeft = direction === 'left'

  return (
    <Link
      to={to}
      onMouseEnter={() => {
        setHovered(true)
        onEnter()
      }}
      onMouseLeave={() => {
        setHovered(false)
        setPressed(false)
        onLeave()
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      className={`group relative flex items-center px-6 py-10 transition-transform duration-150 md:px-8 md:py-14 ${
        isLeft ? 'justify-start' : 'justify-end'
      }`}
      style={{ transform: pressed ? 'scale(0.98)' : 'scale(1)' }}
    >
      {/* drawn outline — horizontal segments grow from the outer edge, vertical segments from the top */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 h-px w-full bg-current transition-transform duration-500 ease-out"
        style={{ transformOrigin: isLeft ? 'left' : 'right', transform: hovered ? 'scaleX(1)' : 'scaleX(0)' }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-current transition-transform duration-500 ease-out delay-100"
        style={{ transformOrigin: isLeft ? 'left' : 'right', transform: hovered ? 'scaleX(1)' : 'scaleX(0)' }}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute top-0 h-full w-px origin-top bg-current transition-transform duration-500 ease-out ${
          isLeft ? 'left-0' : 'right-0'
        }`}
        style={{ transform: hovered ? 'scaleY(1)' : 'scaleY(0)' }}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute top-0 h-full w-px origin-top bg-current transition-transform delay-150 duration-500 ease-out ${
          isLeft ? 'right-0' : 'left-0'
        }`}
        style={{ transform: hovered ? 'scaleY(1)' : 'scaleY(0)' }}
      />

      <span
        className={`flex items-center gap-3 font-display text-3xl font-black uppercase leading-none tracking-tight transition-transform duration-300 ease-out sm:text-4xl md:text-5xl ${
          isLeft ? '' : 'flex-row-reverse'
        }`}
        style={{ transform: hovered ? `translateX(${isLeft ? -4 : 4}px)` : 'translateX(0)' }}
      >
        {label}
        <span
          className="text-xl transition-all duration-300 ease-out md:text-2xl"
          style={{
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateX(0)' : `translateX(${isLeft ? 8 : -8}px)`,
          }}
        >
          {arrow}
        </span>
      </span>
    </Link>
  )
}
