import { useState, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { projects } from '../data/projects'
import { useCursor } from '../lib/cursor-context'
import { PageTransition } from '../components/PageTransition'
import { useProjectTransition } from '../lib/project-transition'

/**
 * Desktop: hovering a title floats a preview image beside the list, trailing the
 * pointer's vertical position with a light spring. Mobile: no hover is required —
 * each row carries its own small static thumbnail and is tap-navigable.
 */
export function ProjectsIndex() {
  const { setMode } = useCursor()
  const { expandTo } = useProjectTransition()
  const [hovered, setHovered] = useState<number | null>(null)
  const y = useMotionValue(240)
  const springY = useSpring(y, { damping: 26, stiffness: 220, mass: 0.6 })

  const handleMouseMove = (e: MouseEvent) => {
    const clamped = Math.min(Math.max(e.clientY - 160, 24), window.innerHeight - 420)
    y.set(clamped)
  }

  const active = hovered !== null ? projects[hovered] : null

  return (
    <PageTransition>
      <div onMouseMove={handleMouseMove} className="relative mx-auto min-h-svh max-w-6xl px-6 pb-24 pt-32 md:px-10 md:pt-40">
        <p className="mb-10 text-xs uppercase tracking-[0.3em] text-muted md:mb-16">
          Index — {String(projects.length).padStart(2, '0')} projects
        </p>

        <nav className="lg:max-w-2xl" onMouseLeave={() => setHovered(null)}>
          {projects.map((project, i) => (
            <Link
              key={project.slug}
              to={`/work/${project.slug}`}
              onClick={(e) => {
                e.preventDefault()
                expandTo(project.cover, e.currentTarget.getBoundingClientRect(), `/work/${project.slug}`)
              }}
              onMouseEnter={() => {
                setHovered(i)
                setMode('project')
              }}
              onMouseLeave={() => setMode('default')}
              className="group flex items-baseline gap-4 border-t border-line py-5 transition-opacity duration-300 last:border-b md:py-6"
              style={{ opacity: hovered === null || hovered === i ? 1 : 0.35 }}
            >
              <span
                className="w-8 shrink-0 text-sm transition-all duration-300 md:text-base"
                style={{
                  color: hovered === i ? 'var(--color-ink)' : 'var(--color-muted)',
                  transform: hovered === i ? 'scale(1.15)' : 'scale(1)',
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>

              <span className="flex-1 font-display text-2xl font-black uppercase leading-[0.95] tracking-tight transition-transform duration-300 group-hover:translate-x-2 sm:text-3xl md:text-5xl">
                {project.title}
              </span>

              <span
                className="hidden shrink-0 text-xs uppercase tracking-[0.2em] text-muted transition-all duration-300 lg:block"
                style={{
                  opacity: hovered === i ? 1 : 0,
                  transform: hovered === i ? 'translateY(0)' : 'translateY(-4px)',
                }}
              >
                {project.categories[0]} / {project.year}
              </span>
            </Link>
          ))}
        </nav>

        <motion.div
          style={{ y: springY }}
          className="pointer-events-none fixed right-10 top-0 hidden w-[24vw] max-w-sm lg:block"
        >
          <AnimatePresence mode="wait">
            {active && (
              <motion.div
                key={active.slug}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="aspect-[4/5] w-full overflow-hidden"
              >
                <img
                  src={active.cover}
                  alt={active.title}
                  className="h-full w-full object-cover grayscale contrast-110"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </PageTransition>
  )
}
