/**
 * Server-side price list for prints. Prices are NEVER taken from the browser —
 * a client could post €1 otherwise. The cart sends the print id and the size /
 * edition it wants; the server decides what that costs.
 *
 * Keep ids in sync with src/data/prints.ts.
 */
export const PRINT_IDS = [
  'lattice', 'the-loop', 'tower', 'inlet', 'lift', 'nave', 'parasols',
  'window-seat', 'shelters', 'terraces', 'range', 'downtown', 'through',
  'spire', 'cliffs', 'siesta', 'saigon', 'ridge', 'two-up', 'overpass',
  'herd', 'roma', 'gable',
] as const

export const SIZE_PRICES: Record<string, number> = {
  '30x40': 22900,
  '50x70': 29900,
  '70x100': 37900,
  '100x140': 47900,
}

export const LIMITED_PREMIUM = 1.6
export const FRAME_PRICES: Record<string, number> = { none: 0, black: 6000, oak: 7500 }

export interface OrderItem {
  id: string
  size: string
  edition: 'open' | 'limited'
  frame: 'none' | 'black' | 'oak'
}

/** Accepts only combinations we actually sell. */
export function parseItems(raw: unknown): OrderItem[] {
  if (!Array.isArray(raw)) return []
  const seen = new Set<string>()
  const items: OrderItem[] = []

  for (const entry of raw.slice(0, 30)) {
    const e = entry as Partial<OrderItem>
    const id = String(e?.id ?? '')
    const size = String(e?.size ?? '')
    const edition = String(e?.edition ?? '') as OrderItem['edition']
    const frame = String(e?.frame ?? 'none') as OrderItem['frame']

    if (!PRINT_IDS.includes(id as (typeof PRINT_IDS)[number])) continue
    if (!SIZE_PRICES[size]) continue
    if (edition !== 'open' && edition !== 'limited') continue
    if (!(frame in FRAME_PRICES)) continue

    const key = `${id}:${size}:${edition}:${frame}`
    if (seen.has(key)) continue
    seen.add(key)
    items.push({ id, size, edition, frame })
  }
  return items
}

export function priceOf(item: OrderItem) {
  const base = SIZE_PRICES[item.size]
  const withEdition =
    item.edition === 'limited' ? Math.round((base * LIMITED_PREMIUM) / 100) * 100 : base
  return withEdition + FRAME_PRICES[item.frame]
}

export function describe(item: OrderItem) {
  const [w, h] = item.size.split('x')
  const frame = item.frame === 'none' ? 'Unframed' : `${item.frame === 'oak' ? 'Oak' : 'Black'} frame`
  const edition = item.edition === 'limited' ? 'Edition of 25' : 'Open edition'
  return `${w} × ${h} cm · ${edition} · ${frame}`
}
