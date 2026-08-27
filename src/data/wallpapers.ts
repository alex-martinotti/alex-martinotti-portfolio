export type Device = 'iphone' | 'desktop'

/** Desktop crops on offer. Labels double as the on-screen option list. */
export const DESKTOP_RATIOS = ['16:9', '16:10', '4:3', '5:4'] as const
export type DesktopRatio = (typeof DESKTOP_RATIOS)[number]

export interface Wallpaper {
  slug: string
  number: string
  title: string
  /** Where it was shot — the only copy on the card. */
  location: string
  year: string
  /** Small grid/preview image. */
  preview: string
  /** Prices in euro cents, per device. Omit a device to not offer it. */
  iphone?: { price: number }
  desktop?: { price: number }
}

/**
 * Wallpaper files live in public/media/wallpapers/<slug>/:
 *   preview.jpg              — the grid thumbnail (~800px, light)
 *   iphone.jpg               — 1290 × 2796
 *   desktop-16x9.jpg         — 3840 × 2160
 *   desktop-16x10.jpg        — 3840 × 2400
 *   desktop-4x3.jpg          — 3840 × 2880
 *   desktop-5x4.jpg          — 3840 × 3072
 *
 * Only `preview.jpg` is served publicly. The full-resolution files are
 * delivered after purchase, so they must NOT be committed to public/ once
 * payments are live — see README for the protected-delivery setup.
 *
 * To add a wallpaper: create the folder, add the files, add an entry here.
 */
const media = (slug: string, file: string) => `/media/wallpapers/${slug}/${file}`

export const previewSrc = (w: Wallpaper) => w.preview

export const fileFor = (slug: string, device: Device, ratio?: DesktopRatio) =>
  device === 'iphone'
    ? media(slug, 'iphone.jpg')
    : media(slug, `desktop-${(ratio ?? '16:9').replace(':', 'x')}.jpg`)

const wallpaper = (
  slug: string,
  number: string,
  title: string,
  location: string,
  year: string,
  devices: { iphone?: number; desktop?: number },
): Wallpaper => ({
  slug,
  number,
  title,
  location,
  year,
  preview: media(slug, 'preview.jpg'),
  ...(devices.iphone ? { iphone: { price: devices.iphone } } : {}),
  ...(devices.desktop ? { desktop: { price: devices.desktop } } : {}),
})

/** Prices in cents — 700 = €7.00 */
export const wallpapers: Wallpaper[] = [
  wallpaper('ha-giang', '01', 'Ha Giang', 'Vietnam', '2026', { iphone: 700, desktop: 900 }),
  wallpaper('berlin-tower', '02', 'Berlin Tower', 'Germany', '2026', { iphone: 700, desktop: 900 }),
  wallpaper('lombok', '03', 'Lombok', 'Indonesia', '2026', { iphone: 700, desktop: 900 }),
]

export const formatPrice = (cents: number) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(cents / 100)
