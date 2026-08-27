import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCursor } from '../lib/cursor-context'
import { PageTransition } from '../components/PageTransition'

/** Update to point at your real inbox, and add a real scheduling link once you have one. */
const EMAIL = 'hello@alexmartinotti.com'
const BOOKING_URL = ''

const PROJECT_TYPES = ['Film', 'Photo', 'Campaign', 'Social', 'Brand', 'Other']
const TIMING_OPTIONS = ['ASAP', 'This month', 'Soon', 'Just exploring']

interface Answers {
  name: string
  projectType: string
  message: string
  timing: string
  email: string
}

const emptyAnswers: Answers = { name: '', projectType: '', message: '', timing: '', email: '' }

const TOTAL_STEPS = 5

function buildMailto(answers: Answers) {
  const subject = `New project inquiry — ${answers.name || 'Untitled'}`
  const body = [
    `Name: ${answers.name}`,
    `Making: ${answers.projectType}`,
    `Timing: ${answers.timing}`,
    `Email: ${answers.email}`,
    '',
    answers.message,
  ].join('\n')
  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

function StepShell({
  stepIndex,
  children,
}: {
  stepIndex: number
  children: React.ReactNode
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepIndex}
        initial={{ opacity: 0, x: 32 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -32 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export function Contact() {
  const { setMode } = useCursor()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>(emptyAnswers)
  const [done, setDone] = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!done) inputRef.current?.focus()
  }, [step, done])

  const update = (field: keyof Answers, value: string) => setAnswers((prev) => ({ ...prev, [field]: value }))

  const goNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1))
  const goBack = () => setStep((s) => Math.max(s - 1, 0))

  const finish = () => {
    window.location.href = buildMailto(answers)
    setDone(true)
  }

  const handleEnter = (e: KeyboardEvent) => {
    if (e.key !== 'Enter' || e.shiftKey) return
    e.preventDefault()
    if (step === TOTAL_STEPS - 1) {
      if (answers.email.trim()) finish()
    } else {
      goNext()
    }
  }

  const greeting = answers.name.trim() ? `Hey ${answers.name.trim()} — ` : ''

  const labelClass =
    'inline-flex items-center gap-3 border-b border-ink pb-1 font-display text-xl font-black uppercase tracking-tight transition-colors duration-300 hover:text-muted md:text-2xl'

  const inputClass =
    'w-full border-b border-line bg-transparent py-4 font-display text-3xl font-medium text-ink outline-none transition-colors duration-300 placeholder:text-muted/50 focus:border-ink md:text-5xl'

  return (
    <PageTransition>
      <div className="mx-auto flex min-h-svh max-w-2xl flex-col justify-center px-6 py-32 md:px-10">
        {!done && (
          <div className="mb-12 flex items-center gap-4 text-xs uppercase tracking-[0.25em] text-muted">
            <span>
              {String(step + 1).padStart(2, '0')} / {String(TOTAL_STEPS).padStart(2, '0')}
            </span>
            <span className="h-px flex-1 bg-line" />
            <span>Step {String(step + 1).padStart(2, '0')}</span>
          </div>
        )}

        {done ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="font-display text-[clamp(2.5rem,9vw,6rem)] font-black uppercase leading-[0.88] tracking-tight">
              Got it.
            </h1>
            <p className="mt-4 text-lg text-muted md:text-xl">I'll get back to you soon.</p>

            <div className="mt-16 border-t border-line pt-8">
              <p className="text-sm uppercase tracking-[0.2em] text-muted">
                Want to skip the back-and-forth?
              </p>
              {BOOKING_URL ? (
                <a
                  href={BOOKING_URL}
                  target="_blank"
                  rel="noreferrer"
                  onMouseEnter={() => setMode('hover')}
                  onMouseLeave={() => setMode('default')}
                  className={`${labelClass} mt-4`}
                >
                  Book a 30 min call
                  <span>→</span>
                </a>
              ) : (
                <p className="mt-4 font-display text-xl font-black uppercase tracking-tight text-muted md:text-2xl">
                  Book a 30 min call — link coming soon
                </p>
              )}
              <p className="mt-6 text-sm text-muted">or I'll reply to your email.</p>
            </div>
          </motion.div>
        ) : (
          <>
            <StepShell stepIndex={step}>
              {step === 0 && (
                <div>
                  <h2 className="font-display text-[clamp(1.75rem,5.5vw,3.25rem)] font-black uppercase leading-[0.95] tracking-tight">
                    What's your name?
                  </h2>
                  <input
                    ref={inputRef as React.RefObject<HTMLInputElement>}
                    type="text"
                    value={answers.name}
                    onChange={(e) => update('name', e.target.value)}
                    onKeyDown={handleEnter}
                    placeholder="Your name"
                    className={`${inputClass} mt-8`}
                  />
                </div>
              )}

              {step === 1 && (
                <div>
                  <h2 className="font-display text-[clamp(1.75rem,5.5vw,3.25rem)] font-black uppercase leading-[0.95] tracking-tight">
                    {greeting}
                    What are we making?
                  </h2>
                  <div className="mt-8 flex flex-col">
                    {PROJECT_TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          update('projectType', type)
                          window.setTimeout(goNext, 250)
                        }}
                        onMouseEnter={() => setMode('hover')}
                        onMouseLeave={() => setMode('default')}
                        className={`group flex items-center justify-between border-t border-line py-4 text-left last:border-b ${
                          answers.projectType === type ? 'text-ink' : 'text-muted hover:text-ink'
                        }`}
                      >
                        <span className="font-display text-2xl font-black uppercase tracking-tight transition-transform duration-300 group-hover:translate-x-2 md:text-3xl">
                          {type}
                        </span>
                        {answers.projectType === type && <span>→</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="font-display text-[clamp(1.75rem,5.5vw,3.25rem)] font-black uppercase leading-[0.95] tracking-tight">
                    Tell me a little about it.
                  </h2>
                  <textarea
                    ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                    rows={3}
                    value={answers.message}
                    onChange={(e) => update('message', e.target.value)}
                    onKeyDown={handleEnter}
                    placeholder="What's the idea?"
                    className={`${inputClass} mt-8 resize-none`}
                  />
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="font-display text-[clamp(1.75rem,5.5vw,3.25rem)] font-black uppercase leading-[0.95] tracking-tight">
                    When are you thinking?
                  </h2>
                  <div className="mt-8 flex flex-col">
                    {TIMING_OPTIONS.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          update('timing', option)
                          window.setTimeout(goNext, 250)
                        }}
                        onMouseEnter={() => setMode('hover')}
                        onMouseLeave={() => setMode('default')}
                        className={`group flex items-center justify-between border-t border-line py-4 text-left last:border-b ${
                          answers.timing === option ? 'text-ink' : 'text-muted hover:text-ink'
                        }`}
                      >
                        <span className="font-display text-2xl font-black uppercase tracking-tight transition-transform duration-300 group-hover:translate-x-2 md:text-3xl">
                          {option}
                        </span>
                        {answers.timing === option && <span>→</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <h2 className="font-display text-[clamp(1.75rem,5.5vw,3.25rem)] font-black uppercase leading-[0.95] tracking-tight">
                    Where can I reach you?
                  </h2>
                  <input
                    ref={inputRef as React.RefObject<HTMLInputElement>}
                    type="email"
                    value={answers.email}
                    onChange={(e) => update('email', e.target.value)}
                    onKeyDown={handleEnter}
                    placeholder="Email"
                    className={`${inputClass} mt-8`}
                  />
                </div>
              )}
            </StepShell>

            <div className="mt-12 flex items-center gap-8">
              {step > 0 && (
                <button
                  onClick={goBack}
                  onMouseEnter={() => setMode('hover')}
                  onMouseLeave={() => setMode('default')}
                  className="text-xs uppercase tracking-[0.2em] text-muted transition-colors duration-300 hover:text-ink"
                >
                  ← Back
                </button>
              )}

              {step < TOTAL_STEPS - 1 && step !== 1 && step !== 3 && (
                <button
                  onClick={goNext}
                  onMouseEnter={() => setMode('hover')}
                  onMouseLeave={() => setMode('default')}
                  className={labelClass}
                >
                  Continue
                  <span>→</span>
                </button>
              )}

              {step === TOTAL_STEPS - 1 && (
                <button
                  onClick={() => answers.email.trim() && finish()}
                  onMouseEnter={() => setMode('hover')}
                  onMouseLeave={() => setMode('default')}
                  className={labelClass}
                >
                  Send
                  <span>→</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </PageTransition>
  )
}
