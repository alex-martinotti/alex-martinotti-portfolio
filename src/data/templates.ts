/**
 * Master interior templates.
 *
 * Each is a real photograph containing empty frames. The selected artwork is
 * composited into the frame apertures at runtime, so one template serves the
 * whole catalogue — no per-photograph room images, however many prints exist.
 *
 * Slot coordinates are percentages of the template's own dimensions, measured
 * from the actual pixels of each frame's inner opening. Because they're
 * percentages and the artwork is positioned inside the same aspect-locked box
 * as the background, the composite stays aligned at every viewport size.
 */
export type TemplateId = 'living' | 'kitchen' | 'bedroom' | 'hallway' | 'paper'

export interface ArtworkSlot {
  /** All percentages of the template image. */
  left: number
  top: number
  width: number
  height: number
  /** Degrees, for templates where the artwork plane isn't square to camera. */
  rotate?: number
}

export interface LifestyleTemplateDef {
  id: TemplateId
  label: string
  src: string
  /** Intrinsic pixels — drives the aspect-locked container. */
  width: number
  height: number
  slots: ArtworkSlot[]
  /**
   * Re-layer the template over the artwork (screen blend, low opacity) so the
   * glass reflections baked into the photograph fall across the artwork
   * instead of sitting behind it. Uses the real asset, not a synthetic effect.
   */
  glare?: number
}

const src = (id: string) => `/media/templates/${id}.jpg`

export const TEMPLATES: Record<TemplateId, LifestyleTemplateDef> = {
  living: {
    id: 'living',
    label: 'Living room',
    src: src('living'),
    width: 1200,
    height: 896,
    slots: [{ left: 31.0, top: 17.75, width: 37.08, height: 36.5 }],
    glare: 0.28,
  },
  kitchen: {
    id: 'kitchen',
    label: 'Kitchen',
    src: src('kitchen'),
    width: 896,
    height: 1200,
    // Three independent apertures — ready for curated triptychs.
    slots: [
      { left: 22.54, top: 24.33, width: 17.41, height: 21.25 },
      { left: 43.19, top: 23.5, width: 18.75, height: 21.83 },
      { left: 65.4, top: 22.5, width: 20.09, height: 22.67 },
    ],
    glare: 0.32,
  },
  bedroom: {
    id: 'bedroom',
    label: 'Bedroom',
    src: src('bedroom'),
    width: 896,
    height: 1200,
    slots: [{ left: 45.09, top: 12.75, width: 38.5, height: 40.92 }],
    glare: 0.26,
  },
  hallway: {
    id: 'hallway',
    label: 'Hallway',
    src: src('hallway'),
    width: 896,
    height: 1200,
    slots: [{ left: 23.21, top: 28.42, width: 32.37, height: 34.83 }],
    glare: 0.24,
  },
  paper: {
    id: 'paper',
    label: 'Detail',
    src: src('paper'),
    width: 1402,
    height: 1122,
    // The sheet lies at an angle; the artwork is inset within it so the paper
    // border and edge stay visible, and rotated onto the same plane.
    slots: [{ left: 20, top: 26, width: 58, height: 44, rotate: -8.5 }],
  },
}

/** Environments offered on the product page, in order. */
export const ROOM_TEMPLATES: TemplateId[] = ['living', 'kitchen', 'bedroom', 'hallway']

/**
 * Deterministic template per catalogue position, so the grid alternates
 * environments instead of repeating one room down the page.
 */
export const templateForIndex = (index: number): TemplateId =>
  ROOM_TEMPLATES[index % ROOM_TEMPLATES.length]
