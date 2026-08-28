export const COLLECTIONS = [
  'Hard Edges',
  'Thin Air',
  'Salt',
  'Street Level',
  'In Transit',
] as const
export type Collection = (typeof COLLECTIONS)[number]

export type Orientation = 'portrait' | 'landscape'
export type Edition = 'open' | 'limited'

/**
 * Print sizes in centimetres, stated portrait; a landscape photograph is sold
 * in the same sizes turned on their side (70 × 100 becomes 100 × 70).
 *
 * The photograph keeps its own aspect ratio inside the frame — the paper
 * border absorbs the difference, exactly as real framing does. That's why
 * every size is offered for every photograph without distorting anything.
 */
export interface PrintSize {
  id: string
  /** Short edge × long edge, in cm. */
  short: number
  long: number
  price: number
}

export const SIZES: PrintSize[] = [
  { id: '30x40', short: 30, long: 40, price: 22900 },
  { id: '50x70', short: 50, long: 70, price: 29900 },
  { id: '70x100', short: 70, long: 100, price: 37900 },
  { id: '100x140', short: 100, long: 140, price: 47900 },
]

/** A numbered, signed edition carries a premium over the open edition. */
export const LIMITED_PREMIUM = 1.6

export interface LifestyleShot {
  id: string
  label: string
  src: string
}

export interface Print {
  id: string
  number: string
  title: string
  collection: Collection
  location: string
  year: string
  orientation: Orientation
  /** Native-aspect print file. */
  image: string
  thumbnail: string
  /**
   * Real photography of this print hanging in a space. Optional — a print
   * without shots simply doesn't show the gallery, so the catalogue can grow
   * to 200 photographs without needing a shoot for each one.
   */
  lifestyle?: LifestyleShot[]
}

const media = (id: string, file: string) => `/media/prints/${id}/${file}`
const shot = (file: string) => `/media/lifestyle/${file}.jpg`

/**
 * The eight-scene interior set. These show a print hanging in real spaces and
 * are used for the page-level "In a space" editorial section, since they were
 * shot with one photograph rather than per-product.
 */
export const SPACE_SHOTS: LifestyleShot[] = [
  { id: 'living', label: 'Living room', src: shot('living') },
  { id: 'kitchen', label: 'Kitchen', src: shot('kitchen') },
  { id: 'bedroom', label: 'Bedroom', src: shot('bedroom') },
  { id: 'office', label: 'Office', src: shot('office') },
  { id: 'hallway', label: 'Hallway', src: shot('hallway') },
  { id: 'staircase', label: 'Staircase', src: shot('staircase') },
  { id: 'dining', label: 'Dining room', src: shot('dining') },
  { id: 'detail', label: 'Detail', src: shot('detail') },
]

const PARASOLS_SHOTS: LifestyleShot[] = [
  { id: 'living', label: 'Living room', src: shot('parasols-living') },
]

const p = (
  id: string,
  title: string,
  collection: Collection,
  location: string,
  year: string,
  orientation: Orientation,
  lifestyle?: LifestyleShot[],
): Omit<Print, 'number'> => ({
  id,
  title,
  collection,
  location,
  year,
  orientation,
  image: media(id, 'print.jpg'),
  thumbnail: media(id, 'thumb.jpg'),
  ...(lifestyle ? { lifestyle } : {}),
})

/** Ordered strongest-first. */
const CATALOGUE: Omit<Print, 'number'>[] = [
  p('lattice', 'Lattice', 'Hard Edges', 'Singapore', '2026', 'portrait'),
  p('the-loop', 'The Loop', 'Thin Air', 'Ha Giang, Vietnam', '2026', 'portrait'),
  p('tower', 'Tower', 'Hard Edges', 'Berlin', '2026', 'portrait'),
  p('inlet', 'Inlet', 'Salt', 'Norway', '2026', 'portrait'),
  p('lift', 'Lift', 'Thin Air', 'Austria', '2026', 'portrait'),
  p('nave', 'Nave', 'Hard Edges', 'Berlin', '2026', 'portrait'),
  p('parasols', 'Parasols', 'Salt', 'Italy', '2026', 'portrait', PARASOLS_SHOTS),
  p('window-seat', 'Window Seat', 'In Transit', 'Somewhere', '2026', 'portrait'),
  p('shelters', 'Shelters', 'Salt', 'Italy', '2026', 'portrait'),
  p('terraces', 'Terraces', 'Hard Edges', 'Rotterdam', '2026', 'portrait'),
  p('range', 'Range', 'Thin Air', 'Vietnam', '2026', 'landscape'),
  p('downtown', 'Downtown', 'Street Level', 'New York', '2026', 'portrait'),
  p('through', 'Through', 'In Transit', 'Vietnam', '2026', 'portrait'),
  p('spire', 'Spire', 'Hard Edges', 'Berlin', '2026', 'portrait'),
  p('cliffs', 'Cliffs', 'Salt', 'Italy', '2026', 'portrait'),
  p('siesta', 'Siesta', 'Street Level', 'Italy', '2026', 'portrait'),
  p('saigon', 'Saigon', 'Street Level', 'Vietnam', '2026', 'portrait'),
  p('ridge', 'Ridge', 'Thin Air', 'Vietnam', '2026', 'portrait'),
  p('two-up', 'Two Up', 'In Transit', 'Vietnam', '2026', 'landscape'),
  p('overpass', 'Overpass', 'Street Level', 'New York', '2026', 'portrait'),
  p('herd', 'Herd', 'Thin Air', 'Vietnam', '2026', 'landscape'),
  p('roma', 'Roma', 'Street Level', 'Rome', '2026', 'portrait'),
  p('gable', 'Gable', 'Hard Edges', 'Netherlands', '2026', 'portrait'),
]

export const prints: Print[] = CATALOGUE.map((item, i) => ({
  ...item,
  number: String(i + 1).padStart(2, '0'),
}))

/** Size label oriented to the photograph — "70 × 100" or "100 × 70". */
export const sizeLabel = (size: PrintSize, orientation: Orientation) =>
  orientation === 'portrait'
    ? `${size.short} × ${size.long} cm`
    : `${size.long} × ${size.short} cm`

export const priceFor = (size: PrintSize, edition: Edition) =>
  edition === 'limited' ? Math.round((size.price * LIMITED_PREMIUM) / 100) * 100 : size.price

export const fromPrice = () => Math.min(...SIZES.map((s) => s.price))

export const formatPrice = (cents: number) =>
  new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(cents / 100)
