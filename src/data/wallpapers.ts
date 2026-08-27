export type Device = 'iphone' | 'desktop'
export type IPhoneMode = 'lock' | 'home'

export const DESKTOP_RATIOS = ['16:9', '16:10', '4:3', '5:4'] as const
export type DesktopRatio = (typeof DESKTOP_RATIOS)[number]

export interface Wallpaper {
  id: string
  number: string
  title: string
  location: string
  year: string
  price: number
  /** Small, lazy-loaded — the catalogue strip only. */
  thumbnail: string
  /** Screen-sized previews. A format the photograph doesn't have is simply omitted. */
  iphone?: { preview: string }
  desktop?: Partial<Record<DesktopRatio, string>>
}

/**
 * Files live in public/media/wallpapers/<id>/:
 *   thumb.jpg              ~400px, catalogue strip
 *   iphone.jpg             9:19.5 preview
 *   desktop-16x9.jpg …     one per offered ratio
 *
 * These are PREVIEWS. The full-resolution downloads are the actual product and
 * must not sit in public/ once checkout is live — they'd be freely fetchable.
 *
 * To add a photograph: make the folder, drop in the crops you have, add an
 * entry below. Omit `iphone` or any ratio you didn't produce and the UI hides
 * that option automatically.
 */
const media = (id: string, file: string) => `/media/wallpapers/${id}/${file}`

const ratioFile = (r: DesktopRatio) => `desktop-${r.replace(':', 'x')}.jpg`

/** Build a desktop map from the ratios that actually exist for this photograph. */
const desktopSet = (id: string, ratios: DesktopRatio[]) =>
  ratios.reduce<Partial<Record<DesktopRatio, string>>>((acc, r) => {
    acc[r] = media(id, ratioFile(r))
    return acc
  }, {})

const wallpaper = (
  id: string,
  number: string,
  title: string,
  location: string,
  year: string,
  price: number,
  opts: { iphone?: boolean; desktop?: DesktopRatio[] },
): Wallpaper => ({
  id,
  number,
  title,
  location,
  year,
  price,
  thumbnail: media(id, 'thumb.jpg'),
  ...(opts.iphone ? { iphone: { preview: media(id, 'iphone.jpg') } } : {}),
  ...(opts.desktop?.length ? { desktop: desktopSet(id, opts.desktop) } : {}),
})

const ALL_RATIOS = [...DESKTOP_RATIOS]

/** Prices in cents — 700 = €7.00 */
export const wallpapers: Wallpaper[] = [
  wallpaper('ha-giang', '01', 'Ha Giang', 'Vietnam', '2026', 700, {
    iphone: true,
    desktop: ALL_RATIOS,
  }),
  wallpaper('berlin-tower', '02', 'Berlin Tower', 'Germany', '2026', 700, {
    iphone: true,
    desktop: ALL_RATIOS,
  }),
  wallpaper('lombok', '03', 'Lombok', 'Indonesia', '2026', 700, {
    iphone: true,
    desktop: ALL_RATIOS,
  }),
]

/** Which desktop ratios this photograph actually offers, in canonical order. */
export const ratiosFor = (w: Wallpaper): DesktopRatio[] =>
  DESKTOP_RATIOS.filter((r) => Boolean(w.desktop?.[r]))

export const formatPrice = (cents: number) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(cents / 100)
