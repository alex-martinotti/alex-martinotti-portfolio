export type Device = 'iphone' | 'desktop'
export type IPhoneMode = 'lock' | 'home'

export const DESKTOP_RATIOS = ['16:9', '16:10', '4:3', '5:4'] as const
export type DesktopRatio = (typeof DESKTOP_RATIOS)[number]

/**
 * Collections group by visual language, not geography — a Berlin facade and a
 * Rotterdam stairwell belong together; two photographs from the same trip
 * often don't.
 */
export const COLLECTIONS = [
  'Hard Edges',
  'Thin Air',
  'Salt',
  'Street Level',
  'In Transit',
] as const
export type Collection = (typeof COLLECTIONS)[number]

export interface Wallpaper {
  id: string
  number: string
  title: string
  collection: Collection
  location: string
  year: string
  price: number
  /** Small, lazy-loaded — catalogue only. */
  thumbnail: string
  /** Screen-sized previews. A format the photograph can't carry is omitted. */
  iphone?: { preview: string }
  desktop?: Partial<Record<DesktopRatio, string>>
}

/**
 * Files live in public/media/wallpapers/<id>/:
 *   thumb.jpg, iphone.jpg, desktop-16x9.jpg, desktop-16x10.jpg,
 *   desktop-4x3.jpg, desktop-5x4.jpg
 *
 * These are PREVIEWS. Full-resolution downloads are the actual product and
 * must move out of public/ before checkout goes live.
 *
 * Portrait photographs only offer the crops that survive the reframe (iPhone,
 * plus the near-square desktop ratios); landscape ones offer every desktop
 * ratio. That's why formats differ per photograph.
 */
const media = (id: string, file: string) => `/media/wallpapers/${id}/${file}`
const ratioFile = (r: DesktopRatio) => `desktop-${r.replace(':', 'x')}.jpg`

const PORTRAIT_RATIOS: DesktopRatio[] = ['4:3', '5:4']
const ALL_RATIOS: DesktopRatio[] = [...DESKTOP_RATIOS]

const desktopSet = (id: string, ratios: DesktopRatio[]) =>
  ratios.reduce<Partial<Record<DesktopRatio, string>>>((acc, r) => {
    acc[r] = media(id, ratioFile(r))
    return acc
  }, {})

type Shape = 'port' | 'land'

const w = (
  id: string,
  title: string,
  collection: Collection,
  location: string,
  year: string,
  shape: Shape,
): Omit<Wallpaper, 'number'> => ({
  id,
  title,
  collection,
  location,
  year,
  price: 700,
  thumbnail: media(id, 'thumb.jpg'),
  ...(shape === 'port' ? { iphone: { preview: media(id, 'iphone.jpg') } } : {}),
  desktop: desktopSet(id, shape === 'port' ? PORTRAIT_RATIOS : ALL_RATIOS),
})

/** Ordered strongest-first — the first entry is what the page opens on. */
const CATALOGUE: Omit<Wallpaper, 'number'>[] = [
  w('lattice', 'Lattice', 'Hard Edges', 'Singapore', '2026', 'port'),
  w('the-loop', 'The Loop', 'Thin Air', 'Ha Giang, Vietnam', '2026', 'port'),
  w('tower', 'Tower', 'Hard Edges', 'Berlin', '2026', 'port'),
  w('inlet', 'Inlet', 'Salt', 'Norway', '2026', 'port'),
  w('lift', 'Lift', 'Thin Air', 'Austria', '2026', 'port'),
  w('nave', 'Nave', 'Hard Edges', 'Berlin', '2026', 'port'),
  w('parasols', 'Parasols', 'Salt', 'Italy', '2026', 'port'),
  w('window-seat', 'Window Seat', 'In Transit', 'Somewhere', '2026', 'port'),
  w('shelters', 'Shelters', 'Salt', 'Italy', '2026', 'port'),
  w('terraces', 'Terraces', 'Hard Edges', 'Rotterdam', '2026', 'port'),
  w('range', 'Range', 'Thin Air', 'Vietnam', '2026', 'land'),
  w('downtown', 'Downtown', 'Street Level', 'New York', '2026', 'port'),
  w('through', 'Through', 'In Transit', 'Vietnam', '2026', 'port'),
  w('spire', 'Spire', 'Hard Edges', 'Berlin', '2026', 'port'),
  w('cliffs', 'Cliffs', 'Salt', 'Italy', '2026', 'port'),
  w('siesta', 'Siesta', 'Street Level', 'Italy', '2026', 'port'),
  w('saigon', 'Saigon', 'Street Level', 'Vietnam', '2026', 'port'),
  w('ridge', 'Ridge', 'Thin Air', 'Vietnam', '2026', 'port'),
  w('two-up', 'Two Up', 'In Transit', 'Vietnam', '2026', 'land'),
  w('overpass', 'Overpass', 'Street Level', 'New York', '2026', 'port'),
  w('herd', 'Herd', 'Thin Air', 'Vietnam', '2026', 'land'),
  w('roma', 'Roma', 'Street Level', 'Rome', '2026', 'port'),
  w('gable', 'Gable', 'Hard Edges', 'Netherlands', '2026', 'port'),
]

export const wallpapers: Wallpaper[] = CATALOGUE.map((item, i) => ({
  ...item,
  number: String(i + 1).padStart(2, '0'),
}))

export const ratiosFor = (item: Wallpaper): DesktopRatio[] =>
  DESKTOP_RATIOS.filter((r) => Boolean(item.desktop?.[r]))

export const formatPrice = (cents: number) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(cents / 100)
