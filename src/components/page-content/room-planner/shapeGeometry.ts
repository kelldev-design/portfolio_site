import {
  type DoorType,
  type FurnitureType,
  type OrientationType,
  type PlacementType,
  type RectType,
  type RotationType
} from '../../../types/roomPlannerTypes'

export interface SizeType {
  width: number
  depth: number
}

/* Converts a pointer position on screen to inches in an SVG drawn in inches. */
export const toSvgPoint = (
  svg: SVGSVGElement | null,
  event: { clientX: number, clientY: number }
): { x: number, y: number } => {
  const matrix = svg?.getScreenCTM()

  if (!matrix) return { x: 0, y: 0 }

  const point = new DOMPoint(
    event.clientX,
    event.clientY
  ).matrixTransform(matrix.inverse())

  return { x: point.x, y: point.y }
}

/* The bounding box of a shape whose rectangles start at 0, 0. */
export const shapeSize = (rects: RectType[]): SizeType => ({
  depth: Math.max(
    0,
    ...rects.map(({ depth, y }) => y + depth)
  ),
  width: Math.max(
    0,
    ...rects.map(({ width, x }) => x + width)
  )
})

/* Drops empty rectangles and shifts the rest so the shape starts at 0, 0. */
export const normalizeRects = (rects: RectType[]): RectType[] => {
  const kept = rects.filter(({ depth, width }) => width > 0 && depth > 0)
  const minX = Math.min(...kept.map(({ x }) => x))
  const minY = Math.min(...kept.map(({ y }) => y))

  return kept.map(rect => ({ ...rect, x: rect.x - minX, y: rect.y - minY }))
}

/* Turns a shape a quarter turn clockwise, keeping it at 0, 0. */
const rotateQuarter = (rects: RectType[]): RectType[] => {
  const { depth } = shapeSize(rects)

  return rects.map(rect => ({
    depth: rect.width,
    width: rect.depth,
    x: depth - (rect.y + rect.depth),
    y: rect.x
  }))
}

export const rotateRects = (
  rects: RectType[],
  rotation: RotationType
): RectType[] => {
  let rotated = rects

  for (let turn = 0; turn < rotation / 90; turn++) rotated = rotateQuarter(rotated)

  return rotated
}

export const offsetRects = (
  rects: RectType[],
  x: number,
  y: number
): RectType[] => rects.map(rect => ({ ...rect, x: rect.x + x, y: rect.y + y }))

/* A piece's rectangles as they sit in the room, turned and moved into place. */
export const placedRects = (
  furniture: FurnitureType,
  placement: PlacementType
): RectType[] => offsetRects(
  rotateRects(
    furniture.rects,
    placement.rotation
  ),
  placement.x,
  placement.y
)

/* The bounding box a piece takes up once rotated. */
export const placedSize = (
  furniture: FurnitureType,
  rotation: RotationType
): SizeType => shapeSize(rotateRects(
  furniture.rects,
  rotation
))

const sortedEdges = (values: number[]): number[] => [ ...new Set(values) ].sort((a, b) => a - b)

const containsPoint = (
  rects: RectType[],
  x: number,
  y: number
): boolean => rects.some(rect => x > rect.x && x < rect.x + rect.width && y > rect.y && y < rect.y + rect.depth)

/* Splits the plane along every rectangle edge into cells that are each wholly inside or
   wholly outside every rectangle, so a cell's centre answers for the whole cell. */
const cellGrid = (rects: RectType[]): { xs: number[], ys: number[] } => ({
  xs: sortedEdges(rects.flatMap(({ width, x }) => [ x, x + width ])),
  ys: sortedEdges(rects.flatMap(({ depth, y }) => [ y, y + depth ]))
})

/* One straight stretch of a shape's outline, from x, y along its orientation. */
export interface WallType {
  orientation: OrientationType
  x: number
  y: number
  length: number
}

/* The outline of the merged rectangles as straight walls, each as long as it can be, with
   no walls where two rectangles overlap or touch. */
