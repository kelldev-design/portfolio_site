import { type RectType } from '../../../types/roomPlannerTypes'

/* How close, in screen pixels, an edge must come to another before it snaps to it. */
export const SNAP_PIXELS = 8

/* Edges something can snap to: x positions of vertical lines and y positions of
   horizontal ones. */
export interface SnapTargetsType {
  xs: number[]
  ys: number[]
}

/* Where an edge landed on a target, drawn as a guide line while dragging. */
export interface SnapGuidesType {
  x: number | null
  y: number | null
}

export const NO_GUIDES: SnapGuidesType = { x: null, y: null }

export const rectEdges = (rects: RectType[]): SnapTargetsType => ({
  xs: rects.flatMap(({ width, x }) => [ x, x + width ]),
  ys: rects.flatMap(({ depth, y }) => [ y, y + depth ])
})

/* The smallest shift that puts one of the edges exactly on a target, if any is within
   tolerance, and the target it lands on. */
export const snapAxis = (
  edges: number[],
  targets: number[],
  tolerance: number
): { offset: number, target: number | null } => {
  let best: { offset: number, target: number | null } = { offset: 0, target: null }

  for (const edge of edges) {
    for (const target of targets) {
      const offset = target - edge

      if (Math.abs(offset) <= tolerance && (best.target === null || Math.abs(offset) < Math.abs(best.offset))) {
        best = { offset, target }
      }
    }
  }

  return best
}

/* Shifts rectangles so the nearest of their edges meets a target edge on each axis. */
export const snapRects = (
  rects: RectType[],
  targets: SnapTargetsType,
  tolerance: number
): { dx: number, dy: number, guides: SnapGuidesType } => {
  const edges = rectEdges(rects)
  const x = snapAxis(
    edges.xs,
    targets.xs,
    tolerance
  )
  const y = snapAxis(
    edges.ys,
    targets.ys,
    tolerance
  )

  return { dx: x.offset, dy: y.offset, guides: { x: x.target, y: y.target } }
}

/* Moves a single point, such as a corner being dragged, onto any target within tolerance. */
export const snapPoint = (
  point: { x: number, y: number },
  targets: SnapTargetsType,
  tolerance: number
): { point: { x: number, y: number }, guides: SnapGuidesType } => {
  const x = snapAxis(
    [ point.x ],
    targets.xs,
    tolerance
  )
  const y = snapAxis(
    [ point.y ],
    targets.ys,
    tolerance
  )

  return {
    guides: { x: x.target, y: y.target },
    point: { x: point.x + x.offset, y: point.y + y.offset }
  }
}
