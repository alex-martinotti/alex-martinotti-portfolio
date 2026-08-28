import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { Resend } from 'resend'
import { fileNameFor, signDownload, type OrderItem } from './_lib/catalogue'

/**
 * Stripe calls this after a successful payment. This — not the browser
 * redirect — is what triggers delivery, so a visitor can't reach the
 * download links by faking a success URL.
 *
 * Env: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, RESEND_API_KEY, DOWNLOAD_SECRET
 */
export const config = { api: { bodyParser: false } }

const FROM_ADDRESS = 'Alex Martinotti <hello@alexmartinotti.com>'

async function rawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  return Buffer.concat(chunks)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end()
  }

  const { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, RESEND_API_KEY, DOWNLOAD_SECRET } = process.env
  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET || !DOWNLOAD_SECRET) {
    console.error('Webhook env vars missing')
    return res.status(500).end()
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY)
  let event: Stripe.Event

  // Signature verification — without this anyone could POST a fake "paid" event.
  try {
    const body = await rawBody(req)
    event = stripe.webhooks.constructEvent(
      body,
      req.headers['stripe-signature'] as string,
      STRIPE_WEBHOOK_SECRET,
    )
  } catch (error) {
    console.error('Webhook signature verification failed', error)
    return res.status(400).send('Invalid signature')
  }

  if (event.type !== 'checkout.session.completed') return res.status(200).json({ received: true })

  const session = event.data.object as Stripe.Checkout.Session
  const email = session.customer_details?.email
  const name = session.customer_details?.name?.split(' ')[0] ?? 'there'

  let items: OrderItem[] = []
  try {
    items = JSON.parse(session.metadata?.items ?? '[]')
  } catch {
    items = []
  }

  if (!email || !items.length) {
    console.error('Paid session missing email or items', session.id)
    return res.status(200).json({ received: true })
  }

  const origin = process.env.SITE_ORIGIN ?? 'https://alexmartinotti.com'
  const links = items.map((item) => {
    const file = fileNameFor(item)
    const { expires, sig } = signDownload(file, DOWNLOAD_SECRET)
    return {
      label: `${item.id.replace(/-/g, ' ')} — ${item.format === 'iphone' ? 'iPhone' : item.format}`,
      url: `${origin}/api/download?file=${encodeURIComponent(file)}&expires=${expires}&sig=${sig}`,
    }
  })

  if (RESEND_API_KEY) {
    try {
      const resend = new Resend(RESEND_API_KEY)
      await resend.emails.send({
        from: FROM_ADDRESS,
        to: email,
        subject: 'Your wallpapers',
        text: [
          `Hey ${name},`,
          '',
          'Here are your downloads. Links work for 7 days.',
          '',
          ...links.map((l) => `${l.label}\n${l.url}`),
          '',
          '— Alex',
        ].join('\n'),
        html: `
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;font-size:16px;line-height:1.6;color:#111110;max-width:480px">
            <p style="margin:0 0 16px">Hey ${name},</p>
            <p style="margin:0 0 20px">Here are your downloads. Links work for 7 days.</p>
            ${links
              .map(
                (l) =>
                  `<p style="margin:0 0 10px"><a href="${l.url}" style="color:#111110">${l.label}</a></p>`,
              )
              .join('')}
            <p style="margin:24px 0 0">— Alex</p>
          </div>
        `,
      })
    } catch (error) {
      // Don't 500: Stripe would retry and could double-send. Log for manual follow-up.
      console.error('Delivery email failed for', session.id, error)
    }
  }

  return res.status(200).json({ received: true })
}