export const wallSegments = (rects: RectType[]): WallType[] => {
  const { xs, ys } = cellGrid(rects)
  const isFilled = (column: number, row: number): boolean =>
    column >= 0 && row >= 0 && column < xs.length - 1 && row < ys.length - 1 && containsPoint(
      rects,
      (xs[column] + xs[column + 1]) / 2,
      (ys[row] + ys[row + 1]) / 2
    )
  const walls: WallType[] = []

  // Along each grid line, an edge runs wherever the cells either side differ. Neighbouring
  // edges join into one wall while the room stays on the same side of them.
  for (let row = 0; row < ys.length; row++) {
    let start = 0
    let side = 0

    for (let column = 0; column < xs.length; column++) {
      const above = isFilled(
        column,
        row - 1
      )
      const below = isFilled(
        column,
        row
      )
      const edgeSide = above === below ? 0 : below ? 1 : -1

      if (edgeSide === side) continue
      if (side) walls.push({ length: xs[column] - xs[start], orientation: 'horizontal', x: xs[start], y: ys[row] })

      start = column
      side = edgeSide
    }
  }

  for (let column = 0; column < xs.length; column++) {
    let start = 0
    let side = 0

    for (let row = 0; row < ys.length; row++) {
      const left = isFilled(
        column - 1,
        row
      )
      const right = isFilled(
        column,
        row
      )
      const edgeSide = left === right ? 0 : right ? 1 : -1

      if (edgeSide === side) continue
      if (side) walls.push({ length: ys[row] - ys[start], orientation: 'vertical', x: xs[column], y: ys[start] })

      start = row
      side = edgeSide
    }
  }

  return walls
}

/* Where to label a wall's length: just off its middle on the side away from the floor,
   offset by gap. */
export const wallLabelPoint = (
  rects: RectType[],
  wall: WallType,
  gap: number
): { x: number, y: number } => {
  const isHorizontal = wall.orientation === 'horizontal'
  const middle = isHorizontal
    ? { x: wall.x + wall.length / 2, y: wall.y }
    : { x: wall.x, y: wall.y + wall.length / 2 }
  const floorAfter = containsPoint(
    rects,
    middle.x + (isHorizontal ? 0 : 0.5),
    middle.y + (isHorizontal ? 0.5 : 0)
  )
  const outward = floorAfter ? -gap : gap

  return isHorizontal
    ? { x: middle.x, y: middle.y + outward }
    : { x: middle.x + outward, y: middle.y }
}

/* An SVG path tracing the outline of the merged rectangles. */
export const outlinePath = (rects: RectType[]): string => wallSegments(rects)
  .map(({ length, orientation, x, y }) => orientation === 'horizontal' ? `M${x} ${y}H${x + length}` : `M${x} ${y}V${y + length}`)
  .join('')

/* Where a door of the given width sits on the wall nearest point, centred on point as far
   as that wall allows. null when no wall is long enough for it. */
export const snapToWall = (
  rects: RectType[],
  point: { x: number, y: number },
  width: number
): Pick<DoorType, 'orientation' | 'x' | 'y'> | null => {
  let best: Pick<DoorType, 'orientation' | 'x' | 'y'> | null = null
  let bestDistance = Infinity

  for (const wall of wallSegments(rects)) {
    if (wall.length < width) continue

    const isHorizontal = wall.orientation === 'horizontal'
    const along = isHorizontal ? point.x - wall.x : point.y - wall.y
    const offset = Math.max(
      0,
      Math.min(
        Math.round(along - width / 2),
        wall.length - width
      )
    )
    const x = isHorizontal ? wall.x + offset : wall.x
    const y = isHorizontal ? wall.y : wall.y + offset
    const distance = Math.hypot(
      point.x - (isHorizontal ? x + width / 2 : x),
      point.y - (isHorizontal ? y : y + width / 2)
    )

    if (distance < bestDistance) {
      best = { orientation: wall.orientation, x, y }
      bestDistance = distance
    }
  }

  return best
}

/* The wall a door sits on, and how far along it the door starts. undefined if the door is
   on no wall, which snapping should never leave it. */
export const doorWall = (
  rects: RectType[],
  door: DoorType
): { wall: WallType, offset: number } | undefined => {
  const isHorizontal = door.orientation === 'horizontal'

  for (const wall of wallSegments(rects)) {
    if (wall.orientation !== door.orientation) continue
    if (isHorizontal ? wall.y !== door.y : wall.x !== door.x) continue

    const offset = isHorizontal ? door.x - wall.x : door.y - wall.y

    if (offset >= 0 && offset + door.width <= wall.length) return { offset, wall }
  }

  return undefined
}

