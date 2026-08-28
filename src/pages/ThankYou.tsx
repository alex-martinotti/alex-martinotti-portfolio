import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageTransition } from '../components/PageTransition'
import { TextReveal } from '../components/TextReveal'
import { Footer } from '../components/Footer'
import { useCart } from '../lib/cart-context'
import { useCursor } from '../lib/cursor-context'

/**
 * Where Stripe returns after payment. Deliberately does not show the files —
 * delivery happens by email from the verified webhook, so this page can't be
 * used to obtain downloads by visiting the URL directly.
 */
export function ThankYou() {
  const { clear } = useCart()
  const { setMode } = useCursor()

  useEffect(() => {
    clear()
  }, [clear])

  return (
    <PageTransition>
      <div className="mx-auto flex min-h-svh max-w-2xl flex-col justify-center px-6 py-32 md:px-10">
        <TextReveal as="span" inView={false}>
          <h1 className="font-display text-[clamp(2.5rem,9vw,6rem)] font-black uppercase leading-[0.88] tracking-tight">
            Thank you.
          </h1>
        </TextReveal>

        <p className="mt-6 max-w-md text-lg text-muted md:text-xl">
          Your order is confirmed. Each print is made to order, so it ships in 3–5 days — I'll email you when it's on its way.
        </p>

        <p className="mt-4 max-w-md text-sm text-muted">
          A confirmation is on its way by email. Nothing after a few minutes? Check spam, then email me.
        </p>

        <Link
          to="/prints"
          onMouseEnter={() => setMode('hover')}
          onMouseLeave={() => setMode('default')}
          className="group mt-12 inline-flex w-fit items-center gap-3 border-b border-ink pb-1 font-display text-xl font-black uppercase tracking-tight transition-colors duration-300 hover:text-muted"
        >
          Back to prints
          <span className="transition-transform duration-300 group-hover:translate-x-2">→</span>
        </Link>
      </div>

      <Footer />
    </PageTransition>
  )
}
