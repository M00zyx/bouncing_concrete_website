const clamp = value => Math.max(0, Math.min(1, value))

// The film completes before the wall closes; the hero remains 300vh.
export function filmState(progress, reducedMotion = false) {
  const p = clamp(progress)
  if (reducedMotion) return { poster: 1, film: 0, closure: 0, retreat: 0 }
  return {
    poster: 1 - clamp((p - .08) / .2),
    film: clamp((p - .12) / .72),
    closure: clamp((p - .84) / .16),
    retreat: clamp(p / .28),
  }
}
