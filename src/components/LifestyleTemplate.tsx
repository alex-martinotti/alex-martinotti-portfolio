import { useState } from 'react'
import { TEMPLATES, type TemplateId } from '../data/templates'

/**
 * Composites artwork into the empty frames of a master interior photograph.
 *
 *   background room  →  artwork (inside the aperture)  →  glare from the room
 *
 * The artwork is clipped to the frame's measured opening, so it can't spill
 * over the moulding, and uses object-fit: cover — never stretched, only
 * cropped to the aperture. The whole composite sits in one aspect-locked box,
 * so it stays aligned at any viewport width.
 *
 * If the template image fails, the artwork is shown on its own rather than an
 * empty frame or a broken image.
 */
export function LifestyleTemplate({
  template,
  artwork,
  alt,
  /** One entry per frame; a single artwork fills every slot. */
  artworks,
  priority = false,
  className = '',
}: {
  template: TemplateId
  artwork: string
  alt: string
  artworks?: string[]
  priority?: boolean
  className?: string
}) {
  const def = TEMPLATES[template]
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <img
        src={artwork}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={`w-full ${className}`}
      />
    )
  }

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{ aspectRatio: `${def.width} / ${def.height}` }}
    >
      <img
        src={def.src}
        alt=""
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onError={() => setFailed(true)}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {def.slots.map((slot, i) => {
        const art = artworks?.[i] ?? artwork
        return (
          <div
            key={i}
            className="absolute overflow-hidden"
            style={{
              left: `${slot.left}%`,
              top: `${slot.top}%`,
              width: `${slot.width}%`,
              height: `${slot.height}%`,
              transform: slot.rotate ? `rotate(${slot.rotate}deg)` : undefined,
            }}
          >
            <img
              src={art}
              alt={i === 0 ? alt : ''}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
        )
      })}

      {/* the room's own reflections, laid back over the artwork */}
      {def.glare ? (
        <img
          src={def.src}
          alt=""
          aria-hidden="true"
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover mix-blend-screen"
          style={{ opacity: def.glare }}
        />
      ) : null}
    </div>
  )
}
