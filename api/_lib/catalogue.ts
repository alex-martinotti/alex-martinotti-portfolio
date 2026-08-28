import crypto from 'node:crypto'

/**
 * Server-side price list. Prices are NEVER taken from the browser — a client
 * could post €0.01 otherwise. The cart only sends item ids; the server looks
 * up what they actually cost.
 *
 * Keep the ids in sync with src/data/wallpapers.ts.
 */
export const PRICE_CENTS = 700

export const WALLPAPER_IDS = [
  'lattice',
  'the-loop',
  'tower',
  'inlet',
  'lift',
  'nave',
  'parasols',
  'window-seat',
  'shelters',
  'terraces',
  'range',
  'downtown',
  'through',
  'spire',
  'cliffs',
  'siesta',
  'saigon',
  'ridge',
  'two-up',
  'overpass',
  'herd',
  'roma',
  'gable',
] as const

export const VALID_FORMATS = ['iphone', '16:9', '16:10', '4:3', '5:4'] as const
export type Format = (typeof VALID_FORMATS)[number]

export interface OrderItem {
  id: string
  format: Format
}

/** Accepts only ids/formats we actually sell. */
export function parseItems(raw: unknown): OrderItem[] {
  if (!Array.isArray(raw)) return []
  const seen = new Set<string>()
  const items: OrderItem[] = []

  for (const entry of raw.slice(0, 50)) {
    const id = String((entry as OrderItem)?.id ?? '')
    const format = String((entry as OrderItem)?.format ?? '') as Format
    if (!WALLPAPER_IDS.includes(id as (typeof WALLPAPER_IDS)[number])) continue
    if (!VALID_FORMATS.includes(format)) continue
    const key = `${id}:${format}`
    if (seen.has(key)) continue
    seen.add(key)
    items.push({ id, format })
  }
  return items
}

export const fileNameFor = ({ id, format }: OrderItem) =>
  format === 'iphone' ? `${id}-iphone.jpg` : `${id}-${format.replace(':', 'x')}.jpg`

/**
 * Signs a short-lived download token. HMAC over the file + expiry, so links
 * can't be forged or shared indefinitely.
 */
export function signDownload(file: string, secret: string, ttlMs = 1000 * 60 * 60 * 24 * 7) {
  const expires = Date.now() + ttlMs
  const payload = `${file}.${expires}`
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url')
  return { file, expires, sig }
}

export function verifyDownload(file: string, expires: number, sig: string, secret: string) {
  if (!Number.isFinite(expires) || Date.now() > expires) return false
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${file}.${expires}`)
    .digest('base64url')
  // constant-time compare
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}
