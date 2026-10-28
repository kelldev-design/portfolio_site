import {
  type FunctionComponent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactElement,
  useRef
} from 'react'
import styled from 'styled-components'
import { clamp } from './roomPlannerStorage'
import { RoomPlanStyles } from './RoomPlanStyles'
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
  type DoorType,
  type FurnitureType,
  type PlacementType,
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

/* A piece of furniture follows the pointer; a door slides to the wall nearest it. */
type DragType =
  | { kind: 'placement', id: string, offsetX: number, offsetY: number }
  | { kind: 'door', id: string }

interface RoomPlanPropsType {
  furnitureMap: Record<string, FurnitureType>
  onDoorChange: (doorId: string, changes: Partial<DoorType>) => void
  onDoorRemove: (doorId: string) => void
  onDoorSelect: (doorId: string) => void
  onDuplicate: (placementId: string) => void
  onMove: (placementId: string, x: number, y: number) => void
  onRemove: (placementId: string) => void
  onRotate: (placementId: string) => void
  /** Selects a piece, or with '' clears any selection, piece or door. */
  onSelect: (placementId: string) => void
  room: RoomType
  selectedDoorId: string
  selectedPlacementId: string
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
  room,
  selectedDoorId,
  selectedPlacementId
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const svgSize = useElementSize(svgRef)
  const dragRef = useRef<DragType | null>(null)
  // A first tap only selects; see useDragGate.
  const dragGate = useDragGate()
  const roomSize = shapeSize(room.rects)
  const floorClipId = `room-floor-${room.id}`
  const selectedPlacement = room.placements.find(({ id }) => id === selectedPlacementId)

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

  /* Moves a placement, kept whole inches and inside the room's bounding box. A piece can
     still overhang a notch in an irregular room; it is flagged rather than blocked. */
  const moveWithinRoom = (
    placement: PlacementType,
    x: number,
    y: number
  ): void => {
    const furniture = furnitureMap[placement.furnitureId]

    if (!furniture) return

    const size = placedSize(
      furniture,
      placement.rotation
    )

    onMove(
      placement.id,
      clamp(
        Math.round(x),
        roomSize.width - size.width
      ),
      clamp(
        Math.round(y),
        roomSize.depth - size.depth
      )
    )
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

    const point = toSvgPoint(
      svgRef.current,
      event
    )

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
      point.y - drag.offsetY
    )
  }

  const handlePointerUp = (event: PointerEvent<SVGSVGElement>): void => {
    dragRef.current = null
    dragGate.end()

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

  /* Duplicate, rotate and remove buttons by the selected piece's top right corner, above it or below it
     when there is no room above, kept the same size on screen however large the plan is. */
  const renderPlacementHandles = (placement: PlacementType): ReactElement | null => {
    const furniture = furnitureMap[placement.furnitureId]

    if (!furniture || !svgSize.width || !svgSize.height) return null

    const size = placedSize(
      furniture,
      placement.rotation
    )
    const inchesPerPixel = Math.max(
      (view.right - view.left) / svgSize.width,
      (view.bottom - view.top) / svgSize.height
    )
    const radius = 12 * inchesPerPixel
    const gap = 6 * inchesPerPixel
    const above = placement.y - gap - radius
    const cy = above - radius < view.top ? placement.y + size.depth + gap + radius : above
    const arm = radius * 0.4
    const right = placement.x + size.width - radius
    const step = radius * 2 + gap
    const handles = [
      {
        className: 'is-duplicate',
        cx: right - step * 2,
        // Two overlapping squares.
        icon: (cx: number): string => `M${cx - arm * 0.4} ${cy - arm * 1.1}h${arm * 1.5}v${arm * 1.5}M${cx - arm * 1.1} ${cy - arm * 0.4}h${arm * 1.5}v${arm * 1.5}h${-arm * 1.5}Z`,
        label: `Duplicate ${furniture.name}`,
        onActivate: () => { onDuplicate(placement.id) }
      },
      {
        className: 'is-rotate',
        cx: right - step,
        // A three quarter circle clockwise from the top, with an arrowhead at its end.
        icon: (cx: number): string => `M${cx} ${cy - arm}A${arm} ${arm} 0 1 1 ${cx - arm} ${cy}M${cx - arm * 1.5} ${cy - arm * 0.5}L${cx - arm} ${cy}L${cx - arm * 0.5} ${cy - arm * 0.5}`,
        label: `Rotate ${furniture.name}`,
        onActivate: () => { onRotate(placement.id) }
      },
      {
        className: 'is-remove',
        cx: right,
        icon: (cx: number): string => `M${cx - arm} ${cy - arm}L${cx + arm} ${cy + arm}M${cx + arm} ${cy - arm}L${cx - arm} ${cy + arm}`,
        label: `Remove ${furniture.name} from the room`,
        onActivate: () => { onRemove(placement.id) }
      }
    ]

    return (
      <g className='room-plan-handles'>
        { handles.map(({ className, cx, icon, label, onActivate }) =>
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
            <path d={icon(cx)} />
          </g>) }
      </g>
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
        onPointerDown={() => { onSelect('') }}
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
        <path
          className='room-plan-wall'
          d={outlinePath(room.rects)}
        />
        { renderWallLengths() }
        { room.doors.map(renderDoor) }
        { room.placements.map(renderPlacement) }
        { selectedPlacement && renderPlacementHandles(selectedPlacement) }
      </svg>
    </RoomPlanStyled>
  )
}
