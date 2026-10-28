import { type RectType } from '../../../types/roomPlannerTypes'

/* The compass point of a resize handle: a corner or the middle of a side. */
export type HandleType = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'

/* The smallest a rectangle can be resized to, in inches. */
const MIN_SIZE = 1

/* The rectangle with the sides its handle moves taken to the pointer, never smaller than
   MIN_SIZE and never flipped past the opposite side. */
export const resizeRect = (
  start: RectType,
  handle: HandleType,
  point: { x: number, y: number }
): RectType => {
  const right = start.x + start.width
  const bottom = start.y + start.depth
  let { depth, width, x, y } = start

  if (handle.includes('w')) {
    x = Math.min(
      point.x,
      right - MIN_SIZE
    )
    width = right - x
  } else if (handle.includes('e')) {
    width = Math.max(
      MIN_SIZE,
      point.x - start.x
    )
  }

  if (handle.startsWith('n')) {
    y = Math.min(
      point.y,
      bottom - MIN_SIZE
    )
    depth = bottom - y
  } else if (handle.startsWith('s')) {
    depth = Math.max(
      MIN_SIZE,
      point.y - start.y
    )
  }

  return { depth, width, x, y }
}
