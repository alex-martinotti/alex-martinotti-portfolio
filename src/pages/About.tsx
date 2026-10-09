import { useState } from 'react'
import { PageTransition } from '../components/PageTransition'
import { usePageMeta } from '../lib/use-page-meta'
import { TextReveal } from '../components/TextReveal'
import { Footer } from '../components/Footer'

/**
 * Drop the real portrait at public/media/about/portrait.jpg — it'll appear
 * automatically, no code change needed. Falls back to a placeholder until then.
 */
const PORTRAIT_SRC = '/media/about/portrait.jpg'
const PORTRAIT_FALLBACK = 'https://picsum.photos/seed/alex-portrait/1200/1500'

export function About() {
  usePageMeta('About', 'Alex Martinotti is a Luxembourg-based filmmaker and photographer making brand, travel and event films.')
  const [src, setSrc] = useState(PORTRAIT_SRC)

  return (
    <PageTransition>
      <div className="mx-auto grid max-w-6xl gap-12 px-6 pb-24 pt-32 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-16 md:px-10 md:pt-40">
        {/* Square to match the portrait's own framing; it carries its own grain, so no overlay. */}
        <div className="relative aspect-square w-full overflow-hidden">
          <img
            src={src}
            onError={() => setSrc(PORTRAIT_FALLBACK)}
            alt="Alex Martinotti"
            className="h-full w-full object-cover grayscale"
          />
        </div>

        <div className="flex flex-col justify-center">
          <TextReveal as="span" inView={false}>
            <h1 className="font-display text-[clamp(2.5rem,7vw,5.5rem)] font-black uppercase leading-[0.9] tracking-tight">
              Who am I?
            </h1>
          </TextReveal>

          <TextReveal inView={false} delay={0.12} className="mt-8 max-w-md">
            <p className="text-base text-muted md:text-lg">
              Alex. Filmmaker, based in Luxembourg or wherever the flight lands next.
            </p>
          </TextReveal>

          <TextReveal inView={false} delay={0.2} className="mt-4 max-w-md">
            <p className="text-base text-muted md:text-lg">
              I make things that look expensive and feel human — mostly by accident. No
              house style, no agency voice. Just an eye I trust and a camera I've mostly
              stopped dropping.
            </p>
          </TextReveal>
        </div>
      </div>

      <Footer />
    </PageTransition>
  )
}
