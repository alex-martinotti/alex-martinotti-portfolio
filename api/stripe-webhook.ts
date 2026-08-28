import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { Resend } from 'resend'
import { describe, type OrderItem } from './_lib/catalogue'

/**
 * Stripe calls this after a successful payment. For physical prints there's
 * nothing to deliver electronically — this emails Alex the order so it can be
 * sent to the lab, and confirms to the customer that it's in hand.
 *
 * Env: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, RESEND_API_KEY
 */
export const config = { api: { bodyParser: false } }

const FROM_ADDRESS = 'Alex Martinotti <hello@alexmartinotti.com>'
const TO_ADDRESS = 'martinotti.alex@gmail.com'

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

  const { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, RESEND_API_KEY } = process.env
  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    console.error('Webhook env vars missing')
    return res.status(500).end()
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY)
  let event: Stripe.Event

  // Without signature verification anyone could POST a fake "paid" event.
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
  const name = session.customer_details?.name ?? 'Customer'
  const firstName = name.split(' ')[0]
  const ship = session.collected_information?.shipping_details ?? session.shipping_details

  let items: OrderItem[] = []
  try {
    items = JSON.parse(session.metadata?.items ?? '[]')
  } catch {
    items = []
  }

  if (!RESEND_API_KEY) return res.status(200).json({ received: true })
  const resend = new Resend(RESEND_API_KEY)

  const lines = items.map((i) => `• ${i.id.replace(/-/g, ' ')} — ${describe(i)}`)
  const address = ship?.address
    ? [
        ship.name,
        ship.address.line1,
        ship.address.line2,
        `${ship.address.postal_code} ${ship.address.city}`,
        ship.address.country,
      ]
        .filter(Boolean)
        .join('\n')
    : 'No shipping address captured'

  try {
    // 1. Fulfilment notice — everything needed to place the lab order.
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: TO_ADDRESS,
      replyTo: email ?? undefined,
      subject: `Print order — ${name}`,
      text: [
        `Order ${session.id}`,
        `Paid: ${((session.amount_total ?? 0) / 100).toFixed(2)} ${session.currency?.toUpperCase()}`,
        '',
        ...lines,
        '',
        'Ship to:',
        address,
        '',
        `Email: ${email ?? '—'}`,
      ].join('\n'),
    })

    // 2. Customer confirmation.
    if (email) {
      await resend.emails.send({
        from: FROM_ADDRESS,
        to: email,
        replyTo: TO_ADDRESS,
        subject: 'Your print order',
        text: [
          `Hey ${firstName},`,
          '',
          'Thanks — your order is in.',
          '',
          ...lines,
          '',
          'Each print is made to order, so it takes 3–5 days before it ships. I\'ll email you when it\'s on its way.',
          '',
          '— Alex',
        ].join('\n'),
        html: `
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;font-size:16px;line-height:1.6;color:#111110;max-width:480px">
            <p style="margin:0 0 16px">Hey ${firstName},</p>
            <p style="margin:0 0 16px">Thanks — your order is in.</p>
            ${lines.map((l) => `<p style="margin:0 0 6px">${l}</p>`).join('')}
            <p style="margin:20px 0 16px">
              Each print is made to order, so it takes 3–5 days before it ships.
              I'll email you when it's on its way.
            </p>
            <p style="margin:0">— Alex</p>
          </div>
        `,
      })
    }
  } catch (error) {
    // Don't 500: Stripe would retry and double-send. Log for manual follow-up.
    console.error('Order email failed for', session.id, error)
  }

  return res.status(200).json({ received: true })
}
