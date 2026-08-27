import { PageTransition } from '../components/PageTransition'
import { TextReveal } from '../components/TextReveal'
import { Footer } from '../components/Footer'
import { ComingSoon } from '../components/ComingSoon'

export function Wallpapers() {
  return (
    <PageTransition>
      <div className="mx-auto flex min-h-svh max-w-3xl flex-col justify-center px-6 py-32 md:px-10">
        <TextReveal as="span" inView={false}>
          <h1 className="font-display text-[clamp(2.5rem,8vw,6rem)] font-black uppercase leading-[0.9] tracking-tight">
            Wallpaper
          </h1>
        </TextReveal>

        <ComingSoon note="Stills worth staring at, sized for your screen." />
      </div>

      <Footer />
    </PageTransition>
  )
}
