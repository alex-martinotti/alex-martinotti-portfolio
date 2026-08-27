import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { parseItems, PRICE_CENTS, type OrderItem } from './_lib/catalogue'

/**
 * Creates a Stripe Checkout Session for the cart and returns its URL.
 *
 * Prices come from the server-side catalogue, never from the request body.
 * The items are stashed in session metadata so the webhook knows what to
 * deliver after payment.
 *
 * Env: STRIPE_SECRET_KEY
 */
const label = ({ id, format }: OrderItem) =>
  `${id.replace(/-/g, ' ')} — ${format === 'iphone' ? 'iPhone' : format}`

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return res.status(500).json({ error: 'Payments are not configured yet.' })

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  const items = parseItems(body?.items)
  if (!items.length) return res.status(400).json({ error: 'Cart is empty.' })

  const stripe = new Stripe(key)
  const origin =
    req.headers.origin ??
    (req.headers.host ? `https://${req.headers.host}` : 'https://alexmartinotti.com')

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      // Digital goods sold into the EU need VAT at the buyer's rate.
      // Stripe Tax works this out once it's enabled on the account.
      automatic_tax: { enabled: true },
      billing_address_collection: 'required',
      line_items: items.map((item) => ({
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: PRICE_CENTS,
          tax_behavior: 'inclusive',
          product_data: {
            name: label(item),
            description: 'Digital wallpaper — high-resolution JPG',
          },
        },
      })),
      metadata: { items: JSON.stringify(items) },
      success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/wallpapers`,
    })

    return res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout failed', error)
    return res.status(502).json({ error: 'Could not start checkout.' })
  }
}
