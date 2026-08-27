import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useCursor } from '../lib/cursor-context'
import { PageTransition } from '../components/PageTransition'
import { TextReveal } from '../components/TextReveal'
import { KineticConstruct } from '../components/KineticConstruct'
import { HeroCTA } from '../components/HeroCTA'

/** Swap these two paths to change the hero reel. Poster is the first frame. */
const HERO_VIDEO = '/media/hero/reel-landscape.mp4'
const HERO_POSTER = '/media/hero/poster.jpg'

export function Home() {
  const { setMode } = useCursor()
  // Shared by both bottom links: darkens/offsets the hero so either click reads
  // as "sliding into another layer" — the same doorway, two directions.
  const [leaving, setLeaving] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  /**
   * iOS only honours autoplay when the element is *actually* muted at the DOM
   * level, and React's `muted` prop doesn't always land before Safari decides —
   * which leaves a tap-to-play button over the hero. Set it imperatively and
   * kick off playback ourselves; if the browser still refuses (Low Power Mode
   * blocks it outright), retry on the viewer's first interaction.
   */
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.muted = true
    video.defaultMuted = true

    const play = () => video.play().catch(() => {})
    play()

    const onFirstTouch = () => play()
    document.addEventListener('touchstart', onFirstTouch, { once: true, passive: true })
    document.addEventListener('click', onFirstTouch, { once: true })
    return () => {
      document.removeEventListener('touchstart', onFirstTouch)
      document.removeEventListener('click', onFirstTouch)
    }
  }, [])

  const enter = () => {
    setMode('hover')
    setLeaving(true)
  }
  const leave = () => {
    setMode('default')
    setLeaving(false)
  }

  return (
    <PageTransition>
      <motion.section
        animate={{ scale: leaving ? 0.97 : 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex h-svh min-h-[680px] w-full flex-col overflow-hidden bg-black"
      >
        <div className="absolute inset-0">
          <motion.video
            ref={videoRef}
            src={HERO_VIDEO}
            poster={HERO_POSTER}
            autoPlay
            muted
            loop
            playsInline
            controls={false}
            disablePictureInPicture
            preload="auto"
            className="pointer-events-none h-full w-full object-cover"
            animate={{
              scale: leaving ? [1.1, 1.14] : [1.1, 1.16, 1.1],
              opacity: leaving ? 0.5 : 1,
              filter: leaving ? 'grayscale(1) contrast(1.1) blur(3px)' : 'grayscale(1) contrast(1.1) blur(0px)',
            }}
            transition={{
              scale: { duration: 30, repeat: Infinity, ease: 'easeInOut' },
              opacity: { duration: 0.6 },
              filter: { duration: 0.6 },
            }}
          />
          <motion.div
            className="absolute inset-0 bg-black"
            animate={{ opacity: leaving ? 0.75 : 0.45 }}
            transition={{ duration: 0.6 }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
            style={{ backgroundImage: 'url(/noise.svg)', backgroundSize: '240px 240px' }}
          />
        </div>

        <div className="relative z-10 flex w-full flex-1 flex-col justify-between px-6 py-28 text-white md:px-10 md:py-32">
          <div>
            <TextReveal as="span" inView={false}>
              {/* "Alex" gets a small optical correction (-0.028em) — the A's
                  diagonal strokes read as slightly indented next to the M's
                  flat stem otherwise, even though both lines share one x. */}
              <h1 className="font-display text-[clamp(3rem,12vw,10.5rem)] font-black uppercase leading-[0.8] tracking-[-0.02em]">
                <span className="block" style={{ marginLeft: '-0.028em' }}>
                  Alex
                </span>
                <span className="block">Martinotti</span>
              </h1>
            </TextReveal>

            <div className="mt-6 max-w-md">
              <KineticConstruct
                text="The visual art of storytelling."
                delay={0.55}
                className="font-display text-xs font-medium uppercase text-white/70 md:text-sm"
              />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="grid grid-cols-1 sm:grid-cols-2"
          >
            <HeroCTA to="/projects" label="Projects" direction="left" onEnter={enter} onLeave={leave} />
            <HeroCTA to="/contact" label="Start a project" direction="right" onEnter={enter} onLeave={leave} />
          </motion.div>
        </div>
      </motion.section>
    </PageTransition>
  )
}
