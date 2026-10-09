const EMAIL = 'hello@alexmartinotti.com'
const BOOKING_URL = 'https://calendly.com/alex_martinotti/15min'
const INSTAGRAM_URL = 'https://instagram.com/byalexmartinotti'

export function Footer() {
  return (
    <footer className="flex flex-col gap-4 border-t border-line px-6 py-8 text-xs uppercase tracking-[0.2em] text-muted md:flex-row md:items-center md:justify-between md:px-10">
      <span>© {new Date().getFullYear()} Alex Martinotti</span>
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <a href={`mailto:${EMAIL}`} className="transition-colors duration-300 hover:text-ink">
          {EMAIL}
        </a>
        <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="transition-colors duration-300 hover:text-ink">
          Book a call
        </a>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noreferrer"
          className="transition-colors duration-300 hover:text-ink"
        >
          Instagram
        </a>
      </div>
    </footer>
  )
}
