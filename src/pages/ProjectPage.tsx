import { useEffect } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { projects } from '../data/projects'
import { useCursor } from '../lib/cursor-context'
import { PageTransition } from '../components/PageTransition'
import { useProjectTransition } from '../lib/project-transition'
import { usePageMeta } from '../lib/use-page-meta'
import { Footer } from '../components/Footer'

export function ProjectPage() {
  const { slug } = useParams()
  const { setMode } = useCursor()
  const { expandTo } = useProjectTransition()
  const index = projects.findIndex((p) => p.slug === slug)
  const found = index === -1 ? null : projects[index]
  usePageMeta(found?.title, found ? `${found.title} — ${found.categories.join(', ')} by Alex Martinotti. ${found.description}` : undefined)

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
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover grayscale contrast-110 brightness-90"
          />
          <div className="absolute inset-0 bg-black/40" />

          <Link
            to="/projects"
            onMouseEnter={() => setMode('hover')}
            onMouseLeave={() => setMode('default')}
            className="absolute left-6 top-24 z-10 text-xs uppercase tracking-[0.3em] text-white/70 transition-colors duration-300 hover:text-white md:left-10 md:top-28"
          >
            ← All projects
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

        <section className="grid gap-10 px-6 py-20 md:grid-cols-[minmax(0,1fr)_auto] md:gap-16 md:px-10 md:py-28">
          <p className="max-w-xl text-xl text-ink md:text-2xl">{project.description}</p>
          <dl className="flex flex-wrap gap-x-10 gap-y-5 text-xs uppercase tracking-[0.2em] md:flex-col md:gap-4 md:text-right">
            <div>
              <dt className="text-muted">Client</dt>
              <dd className="mt-1 text-ink">{project.client}</dd>
            </div>
            <div>
              <dt className="text-muted">Year</dt>
              <dd className="mt-1 text-ink">{project.year}</dd>
            </div>
            <div>
              <dt className="text-muted">Work</dt>
              <dd className="mt-1 text-ink">{project.categories.join(' / ')}</dd>
            </div>
          </dl>
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
              <img
                src={src}
                alt={`${project.title} — still ${i + 1}`}
                loading="lazy"
                decoding="async"
                className="w-full object-cover grayscale contrast-110"
              />
            </motion.div>
          ))}
        </section>

        <section className="flex flex-col gap-6 border-t border-line px-6 py-16 md:flex-row md:items-end md:justify-between md:px-10 md:py-20">
          <p className="max-w-md text-lg text-muted md:text-xl">Something like this in mind for your brand?</p>
          <Link
            to="/contact"
            onMouseEnter={() => setMode('hover')}
            onMouseLeave={() => setMode('default')}
            className="inline-flex items-center gap-3 self-start border-b border-ink pb-1 font-display text-xl font-black uppercase tracking-tight transition-colors duration-300 hover:text-muted md:self-auto md:text-2xl"
          >
            Start a project <span>→</span>
          </Link>
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

      <Footer />
    </PageTransition>
  )
}
