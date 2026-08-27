export interface Film {
  src: string
  poster: string
  /** Drives the player's frame: vertical films get a narrow column, not a letterboxed slab. */
  aspect: 'vertical' | 'landscape'
}

export interface Project {
  slug: string
  number: string
  title: string
  categories: string[]
  year: string
  client: string
  description: string
  /** Full-size cover — the project page hero. */
  cover: string
  /** Small cover — the archive hover preview. Kept light so the archive stays instant. */
  preview: string
  /** One or more films, played in order. */
  films: Film[]
  /** Stills shown below the films on the project page. */
  gallery: string[]
}

/**
 * All media lives in public/media/projects/<slug>/:
 *   cover.jpg
 *   film-01.mp4 + film-01-poster.jpg  (film-02… for extra films)
 *   01.jpg, 02.jpg…                   (stills)
 * To swap any of it, replace the file. To add a film or still, drop in the
 * next numbered file and bump `films` / `stills` below.
 */
const media = (slug: string, file: string) => `/media/projects/${slug}/${file}`
const pad = (n: number) => String(n).padStart(2, '0')

const project = (
  slug: string,
  number: string,
  title: string,
  categories: string[],
  year: string,
  client: string,
  description: string,
  aspect: 'vertical' | 'landscape',
  films: number,
  stills: number,
): Project => ({
  slug,
  number,
  title,
  categories,
  year,
  client,
  description,
  cover: media(slug, 'cover.jpg'),
  preview: media(slug, 'preview.jpg'),
  films: Array.from({ length: films }, (_, i) => ({
    src: media(slug, `film-${pad(i + 1)}.mp4`),
    poster: media(slug, `film-${pad(i + 1)}-poster.jpg`),
    aspect,
  })),
  gallery: Array.from({ length: stills }, (_, i) => media(slug, `${pad(i + 1)}.jpg`)),
})

export const projects: Project[] = [
  project('eq', '01', 'EQ', ['Film', 'Brand'], '2026', 'EQ',
    'Salt water, early light, a week that never quite felt like work.', 'landscape', 1, 1),

  project('vietnam', '02', 'Vietnam', ['Film', 'Documentary'], '2026', 'Personal',
    'Four days on the loop. Mountains that refuse to photograph small.', 'landscape', 1, 5),

  project('anti-sweat', '03', 'Anti-Sweat', ['Campaign', 'Social'], '2026', 'Anti-Sweat',
    'Product work that had no interest in looking like product work.', 'vertical', 1, 4),

  project('lombok', '04', 'Lombok Surf Hostel', ['Film', 'Brand'], '2026', 'Lombok Surf Hostel',
    'A place that sells the morning, not the room.', 'vertical', 1, 5),

  project('nyc', '05', 'NYC Race Day', ['Film', 'Event'], '2026', 'Personal',
    'One city, one morning, everybody running.', 'vertical', 1, 4),

  project('berlin', '06', 'Berlin Event Week', ['Film', 'Event'], '2026', 'Personal',
    'A week of rooms that were louder than the schedule suggested.', 'vertical', 2, 3),
]
