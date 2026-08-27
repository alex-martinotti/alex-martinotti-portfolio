import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCursor } from '../lib/cursor-context'

const ITEMS = [
  { number: '01', label: 'About', to: '/about' },
  { number: '02', label: 'Projects', to: '/projects' },
  { number: '03', label: 'Get my LUTs', to: '/luts' },
  { number: '04', label: 'Get my wallpaper', to: '/wallpapers' },
  { number: '05', label: 'Contact', to: '/contact' },
]

export function BrowsePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { setMode } = useCursor()

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0% 0)' }}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-40 overflow-y-auto bg-ink text-void"
        >
          <div className="mx-auto flex min-h-full max-w-4xl flex-col justify-center px-6 py-28 md:px-10">
            <nav className="flex flex-col">
              {ITEMS.map((item, i) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  onMouseEnter={() => setMode('hover')}
                  onMouseLeave={() => setMode('default')}
                  className="group relative flex items-baseline gap-6 border-t border-void/15 py-6 last:border-b md:py-8"
                >
                  <span className="text-sm text-void/40 transition-colors duration-300 group-hover:text-void md:text-base">
                    {item.number}
                  </span>

                  {/*
                    pr-6 gives the translate-x-3 hover shift room to move into —
                    without it, overflow-hidden (needed for the y-reveal-in mask)
                    clips the last letters as the text shifts right.
                  */}
                  <span className="overflow-hidden pr-6">
                    <motion.span
                      initial={{ y: '100%' }}
                      animate={{ y: '0%' }}
                      transition={{ duration: 0.4, delay: 0.05 + i * 0.03, ease: [0.16, 1, 0.3, 1] }}
                      className="block font-display text-4xl font-black uppercase leading-none tracking-tight transition-transform duration-300 group-hover:translate-x-3 sm:text-5xl md:text-6xl"
                    >
                      {item.label}
                    </motion.span>
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