/* The middle of a door's opening. */
export const doorCentre = (door: DoorType): { x: number, y: number } => door.orientation === 'horizontal'
  ? { x: door.x + door.width / 2, y: door.y }
  : { x: door.x, y: door.y + door.width / 2 }

interface PointType {
  x: number
  y: number
}

export interface DoorGeometryType {
  /* The two ends of the opening. */
  start: PointType
  end: PointType
  /* The hinge, and where the open leaf's tip reaches. */
  hinge: PointType
  tip: PointType
  /* The end of the opening the leaf closes against. */
  latch: PointType
  /* SVG's sweep flag for the arc from tip to latch. */
  sweep: 0 | 1
  /* The square a door swings through, or a strip either side of an opening, for clicking. */
  bounds: RectType
  /* Short lines across the wall at each end of the opening, marking its frame. */
  jambs: string
}

/* How far an opening's clickable strip and jamb lines reach either side of its wall. */
const OPENING_REACH = 4

/* Works out how to draw a door: which side of its wall is the room, and so which way the
   leaf opens. */
export const doorGeometry = (
  rects: RectType[],
  door: DoorType
): DoorGeometryType => {
  const isHorizontal = door.orientation === 'horizontal'
  const start = { x: door.x, y: door.y }
  const end = isHorizontal ? { x: door.x + door.width, y: door.y } : { x: door.x, y: door.y + door.width }
  const centre = doorCentre(door)
  // Whichever side of the wall is floor, just past the middle of the opening.
  const towardsRoom = containsPoint(
    rects,
    centre.x + (isHorizontal ? 0 : 0.5),
    centre.y + (isHorizontal ? 0.5 : 0)
  )
    ? 1
    : -1
  const direction = door.swing === 'in' ? towardsRoom : -towardsRoom
  const normal = isHorizontal ? { x: 0, y: direction } : { x: direction, y: 0 }
  const [ hinge, latch ] = door.hinge === 'start' ? [ start, end ] : [ end, start ]
  const tip = { x: hinge.x + normal.x * door.width, y: hinge.y + normal.y * door.width }
  const cross = (tip.x - hinge.x) * (latch.y - hinge.y) - (tip.y - hinge.y) * (latch.x - hinge.x)
  const across = isHorizontal ? { x: 0, y: OPENING_REACH } : { x: OPENING_REACH, y: 0 }
  const jambs = [ start, end ]
    .map(({ x, y }) => `M${x - across.x} ${y - across.y}L${x + across.x} ${y + across.y}`)
    .join('')
  // An opening has no leaf, so only the wall either side of it is clickable.
  const corners = door.kind === 'opening'
    ? [
      { x: start.x - across.x, y: start.y - across.y },
      { x: end.x + across.x, y: end.y + across.y }
    ]
    : [ start, end, tip, { x: latch.x + normal.x * door.width, y: latch.y + normal.y * door.width }]
  const left = Math.min(...corners.map(({ x }) => x))
  const top = Math.min(...corners.map(({ y }) => y))

  return {
    bounds: {
      depth: Math.max(...corners.map(({ y }) => y)) - top,
      width: Math.max(...corners.map(({ x }) => x)) - left,
      x: left,
      y: top
    },
    end,
    hinge,
    jambs,
    latch,
    start,
    sweep: cross > 0 ? 1 : 0,
    tip
  }
}

/* Whether every part of target lies inside container. */
export const isWithin = (
  container: RectType[],
  target: RectType[]
): boolean => {
  const { xs, ys } = cellGrid([ ...container, ...target ])

  for (let column = 0; column < xs.length - 1; column++) {
    for (let row = 0; row < ys.length - 1; row++) {
      const x = (xs[column] + xs[column + 1]) / 2
      const y = (ys[row] + ys[row + 1]) / 2

      if (containsPoint(
        target,
        x,
        y
      ) && !containsPoint(
        container,
        x,
        y
      )) return false
    }
  }

  return true
}
