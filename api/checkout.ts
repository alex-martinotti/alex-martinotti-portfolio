import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { parseItems, priceOf, describe } from './_lib/catalogue'

/**
 * Creates a Stripe Checkout Session for a print order.
 *
 * Physical goods, so we collect a shipping address and offer shipping rates.
 * Prices are computed server-side from the catalogue, never trusted from the
 * request body.
 *
 * Env: STRIPE_SECRET_KEY
 */
const SHIPPING = [
  { label: 'Europe', amount: 1500, min: 3, max: 7 },
  { label: 'Rest of world', amount: 3500, min: 7, max: 14 },
]

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
      automatic_tax: { enabled: true },
      billing_address_collection: 'required',
      shipping_address_collection: { allowed_countries: ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','GB','CH','NO','US','CA','AU','NZ','JP','SG'] },
      shipping_options: SHIPPING.map((s) => ({
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: s.amount, currency: 'eur' },
          display_name: s.label,
          delivery_estimate: {
            minimum: { unit: 'business_day', value: s.min },
            maximum: { unit: 'business_day', value: s.max },
          },
        },
      })),
      line_items: items.map((item) => ({
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: priceOf(item),
          tax_behavior: 'inclusive',
          product_data: {
            name: item.id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            description: describe(item),
          },
        },
      })),
      metadata: { items: JSON.stringify(items) },
      success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/prints`,
    })

    return res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout failed', error)
    return res.status(502).json({ error: 'Could not start checkout.' })
  }
}
