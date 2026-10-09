import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'

/**
 * Handles a Start-a-Project submission: emails the enquiry to Alex, then sends
 * the sender a confirmation echoing their own answers back.
 *
 * Needs one Vercel environment variable:
 *   RESEND_API_KEY   — from resend.com/api-keys
 *
 * FROM_ADDRESS must be on a domain verified in Resend. Until alexmartinotti.com
 * is verified there, Resend's shared onboarding@resend.dev sender works for
 * testing (it can only deliver to your own account address).
 */
const FROM_ADDRESS = 'Alex Martinotti <hello@alexmartinotti.com>'
const TO_ADDRESS = 'martinotti.alex@gmail.com'
const CALENDLY_URL = 'https://calendly.com/alex_martinotti/15min'

interface Payload {
  name?: string
  projectType?: string
  message?: string
  timing?: string
  email?: string
}

const clean = (value: unknown, max = 2000) =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/**
 * The apex domain 308-redirects to www at the platform level, including for
 * fetch() calls the page itself makes — so a tab left open on the bare
 * domain ends up POSTing here cross-origin once it follows that redirect.
 * Without these headers the browser blocks the (successful!) response as a
 * CORS failure, which looks identical to the request actually failing.
 */
const ALLOWED_ORIGINS = new Set(['https://alexmartinotti.com', 'https://www.alexmartinotti.com'])

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  }

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set')
    return res.status(500).json({ error: 'Email is not configured yet.' })
  }

  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as Payload
  const name = clean(body?.name, 120)
  const email = clean(body?.email, 200)
  const projectType = clean(body?.projectType, 60)
  const timing = clean(body?.timing, 60)
  const message = clean(body?.message)

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'A valid email is required.' })
  }

  const resend = new Resend(apiKey)
  const who = name || 'Someone'
  const firstName = name.split(' ')[0] || 'there'

  try {
    // Resend reports failures in the result rather than throwing, so each send
    // is checked — otherwise a rejected email still answers { ok: true }.
    // 1. The enquiry itself — reply-to is set so hitting reply goes to them.
    const enquiry = await resend.emails.send({
      from: FROM_ADDRESS,
      to: TO_ADDRESS,
      replyTo: email,
      subject: `New enquiry — ${who}${projectType ? ` · ${projectType}` : ''}`,
      text: [
        `Name: ${name || '—'}`,
        `Email: ${email}`,
        `Making: ${projectType || '—'}`,
        `Timing: ${timing || '—'}`,
        '',
        message || '(no message)',
      ].join('\n'),
    })

    if (enquiry.error) throw enquiry.error

    // 2. Their confirmation — deliberately plain, so it reads as a person wrote it.
    const confirmation = await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      replyTo: TO_ADDRESS,
      subject: 'Got it — Alex',
      text: [
        `Hey ${firstName},`,
        '',
        `Your message landed.${projectType ? ` You're thinking ${projectType}` : ''}${
          timing ? `, timing ${timing}` : ''
        } — I've got the details.`,
        '',
        "I read everything myself and usually reply within a day or two. If it's easier to talk it through, grab a time that suits you:",
        '',
        `Book a 15-min call → ${CALENDLY_URL}`,
        '',
        '— Alex',
        '',
        'alexmartinotti.com · @byalexmartinotti',
      ].join('\n'),
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;font-size:16px;line-height:1.6;color:#111110;max-width:480px">
          <p style="margin:0 0 16px">Hey ${escapeHtml(firstName)},</p>
          <p style="margin:0 0 16px">
            Your message landed.${projectType ? ` You're thinking <strong>${escapeHtml(projectType)}</strong>` : ''}${
              timing ? `, timing <strong>${escapeHtml(timing)}</strong>` : ''
            } — I've got the details.
          </p>
          <p style="margin:0 0 16px">
            I read everything myself and usually reply within a day or two.
            If it's easier to talk it through, grab a time that suits you:
          </p>
          <p style="margin:0 0 24px">
            <a href="${CALENDLY_URL}" style="display:inline-block;padding:12px 20px;background:#111110;color:#fafaf8;text-decoration:none;font-size:14px;letter-spacing:0.04em">Book a 15-min call →</a>
          </p>
          <p style="margin:0 0 24px">— Alex</p>
          <p style="margin:0;font-size:13px;color:#8c8880">
            <a href="https://alexmartinotti.com" style="color:#8c8880">alexmartinotti.com</a>
            &nbsp;·&nbsp;
            <a href="https://instagram.com/byalexmartinotti" style="color:#8c8880">@byalexmartinotti</a>
          </p>
        </div>
      `,
    })
    if (confirmation.error) throw confirmation.error

    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Resend send failed', error)
    return res.status(502).json({ error: 'Could not send right now.' })
  }
}
