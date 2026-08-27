# Alex Martinotti — Portfolio

A cinematic, minimal portfolio built with React, TypeScript, Tailwind CSS v4 and Framer Motion. The site is structured as distinct scenes rather than a scrolling one-pager: Home → Projects → an individual Project → Contact, each a full route with its own directional transition.

## Run it

```bash
npm install
npm run dev
```

## Structure

- `src/data/projects.ts` — **every project lives here.** Add, remove or reorder projects by editing this array; the Projects index and every project page read from it automatically. Each project needs a unique `slug` (used in the URL `/work/<slug>`).
- `src/pages/Home.tsx` — the single-screen intro (video hero, name, one line, two links). No scroll needed to reach anything.
- `src/pages/ProjectsIndex.tsx` — the project list (`/projects`). Desktop hovers float a preview image that trails the cursor; mobile shows a static thumbnail per row since there's no hover to rely on.
- `src/pages/ProjectPage.tsx` — the full-screen case study for one project, ending in a `NEXT →` link to the next one.
- `src/pages/Contact.tsx` — the contact page (`/contact`), a one-question-at-a-time intake flow.
- `src/components/PageTransition.tsx` — the directional wipe every route uses on enter/exit.
- `src/components/CustomCursor.tsx` — a small trailing dot + label; the native cursor is never hidden, so clicking/scrolling/selecting all work normally. Disabled on touch devices.
- `src/lib/cursor-context.tsx` — drives the cursor's three states (`default`, `view`, `talk`).

## Navigation

`AM` on the left, a single `Menu` trigger on the right. It opens a full-screen overlay (`src/components/MenuOverlay.tsx`) listing About, Projects, Get my LUTs, Get my wallpaper, Contact — in that order. The nav text flips from white to black automatically depending on whether it's sitting over the dark hero/project image or white content (see `hasDarkHero` in `Navigation.tsx`).

## Hero video

The hero plays a placeholder reel (`src/pages/Home.tsx`, `HERO_VIDEO` constant) with a grayscale + slow zoom treatment. Once your real montage is ready:

1. Drop it at `public/media/hero/reel.mp4`.
2. Change `HERO_VIDEO` in `Home.tsx` to `"/media/hero/reel.mp4"`.
3. Optionally update `HERO_POSTER` to a still frame for the loading/fallback state.

## Replacing placeholder project media

Every project image is currently a placeholder from `picsum.photos`, rendered in grayscale via CSS so the site stays monochrome even before real media is in.

1. Drop your files into `public/media/<project-slug>/`, e.g. `public/media/eq-surf-retreat/cover.jpg`.
2. In `src/data/projects.ts`, change that project's `cover` and `gallery` values to `"/media/eq-surf-retreat/cover.jpg"` etc.

Recommended source sizes: covers ~2400px wide, gallery portraits ~1600×2000, gallery landscapes ~1800×1000. Keep everything reasonably compressed — the site is built to feel fast, not just look cinematic.

## The "Work with me" form

`Contact.tsx` has no backend yet — hitting Send composes a pre-filled `mailto:` to the address at the top of that file. Swap `handleSubmit` for a real form service (Formspree, Resend, etc.) when you're ready for real submissions without opening the visitor's email client.

## Editing copy

- Hero name/line: `src/pages/Home.tsx`
- Project titles, categories, one-line descriptions: `src/data/projects.ts`
- Contact page intro / fields: `src/pages/Contact.tsx`
- Email / Instagram: top of `src/pages/Contact.tsx` and `src/components/Footer.tsx`

## Design system

- Colors, fonts: `@theme` block in `src/index.css` (`--color-void` = background, `--color-ink` = text, `--color-line` = hairlines, `--color-muted` = secondary text). The site is white/light by default; the hero video and every project's hero image are intentionally dark for contrast.
- Display typeface: Archivo (black/bold weights) for all large headlines.
- Body typeface: Inter.
- `prefers-reduced-motion` is respected globally.
