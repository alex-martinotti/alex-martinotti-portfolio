import { motion } from 'framer-motion'

/**
 * Shared "not yet" state for the product pages. Deliberately quiet — a status
 * line and one sentence, matching the site's restraint rather than dressing
 * an empty page up as an announcement.
 */
export function ComingSoon({ note }: { note: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="mt-10 max-w-md"
    >
      <div className="flex items-center gap-4 text-xs uppercase tracking-[0.25em] text-muted">
        <span>Coming soon</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <p className="mt-6 text-base text-muted md:text-lg">
        {note} Not available yet — I'm still putting it together.
      </p>
    </motion.div>
  )
}
