import { useEffect } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { projects } from '../data/projects'
import { useCursor } from '../lib/cursor-context'
import { PageTransition } from '../components/PageTransition'
import { useProjectTransition } from '../lib/project-transition'

export function ProjectPage() {
  const { slug } = useParams()
  const { setMode } = useCursor()
  const { expandTo } = useProjectTransition()
  const index = projects.findIndex((p) => p.slug === slug)

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [slug])

  if (index === -1) return <Navigate to="/projects" replace />

  const project = projects[index]
  const next = projects[(index + 1) % projects.length]

  return (
    <PageTransition>
      <article>
        <section className="relative flex h-svh min-h-[560px] w-full items-end overflow-hidden">
          <img
            src={project.cover}
            alt={project.title}
            className="absolute inset-0 h-full w-full object-cover grayscale contrast-110 brightness-90"
          />
          <div className="absolute inset-0 bg-black/40" />

          <Link
            to="/projects"
            onMouseEnter={() => setMode('hover')}
            onMouseLeave={() => setMode('default')}
            className="absolute left-6 top-24 z-10 text-xs uppercase tracking-[0.3em] text-white/70 transition-colors duration-300 hover:text-white md:left-10 md:top-28"
          >
            ← Archive
          </Link>

          <div className="relative z-10 flex w-full items-end justify-between gap-6 px-6 pb-16 text-white md:px-10 md:pb-20">
            <div>
              <p className="mb-4 text-xs uppercase tracking-[0.4em] text-white/70 md:text-sm">
                Project {String(index + 1).padStart(2, '0')} — {project.year}
              </p>
              <h1 className="font-display text-[clamp(2.5rem,10vw,8rem)] font-black uppercase leading-[0.85] tracking-tight">
                {project.title}
              </h1>
              <p className="mt-4 text-xs uppercase tracking-[0.3em] text-white/60 md:text-sm">
                {project.categories.join(' / ')}
              </p>
            </div>
            <span className="hidden shrink-0 text-xs uppercase tracking-[0.3em] text-white/50 md:block">
              {String(index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
            </span>
          </div>
        </section>

        <section className="px-6 py-20 md:px-10 md:py-28">
          <p className="max-w-xl text-xl text-ink md:text-2xl">{project.description}</p>
        </section>

        <section className="flex flex-col gap-6 px-6 pb-20 md:px-10 md:pb-28">
          {project.films.map((film) => (
            <motion.div
              key={film.src}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className={film.aspect === 'vertical' ? 'mx-auto w-full max-w-sm' : 'w-full'}
            >
              <video
                src={film.src}
                poster={film.poster}
                controls
                playsInline
                preload="none"
                className="w-full bg-black"
              />
            </motion.div>
          ))}
        </section>

        <section className="flex flex-col gap-6 px-6 pb-20 md:px-10 md:pb-28">
          {project.gallery.map((src, i) => (
            <motion.div
              key={src}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className={i % 3 === 1 ? 'md:w-2/3' : 'w-full'}
            >
              <img src={src} alt="" loading="lazy" className="w-full object-cover grayscale contrast-110" />
            </motion.div>
          ))}
        </section>

        <Link
          to={`/work/${next.slug}`}
          onClick={(e) => {
            e.preventDefault()
            expandTo(next.cover, e.currentTarget.getBoundingClientRect(), `/work/${next.slug}`)
          }}
          onMouseEnter={() => setMode('project')}
          onMouseLeave={() => setMode('default')}
          className="group flex items-center justify-between border-t border-line px-6 py-16 md:px-10 md:py-24"
        >
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted">Next project</p>
            <h3 className="font-display text-[clamp(2rem,7vw,5rem)] font-black uppercase leading-none tracking-tight transition-transform duration-500 group-hover:translate-x-3">
              {next.title}
            </h3>
          </div>
          <span className="hidden text-2xl transition-transform duration-500 group-hover:translate-x-2 md:block">→</span>
        </Link>
      </article>
    </PageTransition>
  )
}
