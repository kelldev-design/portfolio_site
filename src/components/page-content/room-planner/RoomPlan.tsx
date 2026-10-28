import {
  type FunctionComponent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactElement,
  useRef,
  useState
} from 'react'
import styled from 'styled-components'
import {
  type HandleType,
  resizeRect
} from './resizing'
import { clamp } from './roomPlannerStorage'
import { RoomPlanStyles } from './RoomPlanStyles'
import { SelectionOverlay } from './SelectionOverlay'
import {
  doorGeometry,
  doorWall,
  isWithin,
  outlinePath,
  placedRects,
  placedSize,
  shapeSize,
  snapToWall,
  toSvgPoint,
  wallLabelPoint,
  wallSegments,
  type WallType
} from './shapeGeometry'
import {
  NO_GUIDES,
  rectEdges,
  SNAP_PIXELS,
  type SnapGuidesType,
  type SnapTargetsType,
  snapPoint,
  snapRects
} from './snapping'
import {
  type DoorType,
  type FurnitureType,
  type PlacementType,
  type RectType,
  type RoomShapeType,
  type RoomType
} from '../../../types/roomPlannerTypes'
import { useDragGate } from '../../hooks/useDragGate'
import { useElementSize } from '../../hooks/useElementSize'

const RoomPlanStyled = styled.div`${RoomPlanStyles}`

/* Grid lines every inch, six inches and foot, each heavier than the last. Inch lines are
   left out when they would be under MIN_INCH_PIXELS device pixels apart, where they blur
   into grey; measured in device pixels so high density screens keep them at smaller sizes. */
const GRID_LEVELS = [
  { className: 'room-plan-grid-inch', step: 1 },
  { className: 'room-plan-grid-half-foot', step: 6 },
  { className: 'room-plan-grid-foot', step: 12 }
]
const MIN_INCH_PIXELS = 5

/* Arrow keys nudge an inch, or a foot with shift held. */
const NUDGE = 1
const NUDGE_LARGE = 12

/* A piece of furniture or a shape follows the pointer; a door slides to the wall nearest
   it; a shape's handle resizes it; and a drag on empty floor draws a new shape. */
type DragType =
  | { kind: 'placement', id: string, offsetX: number, offsetY: number }
  | { kind: 'door', id: string }
  | { kind: 'shape', id: string, offsetX: number, offsetY: number }
  | { kind: 'resize', id: string, handle: HandleType, start: RectType }
  | { kind: 'draw', startX: number, startY: number }

/* A round button beside a selection: its icon is drawn about cx, cy with arms of arm. */
interface ActionType {
  className: string
  icon: (cx: number, cy: number, arm: number) => string
  label: string
  onActivate: () => void
}

/* Excluded from a drag's snap targets: the thing being dragged. */
interface SnapExcludeType {
  placementId?: string
  shapeId?: string
}

interface RoomPlanPropsType {
  furnitureMap: Record<string, FurnitureType>
  onDoorChange: (doorId: string, changes: Partial<DoorType>) => void
  onDoorRemove: (doorId: string) => void
  onDoorSelect: (doorId: string) => void
  onDuplicate: (placementId: string) => void
  onMove: (placementId: string, x: number, y: number) => void
  onRemove: (placementId: string) => void
  onRotate: (placementId: string) => void
  /** Selects a piece, or with '' clears any selection, piece, door or shape. */
  onSelect: (placementId: string) => void
  onShapeChange: (shapeId: string, changes: Partial<RectType>) => void
  onShapeCreate: (rect: RectType) => void
  onShapeRemove: (shapeId: string) => void
  onShapeSelect: (shapeId: string) => void
  room: RoomType
  selectedDoorId: string
  selectedPlacementId: string
  selectedShapeId: string
}

export const RoomPlan: FunctionComponent<RoomPlanPropsType> = ({
  furnitureMap,
  onDoorChange,
  onDoorRemove,
  onDoorSelect,
  onDuplicate,
  onMove,
  onRemove,
  onRotate,
  onSelect,
  onShapeChange,
  onShapeCreate,
  onShapeRemove,
  onShapeSelect,
  room,
  selectedDoorId,
  selectedPlacementId,
  selectedShapeId
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const svgSize = useElementSize(svgRef)
  const dragRef = useRef<DragType | null>(null)
  // A first tap only selects; see useDragGate.
  const dragGate = useDragGate()
  const roomSize = shapeSize(room.rects)
  const floorClipId = `room-floor-${room.id}`
  const selectedPlacement = room.placements.find(({ id }) => id === selectedPlacementId)
  const selectedShape = room.shapes.find(({ id }) => id === selectedShapeId)
  // The shape being drawn, read from a ref by pointer handlers; see ShapeEditor.
  const draftRef = useRef<RectType | null>(null)
  const [ draft, setDraft ] = useState<RectType | null>(null)
  // The edges a drag has snapped to, shown as guide lines while it lasts.
  const [ guides, setGuides ] = useState<SnapGuidesType>(NO_GUIDES)

  // Room for the dimension labels around the plan.
  const padding = Math.max(
    roomSize.width,
    roomSize.depth
  ) * 0.08
  // Doors swinging out reach past the walls, so the view grows to keep their arcs in sight.
  const doorBounds = room.doors.map(door => doorGeometry(
    room.rects,
    door
  ).bounds)
  const view = {
    left: Math.min(
      0,
      ...doorBounds.map(({ x }) => x)
    ) - padding,
    top: Math.min(
      0,
      ...doorBounds.map(({ y }) => y)
    ) - padding,
    right: Math.max(
      roomSize.width,
      ...doorBounds.map(({ width, x }) => x + width)
    ) + padding,
    bottom: Math.max(
      roomSize.depth,
      ...doorBounds.map(({ depth, y }) => y + depth)
    ) + padding
  }
  const labelSize = Math.max(
    roomSize.width,
    roomSize.depth
  ) / 40
  // Inches per screen pixel, to keep buttons, handles and snapping one size on screen.
  const unit = svgSize.width && svgSize.height
    ? Math.max(
      (view.right - view.left) / svgSize.width,
      (view.bottom - view.top) / svgSize.height
    )
    : 0

  /* The walls, and the edges of every piece and shape but the one being dragged. */
  const snapTargets = ({ placementId, shapeId }: SnapExcludeType): SnapTargetsType => {
    const walls = wallSegments(room.rects)
    const others = rectEdges([
      ...room.placements.flatMap(placement => {
        const furniture = furnitureMap[placement.furnitureId]

        return placement.id === placementId || !furniture
          ? []
          : placedRects(
            furniture,
            placement
          )
      }),
      ...room.shapes.filter(({ id }) => id !== shapeId)
    ])

    return {
      xs: [ ...walls.filter(({ orientation }) => orientation === 'vertical').map(({ x }) => x), ...others.xs ],
      ys: [ ...walls.filter(({ orientation }) => orientation === 'horizontal').map(({ y }) => y), ...others.ys ]
    }
  }

  /* Shifts rectangles about to be placed so an edge near a wall or another edge meets it,
     unless alt is held. */
  const snapMove = (
    event: { altKey: boolean },
    rects: RectType[],
    exclude: SnapExcludeType
  ): { dx: number, dy: number, guides: SnapGuidesType } => {
    const snapped = event.altKey || !unit
      ? { dx: 0, dy: 0, guides: NO_GUIDES }
      : snapRects(
        rects,
        snapTargets(exclude),
        SNAP_PIXELS * unit
      )

    setGuides(snapped.guides)

    return snapped
  }

  /* The pointer in the room, on a wall or edge when near one and otherwise on a whole inch,
     kept inside the room's bounding box. */
  const snappedPointer = (
    event: PointerEvent,
    exclude: SnapExcludeType
  ): { x: number, y: number } => {
    const point = toSvgPoint(
      svgRef.current,
      event
    )
    const snapped = event.altKey || !unit
      ? { guides: NO_GUIDES, point }
      : snapPoint(
        point,
        snapTargets(exclude),
        SNAP_PIXELS * unit
      )

    setGuides(snapped.guides)

    return {
      x: clamp(
        snapped.guides.x === null ? Math.round(point.x) : snapped.point.x,
        roomSize.width
      ),
      y: clamp(
        snapped.guides.y === null ? Math.round(point.y) : snapped.point.y,
        roomSize.depth
      )
    }
  }

  const updateDraft = (next: RectType | null): void => {
    draftRef.current = next
    setDraft(next)
  }

  /* Moves a placement, kept whole inches and inside the room's bounding box. A piece can
     still overhang a notch in an irregular room; it is flagged rather than blocked. */
  const moveWithinRoom = (
    placement: PlacementType,
    x: number,
    y: number,
    // Given for pointer drags, which snap to walls and other pieces.
    event?: PointerEvent
  ): void => {
    const furniture = furnitureMap[placement.furnitureId]

    if (!furniture) return

    const size = placedSize(
      furniture,
      placement.rotation
    )
    const snapped = event
      ? snapMove(
        event,
        placedRects(
          furniture,
          { ...placement, x, y }
        ),
        { placementId: placement.id }
      )
      : { dx: 0, dy: 0, guides: NO_GUIDES }

    onMove(
      placement.id,
      clamp(
        snapped.guides.x === null ? Math.round(x) : x + snapped.dx,
        roomSize.width - size.width
      ),
      clamp(
        snapped.guides.y === null ? Math.round(y) : y + snapped.dy,
        roomSize.depth - size.depth
      )
    )
  }

  /* As moveWithinRoom, for a shape. */
  const moveShape = (
    shape: RoomShapeType,
    x: number,
    y: number,
    event?: PointerEvent
  ): void => {
    const snapped = event
      ? snapMove(
        event,
        [{ ...shape, x, y }],
        { shapeId: shape.id }
      )
      : { dx: 0, dy: 0, guides: NO_GUIDES }

    onShapeChange(
      shape.id,
      {
        x: clamp(
          snapped.guides.x === null ? Math.round(x) : x + snapped.dx,
          roomSize.width - shape.width
        ),
        y: clamp(
          snapped.guides.y === null ? Math.round(y) : y + snapped.dy,
          roomSize.depth - shape.depth
        )
      }
    )
  }

  const handleShapePointerDown = (
    event: PointerEvent<SVGGElement>,
    shape: RoomShapeType
  ): void => {
    event.stopPropagation()
    dragGate.begin(
      event,
      shape.id,
      shape.id === selectedShapeId
    )
    onShapeSelect(shape.id)

    const point = toSvgPoint(
      svgRef.current,
      event
    )

    dragRef.current = {
      id: shape.id,
      kind: 'shape',
      offsetX: point.x - shape.x,
      offsetY: point.y - shape.y
    }
    svgRef.current?.setPointerCapture(event.pointerId)
  }

  const handleResizeStart = (
    event: PointerEvent,
    handle: HandleType
  ): void => {
    if (!selectedShape) return

    // Handles show only on the selected shape, so a resize needs no hold first.
    dragGate.begin(
      event,
      selectedShape.id,
      true
    )
    dragRef.current = { handle, id: selectedShape.id, kind: 'resize', start: selectedShape }
    svgRef.current?.setPointerCapture(event.pointerId)
  }

  /* A press on empty floor clears the selection, and dragging from it draws a shape. */
  const handleFloorPointerDown = (event: PointerEvent<SVGSVGElement>): void => {
    onSelect('')

    const point = snappedPointer(
      event,
      {}
    )

    setGuides(NO_GUIDES)
    dragGate.begin(
      event,
      'draw',
      true
    )
    dragRef.current = { kind: 'draw', startX: point.x, startY: point.y }
    svgRef.current?.setPointerCapture(event.pointerId)
  }

  const handlePointerDown = (
    event: PointerEvent<SVGGElement>,
    placement: PlacementType
  ): void => {
    event.stopPropagation()
    dragGate.begin(
      event,
      placement.id,
      placement.id === selectedPlacementId
    )
    onSelect(placement.id)

    const point = toSvgPoint(
      svgRef.current,
      event
    )

    dragRef.current = {
      id: placement.id,
      kind: 'placement',
      offsetX: point.x - placement.x,
      offsetY: point.y - placement.y
    }
    svgRef.current?.setPointerCapture(event.pointerId)
  }

  const handleDoorPointerDown = (
    event: PointerEvent<SVGGElement>,
    door: DoorType
  ): void => {
    event.stopPropagation()
    dragGate.begin(
      event,
      door.id,
      door.id === selectedDoorId
    )
    onDoorSelect(door.id)
    dragRef.current = { id: door.id, kind: 'door' }
    svgRef.current?.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: PointerEvent<SVGSVGElement>): void => {
    const drag = dragRef.current

    if (!drag || !dragGate.allowsMove(event)) return

    if (drag.kind === 'draw') {
      const corner = snappedPointer(
        event,
        {}
      )

      updateDraft({
        depth: Math.abs(corner.y - drag.startY),
        width: Math.abs(corner.x - drag.startX),
        x: Math.min(
          corner.x,
          drag.startX
        ),
        y: Math.min(
          corner.y,
          drag.startY
        )
      })

      return
    }

    if (drag.kind === 'resize') {
      onShapeChange(
        drag.id,
        resizeRect(
          drag.start,
          drag.handle,
          snappedPointer(
            event,
            { shapeId: drag.id }
          )
        )
      )

      return
    }

    const point = toSvgPoint(
      svgRef.current,
      event
    )

    if (drag.kind === 'shape') {
      const shape = room.shapes.find(({ id }) => id === drag.id)

      if (shape) {
        moveShape(
          shape,
          point.x - drag.offsetX,
          point.y - drag.offsetY,
          event
        )
      }

      return
    }

    if (drag.kind === 'door') {
      const door = room.doors.find(({ id }) => id === drag.id)
      const spot = door && snapToWall(
        room.rects,
        point,
        door.width
      )

      if (door && spot) {
        onDoorChange(
          door.id,
          spot
        )
      }

      return
    }

    const placement = room.placements.find(({ id }) => id === drag.id)

    if (!placement) return

    moveWithinRoom(
      placement,
      point.x - drag.offsetX,
      point.y - drag.offsetY,
      event
    )
  }

  const handlePointerUp = (event: PointerEvent<SVGSVGElement>): void => {
    const drawn = draftRef.current

    // A shape needs some size in both directions; a tap draws nothing.
    if (drawn && drawn.width >= 1 && drawn.depth >= 1) onShapeCreate(drawn)

    dragRef.current = null
    dragGate.end()
    updateDraft(null)
    setGuides(NO_GUIDES)

    if (svgRef.current?.hasPointerCapture(event.pointerId)) {
      svgRef.current.releasePointerCapture(event.pointerId)
    }
  }

  const handleKeyDown = (
    event: KeyboardEvent<SVGGElement>,
    placement: PlacementType
  ): void => {
    const step = event.shiftKey ? NUDGE_LARGE : NUDGE
    const moves: Record<string, [number, number]> = {
      ArrowDown: [ 0, step ],
      ArrowLeft: [ -step, 0 ],
      ArrowRight: [ step, 0 ],
      ArrowUp: [ 0, -step ]
    }
    const move = moves[event.key]

    if (move) {
      event.preventDefault()
      moveWithinRoom(
        placement,
        placement.x + move[0],
        placement.y + move[1]
      )
    } else if (event.key === 'r' || event.key === 'R') {
      event.preventDefault()
      onRotate(placement.id)
    } else if (event.key === 'd' || event.key === 'D') {
      event.preventDefault()
      onDuplicate(placement.id)
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault()
      onRemove(placement.id)
    }
  }

  const handleShapeKeyDown = (
    event: KeyboardEvent<SVGGElement>,
    shape: RoomShapeType
  ): void => {
    const step = event.shiftKey ? NUDGE_LARGE : NUDGE
    const moves: Record<string, [number, number]> = {
      ArrowDown: [ 0, step ],
      ArrowLeft: [ -step, 0 ],
      ArrowRight: [ step, 0 ],
      ArrowUp: [ 0, -step ]
    }
    const move = moves[event.key]

    if (move) {
      event.preventDefault()
      moveShape(
        shape,
        shape.x + move[0],
        shape.y + move[1]
      )
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault()
      onShapeRemove(shape.id)
    }
  }

  const renderGrid = (): ReactElement[] => {
    // How many device pixels an inch takes, with the plan scaled to fit its box.
    const pixelsPerInch = window.devicePixelRatio * Math.min(
      svgSize.width / (view.right - view.left),
      svgSize.height / (view.bottom - view.top)
    )
    const lines: ReactElement[] = []

    // Lighter lines first, so heavier ones are drawn over them where they meet. A line is
    // drawn only at its own level, not again under a heavier one.
    for (const { className, step } of GRID_LEVELS) {
      if (step === 1 && !(pixelsPerInch >= MIN_INCH_PIXELS)) continue

      const isHeavier = (position: number): boolean => GRID_LEVELS.some(level => level.step > step && position % level.step === 0)

      for (let x = step; x < roomSize.width; x += step) {
        if (isHeavier(x)) continue

        lines.push(
          <line
            className={className}
            key={`x${x}`}
            x1={x}
            x2={x}
            y1={0}
            y2={roomSize.depth}
          />
        )
      }

      for (let y = step; y < roomSize.depth; y += step) {
        if (isHeavier(y)) continue

        lines.push(
          <line
            className={className}
            key={`y${y}`}
            x1={0}
            x2={roomSize.width}
            y1={y}
            y2={y}
          />
        )
      }
    }

    return lines
  }

  /* Every wall's length in inches, just outside it; sideways along vertical walls. */
  /* Splits a wall at its doors into the stretches between them and the doors themselves,
     in order along the wall. */
  const wallPieces = (wall: WallType): Array<WallType & { isDoor: boolean }> => {
    const isHorizontal = wall.orientation === 'horizontal'
    const openings = room.doors
      .flatMap(door => {
        const placement = doorWall(
          room.rects,
          door
        )
        const isOnWall = placement?.wall.x === wall.x && placement.wall.y === wall.y && placement.wall.orientation === wall.orientation

        return isOnWall ? [{ offset: placement.offset, width: door.width }] : []
      })
      .sort((a, b) => a.offset - b.offset)
    const pieces: Array<WallType & { isDoor: boolean }> = []
    const addPiece = (from: number, length: number, isDoor: boolean): void => {
      if (length <= 0) return

      pieces.push({
        isDoor,
        length,
        orientation: wall.orientation,
        x: isHorizontal ? wall.x + from : wall.x,
        y: isHorizontal ? wall.y : wall.y + from
      })
    }
    let position = 0

    for (const { offset, width } of openings) {
      addPiece(
        position,
        offset - position,
        false
      )
      addPiece(
        offset,
        width,
        true
      )
      position = offset + width
    }

    addPiece(
      position,
      wall.length - position,
      false
    )

    return pieces
  }

  /* Every wall's length in inches, just outside it and sideways along vertical walls. A wall
     with doors is labelled in pieces: the wall up to each door, the door, and the rest. */
  const renderWallLengths = (): ReactElement[] => wallSegments(room.rects)
    .flatMap(wallPieces)
    .map(piece => {
      const { x, y } = wallLabelPoint(
        room.rects,
        piece,
        labelSize
      )

      return (
        <text
          className={`room-plan-dimension ${piece.isDoor ? 'is-door' : ''}`}
          // Shrunk to fit along short pieces, such as the wall beside a door, but never so
          // small it cannot be read.
          fontSize={Math.max(
            labelSize * 0.65,
            Math.min(
              labelSize,
              piece.length / 2.5
            )
          )}
          key={`${piece.orientation}-${piece.x}-${piece.y}`}
          transform={piece.orientation === 'vertical' ? `rotate(-90 ${x} ${y})` : undefined}
          x={x}
          y={y}
        >
          { `${piece.length}″` }
        </text>
      )
    })

  /* A gap in the wall, and for a swing door the open leaf and the arc its edge sweeps
     through, or for an entryway the frame at each end. */
  const renderDoor = (door: DoorType): ReactElement => {
    const { bounds, end, hinge, jambs, latch, start, sweep, tip } = doorGeometry(
      room.rects,
      door
    )

    return (
      <g
        aria-label={door.kind === 'opening'
          ? `Entryway, ${door.width} inches wide`
          : `Door, ${door.width} inches wide, swinging ${door.swing === 'in' ? 'into' : 'out of'} the room`}
        className={`room-plan-door ${door.id === selectedDoorId ? 'is-selected' : ''} ${door.id === dragGate.liftedKey ? 'is-lifted' : ''}`}
        key={door.id}
        onKeyDown={event => {
          if (event.key !== 'Delete' && event.key !== 'Backspace') return

          event.preventDefault()
          onDoorRemove(door.id)
        }}
        onPointerDown={event => {
          handleDoorPointerDown(
            event,
            door
          )
        }}
        role='button'
        tabIndex={0}
      >
        <rect
          className='room-plan-door-hit'
          height={bounds.depth}
          width={bounds.width}
          x={bounds.x}
          y={bounds.y}
        />
        <line
          className='room-plan-door-gap'
          x1={start.x}
          x2={end.x}
          y1={start.y}
          y2={end.y}
        />
        <path
          className='room-plan-door-swing'
          d={door.kind === 'opening'
            ? jambs
            : `M${hinge.x} ${hinge.y}L${tip.x} ${tip.y}A${door.width} ${door.width} 0 0 ${sweep} ${latch.x} ${latch.y}`}
        />
      </g>
    )
  }

  /* Round buttons by a selection's top right corner, above it or below it when there is no
     room above, kept the same size on screen however large the plan is. */
  const renderActions = (
    box: RectType,
    actions: ActionType[]
  ): ReactElement | null => {
    if (!unit) return null

    const radius = 12 * unit
    const gap = 6 * unit
    const above = box.y - gap - radius
    const cy = above - radius < view.top ? box.y + box.depth + gap + radius : above
    const arm = radius * 0.4
    const right = box.x + box.width - radius
    const step = radius * 2 + gap

    return (
      <g className='room-plan-handles'>
        { actions.map(({ className, icon, label, onActivate }, index) => {
          const cx = right - step * (actions.length - 1 - index)

          return (
            <g
              aria-label={label}
              className={`room-plan-handle ${className}`}
              key={className}
              onClick={onActivate}
              onKeyDown={event => {
                if (event.key !== 'Enter' && event.key !== ' ') return

                event.preventDefault()
                onActivate()
              }}
              // Keeps the press from reaching the plan, which would clear the selection.
              onPointerDown={event => { event.stopPropagation() }}
              role='button'
              tabIndex={0}
            >
              <title>{ label }</title>
              <circle
                cx={cx}
                cy={cy}
                r={radius}
              />
              <path
                d={icon(
                  cx,
                  cy,
                  arm
                )}
              />
            </g>
          )
        }) }
      </g>
    )
  }

  const removeIcon = (cx: number, cy: number, arm: number): string => `M${cx - arm} ${cy - arm}L${cx + arm} ${cy + arm}M${cx + arm} ${cy - arm}L${cx - arm} ${cy + arm}`

  /* Duplicate, rotate and remove buttons for the selected piece. */
  const renderPlacementHandles = (placement: PlacementType): ReactElement | null => {
    const furniture = furnitureMap[placement.furnitureId]

    if (!furniture) return null

    return renderActions(
      {
        ...placedSize(
          furniture,
          placement.rotation
        ),
        x: placement.x,
        y: placement.y
      },
      [
        {
          className: 'is-duplicate',
          // Two overlapping squares.
          icon: (cx, cy, arm) => `M${cx - arm * 0.4} ${cy - arm * 1.1}h${arm * 1.5}v${arm * 1.5}M${cx - arm * 1.1} ${cy - arm * 0.4}h${arm * 1.5}v${arm * 1.5}h${-arm * 1.5}Z`,
          label: `Duplicate ${furniture.name}`,
          onActivate: () => { onDuplicate(placement.id) }
        },
        {
          className: 'is-rotate',
          // A three quarter circle clockwise from the top, with an arrowhead at its end.
          icon: (cx, cy, arm) => `M${cx} ${cy - arm}A${arm} ${arm} 0 1 1 ${cx - arm} ${cy}M${cx - arm * 1.5} ${cy - arm * 0.5}L${cx - arm} ${cy}L${cx - arm * 0.5} ${cy - arm * 0.5}`,
          label: `Rotate ${furniture.name}`,
          onActivate: () => { onRotate(placement.id) }
        },
        {
          className: 'is-remove',
          icon: removeIcon,
          label: `Remove ${furniture.name} from the room`,
          onActivate: () => { onRemove(placement.id) }
        }
      ]
    )
  }

  /* A drawn shape, labelled with its size. */
  const renderShape = (shape: RoomShapeType): ReactElement => {
    const label = `${Math.round(shape.width * 10) / 10}″ × ${Math.round(shape.depth * 10) / 10}″`
    const fontSize = Math.min(
      labelSize,
      shape.depth / 2.5,
      shape.width / Math.max(
        label.length * 0.6,
        1
      )
    )

    return (
      <g
        aria-label={`Shape, ${shape.width} by ${shape.depth} inches, at ${shape.x}, ${shape.y}`}
        className={`room-plan-shape ${shape.id === selectedShapeId ? 'is-selected' : ''} ${shape.id === dragGate.liftedKey ? 'is-lifted' : ''}`}
        key={shape.id}
        onKeyDown={event => {
          handleShapeKeyDown(
            event,
            shape
          )
        }}
        onPointerDown={event => {
          handleShapePointerDown(
            event,
            shape
          )
        }}
        role='button'
        tabIndex={0}
      >
        <rect
          height={shape.depth}
          width={shape.width}
          x={shape.x}
          y={shape.y}
        />
        <text
          fontSize={fontSize}
          x={shape.x + shape.width / 2}
          y={shape.y + shape.depth / 2}
        >
          { label }
        </text>
      </g>
    )
  }

  /* Handles, side lengths and a remove button for the selected shape. */
  const renderShapeSelection = (shape: RoomShapeType): ReactElement | null => {
    if (!unit) return null

    return (
      <>
        <SelectionOverlay
          bounds={{ left: view.left, top: view.top }}
          onHandlePointerDown={handleResizeStart}
          rect={shape}
          unit={unit}
          widthEdge='bottom'
        />
        { renderActions(
          shape,
          [
            {
              className: 'is-remove',
              icon: removeIcon,
              label: 'Remove shape',
              onActivate: () => { onShapeRemove(shape.id) }
            }
          ]
        ) }
      </>
    )
  }

  const renderPlacement = (placement: PlacementType): ReactElement | null => {
    const furniture = furnitureMap[placement.furnitureId]

    if (!furniture) return null

    const rects = placedRects(
      furniture,
      placement
    )
    const size = placedSize(
      furniture,
      placement.rotation
    )
    const isSelected = placement.id === selectedPlacementId
    const isOutside = !isWithin(
      room.rects,
      rects
    )
    // The name sits in the largest rectangle, so it stays on the piece whatever its shape,
    // and shrinks to fit inside it.
    const labelRect = rects.reduce((largest, rect) => rect.width * rect.depth > largest.width * largest.depth ? rect : largest)
    const fontSize = Math.min(
      labelSize,
      labelRect.depth / 2.5,
      labelRect.width / Math.max(
        furniture.name.length * 0.6,
        1
      )
    )

    return (
      <g
        aria-label={`${furniture.name}, ${size.width} by ${size.depth} inches, at ${placement.x}, ${placement.y}${isOutside ? ', partly outside the room' : ''}`}
        className={`room-plan-piece ${isSelected ? 'is-selected' : ''} ${isOutside ? 'is-outside' : ''} ${placement.id === dragGate.liftedKey ? 'is-lifted' : ''}`}
        key={placement.id}
        onKeyDown={event => {
          handleKeyDown(
            event,
            placement
          )
        }}
        onPointerDown={event => {
          handlePointerDown(
            event,
            placement
          )
        }}
        role='button'
        tabIndex={0}
      >
        { rects.map((rect, index) =>
          <rect
            className='room-plan-piece-fill'
            fill={furniture.color}
            height={rect.depth}
            key={index}
            width={rect.width}
            x={rect.x}
            y={rect.y}
          />) }
        <path
          className='room-plan-piece-outline'
          d={outlinePath(rects)}
        />
        <text
          fontSize={fontSize}
          x={labelRect.x + labelRect.width / 2}
          y={labelRect.y + labelRect.depth / 2}
        >
          { furniture.name }
        </text>
      </g>
    )
  }

  return (
    <RoomPlanStyled>
      <svg
        className='room-plan'
        onPointerCancel={handlePointerUp}
        onPointerDown={handleFloorPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        ref={svgRef}
        viewBox={`${view.left} ${view.top} ${view.right - view.left} ${view.bottom - view.top}`}
      >
        <defs>
          <clipPath id={floorClipId}>
            { room.rects.map((rect, index) =>
              <rect
                height={rect.depth}
                key={index}
                width={rect.width}
                x={rect.x}
                y={rect.y}
              />) }
          </clipPath>
        </defs>
        <g clipPath={`url(#${floorClipId})`}>
          <rect
            className='room-plan-floor'
            height={roomSize.depth}
            width={roomSize.width}
            x={0}
            y={0}
          />
          { renderGrid() }
        </g>
        { room.shapes.map(renderShape) }
        <path
          className='room-plan-wall'
          d={outlinePath(room.rects)}
        />
        { renderWallLengths() }
        { room.doors.map(renderDoor) }
        { room.placements.map(renderPlacement) }
        { selectedPlacement && renderPlacementHandles(selectedPlacement) }
        { selectedShape && renderShapeSelection(selectedShape) }
        {
          draft &&
            <>
              <rect
                className='room-plan-draft'
                height={draft.depth}
                width={draft.width}
                x={draft.x}
                y={draft.y}
              />
              {
                unit > 0 &&
                  <SelectionOverlay
                    bounds={{ left: view.left, top: view.top }}
                    rect={draft}
                    unit={unit}
                    widthEdge='bottom'
                  />
              }
            </>
        }
        {
          guides.x !== null &&
            <line
              className='snap-guide'
              x1={guides.x}
              x2={guides.x}
              y1={0}
              y2={roomSize.depth}
            />
        }
        {
          guides.y !== null &&
            <line
              className='snap-guide'
              x1={0}
              x2={roomSize.width}
              y1={guides.y}
              y2={guides.y}
            />
        }
      </svg>
    </RoomPlanStyled>
  )
}
