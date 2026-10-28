import {
  type FormEvent,
  type FunctionComponent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactElement,
  useRef,
  useState
} from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'
import { InchesInput } from './InchesInput'
import {
  type HandleType,
  resizeRect
} from './resizing'
import {
  clamp,
  formatInches
} from './roomPlannerStorage'
import { SelectionOverlay } from './SelectionOverlay'
import {
  ShapeEditorDetailsStyles,
  ShapeEditorStyles
} from './ShapeEditorStyles'
import {
  normalizeRects,
  outlinePath,
  shapeSize,
  type SizeType,
  toSvgPoint
} from './shapeGeometry'
import {
  NO_GUIDES,
  rectEdges,
  SNAP_PIXELS,
  type SnapGuidesType,
  snapPoint,
  snapRects
} from './snapping'
import { type RectType } from '../../../types/roomPlannerTypes'
import { InputCustom } from '../../common/input-custom/InputCustom'
import { SelectCustom } from '../../common/select-custom/SelectCustom'
import { useDragGate } from '../../hooks/useDragGate'
import { useElementSize } from '../../hooks/useElementSize'

const ShapeEditorStyled = styled.div`${ShapeEditorStyles}`
const ShapeEditorDetailsStyled = styled.div`${ShapeEditorDetailsStyles}`

const SNAP_OPTIONS = [ 1, 3, 6, 12 ].map(inches => ({ label: `${inches}″`, value: String(inches) }))

/* Room past the shape's far edges to draw into, at least this much and otherwise half the
   shape's larger side, so there is always empty grid to start a new rectangle on. */
const CANVAS_MARGIN = 24

const roundUpToFoot = (inches: number): number => Math.ceil(inches / 12) * 12

/* Widens or deepens the canvas to exactly the shape of the space it is drawn in, so the
   grid reaches every edge of that space. The stretched side is not rounded, or the canvas
   would no longer match the space and leave a gap. */
const fitCanvas = (
  minimum: SizeType,
  box: { width: number, height: number }
): SizeType => {
  const depth = roundUpToFoot(minimum.depth)
  const width = roundUpToFoot(minimum.width)

  if (!box.width || !box.height) return { depth, width }

  const aspect = box.width / box.height

  return width / depth < aspect
    ? { depth, width: depth * aspect }
    : { depth: width / aspect, width }
}

const snapTo = (
  value: number,
  snap: number
): number => Math.round(value / snap) * snap

/* clickedIndex is the rectangle a draw started on, selected if the pointer never moves. */
type DragType =
  | { mode: 'draw', startX: number, startY: number, canvas: SizeType, clickedIndex: number }
  | { mode: 'move', index: number, offsetX: number, offsetY: number, canvas: SizeType }
  | { mode: 'resize', index: number, handle: HandleType, start: RectType, canvas: SizeType }

interface ShapeEditorPropsType {
  color: string
  /** The canvas size, in inches, before anything is drawn. */
  defaultCanvas: number
  /** The size of a rectangle added with the button, before it is resized. */
  defaultRectSize: number
  /** Where to show the selected rectangle's fields, such as a sidebar; below the canvas when absent. */
  detailsTarget?: HTMLElement | null
  defaultSnap: number
  idPrefix: string
  initialName: string
  initialRects: RectType[]
  namePlaceholder: string
  onCancel: () => void
  /** Shown when editing an existing shape. */
  onDelete?: () => void
  onSave: (name: string, rects: RectType[]) => void
  submitLabel: string
}

/* Builds a shape from rectangles, drawn by dragging on the grid or typed in. Rectangles
   that overlap or touch merge into one outline. */
export const ShapeEditor: FunctionComponent<ShapeEditorPropsType> = ({
  color,
  defaultCanvas,
  defaultRectSize,
  defaultSnap,
  detailsTarget,
  idPrefix,
  initialName,
  initialRects,
  namePlaceholder,
  onCancel,
  onDelete,
  onSave,
  submitLabel
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const svgSize = useElementSize(svgRef)
  const [ name, setName ] = useState(initialName)
  const [ rects, setRects ] = useState(initialRects)
  const [ selectedIndex, setSelectedIndex ] = useState(initialRects.length ? 0 : -1)
  const [ snap, setSnap ] = useState(defaultSnap)
  // Pointer handlers read the drag and draft from refs: several pointer events can arrive
  // before React renders, and state read in them would still be the last render's.
  const dragRef = useRef<DragType | null>(null)
  // A first tap on a rectangle only selects it; see useDragGate.
  const dragGate = useDragGate()
  const draftRef = useRef<RectType | null>(null)
  const [ draft, setDraft ] = useState<RectType | null>(null)
  const [ dragCanvas, setDragCanvas ] = useState<SizeType | null>(null)
  const [ error, setError ] = useState('')
  // The edges a drag has snapped to, shown as guide lines while it lasts.
  const [ guides, setGuides ] = useState<SnapGuidesType>(NO_GUIDES)

  const size = shapeSize(rects)
  const selectedRect = rects[selectedIndex] as RectType | undefined
  // The shape's own size, not counting empty grid above or left of it, which saving drops.
  const overall = rects.length ? shapeSize(normalizeRects(rects)) : size

  // Held still while dragging, so the canvas does not grow under the pointer.
  const margin = Math.max(
    CANVAS_MARGIN,
    Math.max(
      size.width,
      size.depth
    ) / 2
  )
  const canvas: SizeType = dragCanvas ?? fitCanvas(
    rects.length
      ? { depth: size.depth + margin, width: size.width + margin }
      : { depth: defaultCanvas, width: defaultCanvas },
    svgSize
  )

  // Inches per screen pixel, to keep handles and snapping one size on screen at any zoom.
  const unit = svgSize.width && svgSize.height
    ? Math.max(
      canvas.width / svgSize.width,
      canvas.depth / svgSize.height
    )
    : 1
  // The view starts this far above and left of the canvas, so the handles of a rectangle in
  // its top left corner show whole. The view stays the canvas's size, so the grid still
  // reaches every edge of it.
  const pad = 6 * unit

  /* Edges of every rectangle but the one being changed, and the canvas's own. */
  const snapTargets = (excludeIndex: number): { xs: number[], ys: number[] } => {
    const edges = rectEdges(rects.filter((_rect, index) => index !== excludeIndex))

    return { xs: [ 0, ...edges.xs ], ys: [ 0, ...edges.ys ] }
  }

  /* The pointer on the canvas, on another rectangle's edge when it is near one, or else on
     the snap grid. Alt held skips the edges. */
  const snappedPoint = (
    event: PointerEvent,
    excludeIndex = -1
  ): { x: number, y: number } => {
    const point = toSvgPoint(
      svgRef.current,
      event
    )
    const edge = event.altKey
      ? { guides: NO_GUIDES, point }
      : snapPoint(
        point,
        snapTargets(excludeIndex),
        SNAP_PIXELS * unit
      )

    setGuides(edge.guides)

    return {
      x: clamp(
        edge.guides.x ?? snapTo(
          point.x,
          snap
        ),
        canvas.width
      ),
      y: clamp(
        edge.guides.y ?? snapTo(
          point.y,
          snap
        ),
        canvas.depth
      )
    }
  }

  const updateRect = (
    index: number,
    changes: Partial<RectType>
  ): void => {
    setRects(current => current.map((rect, rectIndex) => rectIndex === index ? { ...rect, ...changes } : rect))
  }

  const updateDraft = (next: RectType | null): void => {
    draftRef.current = next
    setDraft(next)
  }

  const startDrag = (
    event: PointerEvent,
    drag: DragType
  ): void => {
    dragRef.current = drag
    setDragCanvas(drag.canvas)
    svgRef.current?.setPointerCapture(event.pointerId)
  }

  const startDraw = (
    event: PointerEvent,
    clickedIndex: number
  ): void => {
    const point = snappedPoint(event)

    setSelectedIndex(-1)
    updateDraft({ depth: 0, width: 0, x: point.x, y: point.y })
    startDrag(
      event,
      { canvas, clickedIndex, mode: 'draw', startX: point.x, startY: point.y }
    )
  }

  /* Pressing a rectangle selects it, and dragging moves it. With shift held it draws a new
     rectangle over it instead, so new rectangles can start inside old ones. */
  const handleRectPointerDown = (
    event: PointerEvent<SVGRectElement>,
    index: number
  ): void => {
    event.stopPropagation()

    if (event.shiftKey) {
      startDraw(
        event,
        index
      )

      return
    }

    const point = toSvgPoint(
      svgRef.current,
      event
    )

    dragGate.begin(
      event,
      String(index),
      index === selectedIndex
    )
    setSelectedIndex(index)
    startDrag(
      event,
      {
        canvas,
        index,
        mode: 'move',
        offsetX: point.x - rects[index].x,
        offsetY: point.y - rects[index].y
      }
    )
  }

  const handleResizeStart = (
    event: PointerEvent,
    handle: HandleType
  ): void => {
    if (!selectedRect) return

    startDrag(
      event,
      { canvas, handle, index: selectedIndex, mode: 'resize', start: selectedRect }
    )
  }

  const handlePointerMove = (event: PointerEvent<SVGSVGElement>): void => {
    const drag = dragRef.current

    if (!drag) return

    if (drag.mode === 'resize') {
      updateRect(
        drag.index,
        resizeRect(
          drag.start,
          drag.handle,
          snappedPoint(
            event,
            drag.index
          )
        )
      )

      return
    }

    if (drag.mode === 'draw') {
      const point = snappedPoint(event)

      updateDraft({
        depth: Math.abs(point.y - drag.startY),
        width: Math.abs(point.x - drag.startX),
        x: Math.min(
          point.x,
          drag.startX
        ),
        y: Math.min(
          point.y,
          drag.startY
        )
      })

      return
    }

    if (!dragGate.allowsMove(event)) return

    const point = toSvgPoint(
      svgRef.current,
      event
    )
    const rect = rects[drag.index]
    const x = point.x - drag.offsetX
    const y = point.y - drag.offsetY
    // An edge near another rectangle's meets it exactly; otherwise the move keeps to the grid.
    const edge = event.altKey
      ? { dx: 0, dy: 0, guides: NO_GUIDES }
      : snapRects(
        [{ ...rect, x, y }],
        snapTargets(drag.index),
        SNAP_PIXELS * unit
      )

    setGuides(edge.guides)
    updateRect(
      drag.index,
      {
        x: clamp(
          edge.guides.x === null
            ? snapTo(
              x,
              snap
            )
            : x + edge.dx,
          drag.canvas.width - rect.width
        ),
        y: clamp(
          edge.guides.y === null
            ? snapTo(
              y,
              snap
            )
            : y + edge.dy,
          drag.canvas.depth - rect.depth
        )
      }
    )
  }

  const handlePointerUp = (event: PointerEvent<SVGSVGElement>): void => {
    const drag = dragRef.current
    const drawn = draftRef.current

    if (drawn && drawn.width > 0 && drawn.depth > 0) {
      setRects([ ...rects, drawn ])
      setSelectedIndex(rects.length)
    } else if (drag?.mode === 'draw') {
      setSelectedIndex(drag.clickedIndex)
    }

    dragRef.current = null
    dragGate.end()
    setGuides(NO_GUIDES)
    updateDraft(null)
    setDragCanvas(null)

    if (svgRef.current?.hasPointerCapture(event.pointerId)) {
      svgRef.current.releasePointerCapture(event.pointerId)
    }
  }

  /* Adds a rectangle beside the shape, ready to have its size typed in. */
  const handleAddRect = (): void => {
    setRects([ ...rects, { depth: defaultRectSize, width: defaultRectSize, x: size.width, y: 0 }])
    setSelectedIndex(rects.length)
  }

  const handleRemoveRect = (): void => {
    setRects(rects.filter((_rect, index) => index !== selectedIndex))
    setSelectedIndex(-1)
  }

  /* With the canvas focused: Delete removes the selected rectangle, arrows nudge it by the
     snap size, and Escape clears the selection. */
  const handleKeyDown = (event: KeyboardEvent<SVGSVGElement>): void => {
    if (!selectedRect) return

    const moves: Record<string, [number, number]> = {
      ArrowDown: [ 0, snap ],
      ArrowLeft: [ -snap, 0 ],
      ArrowRight: [ snap, 0 ],
      ArrowUp: [ 0, -snap ]
    }
    const move = moves[event.key]

    if (move) {
      event.preventDefault()
      updateRect(
        selectedIndex,
        {
          x: Math.max(
            0,
            selectedRect.x + move[0]
          ),
          y: Math.max(
            0,
            selectedRect.y + move[1]
          )
        }
      )
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault()
      handleRemoveRect()
    } else if (event.key === 'Escape') {
      setSelectedIndex(-1)
    }
  }

  /* An × in the selected rectangle's corner that removes it, kept the same size on screen
     however far the canvas is zoomed. */
  const renderDeleteHandle = (rect: RectType): ReactElement => {
    const radius = 9 * unit
    const arm = radius * 0.4
    // Set in from the corner, clear of the corner's resize handle.
    const cx = rect.x + rect.width - radius * 2.2
    const cy = rect.y + radius * 2.2

    return (
      <g
        aria-label='Remove rectangle'
        className='shape-editor-delete-handle'
        onPointerDown={event => {
          event.stopPropagation()
          handleRemoveRect()
        }}
        role='button'
      >
        <circle
          cx={cx}
          cy={cy}
          r={radius}
        />
        <path d={`M${cx - arm} ${cy - arm}L${cx + arm} ${cy + arm}M${cx + arm} ${cy - arm}L${cx - arm} ${cy + arm}`} />
      </g>
    )
  }

  const handleSubmit = (event: FormEvent): void => {
    event.preventDefault()

    if (!name.trim()) {
      setError('Enter a name.')

      return
    }

    if (!rects.length) {
      setError('Draw or add at least one rectangle.')

      return
    }

    onSave(
      name.trim(),
      normalizeRects(rects)
    )
  }

  const renderGrid = (): ReactElement[] => {
    const lines: ReactElement[] = []

    // Every six inches, darker on each foot.
    for (let x = 6; x < canvas.width; x += 6) {
      lines.push(
        <line
          className={x % 12 ? 'shape-editor-grid-minor' : 'shape-editor-grid'}
          key={`x${x}`}
          x1={x}
          x2={x}
          y1={-pad}
          y2={canvas.depth}
        />
      )
    }

    for (let y = 6; y < canvas.depth; y += 6) {
      lines.push(
        <line
          className={y % 12 ? 'shape-editor-grid-minor' : 'shape-editor-grid'}
          key={`y${y}`}
          x1={-pad}
          x2={canvas.width}
          y1={y}
          y2={y}
        />
      )
    }

    return lines
  }

  const renderRect = (
    rect: RectType,
    index: number
  ): ReactElement =>
    <rect
      className={`shape-editor-rect ${index === selectedIndex ? 'is-selected' : ''} ${String(index) === dragGate.liftedKey ? 'is-lifted' : ''}`}
      fill={color}
      height={rect.depth}
      key={index}
      onPointerDown={event => {
        handleRectPointerDown(
          event,
          index
        )
      }}
      width={rect.width}
      x={rect.x}
      y={rect.y}
    />

  const renderSelectedRect = (): ReactElement => {
    if (!selectedRect) {
      return (
        <p className='room-planner-hint'>
          Drag on empty grid to draw a rectangle, or add one and type its size. Rectangles that
          overlap or touch merge into one shape. Tap a rectangle to select it, then drag it to move
          it, or press and hold to pick it up and drag straight away. Drag its handles to resize it,
          and press × or Delete to remove it. Edges snap to other rectangles; hold alt to stop
          them. Hold shift to draw starting inside a rectangle.
        </p>
      )
    }

    return (
      <div className='shape-editor-selected'>
        <div className='room-planner-subheading'>
          { `Rectangle ${selectedIndex + 1} of ${rects.length}` }
        </div>
        <div className='shape-editor-fields'>
          <InchesInput
            id={`${idPrefix}-rect-x`}
            label='From left'
            onChange={x => {
              updateRect(
                selectedIndex,
                { x }
              )
            }}
            value={selectedRect.x}
          />
          <InchesInput
            id={`${idPrefix}-rect-y`}
            label='From top'
            onChange={y => {
              updateRect(
                selectedIndex,
                { y }
              )
            }}
            value={selectedRect.y}
          />
          <InchesInput
            id={`${idPrefix}-rect-width`}
            isPositive
            label='Width'
            onChange={width => {
              updateRect(
                selectedIndex,
                { width }
              )
            }}
            value={selectedRect.width}
          />
          <InchesInput
            id={`${idPrefix}-rect-depth`}
            isPositive
            label='Depth'
            onChange={depth => {
              updateRect(
                selectedIndex,
                { depth }
              )
            }}
            value={selectedRect.depth}
          />
        </div>
        <div>
          <button
            className='room-planner-row-action'
            onClick={handleRemoveRect}
            type='button'
          >
            Remove rectangle
          </button>
        </div>
      </div>
    )
  }

  return (
    <ShapeEditorStyled>
      <form
        className='room-planner-form'
        noValidate
        onSubmit={handleSubmit}
      >
        <div className='shape-editor-toolbar'>
          <div className='shape-editor-name'>
            <InputCustom
              id={`${idPrefix}-name`}
              label='Name'
              onChange={event => { setName(event.target.value) }}
              placeholder={namePlaceholder}
              value={name}
            />
          </div>
          <SelectCustom
            id={`${idPrefix}-snap`}
            label='Snap to'
            onChange={event => { setSnap(Number(event.target.value)) }}
            options={SNAP_OPTIONS}
            value={String(snap)}
          />
          <button
            className='shape-editor-add'
            onClick={handleAddRect}
            type='button'
          >
            + Add rectangle
          </button>
        </div>
        <p className='room-planner-hint'>
          { rects.length
            ? `Overall ${formatInches(overall.width)} wide by ${formatInches(overall.depth)} deep. Grid lines are six inches apart.`
            : 'Grid lines are six inches apart.' }
        </p>
        <svg
          aria-label='Shape canvas'
          className='shape-editor-canvas'
          onKeyDown={handleKeyDown}
          onPointerCancel={handlePointerUp}
          onPointerDown={event => {
            startDraw(
              event,
              -1
            )
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          ref={svgRef}
          tabIndex={0}
          viewBox={`${-pad} ${-pad} ${canvas.width} ${canvas.depth}`}
        >
          <rect
            className='shape-editor-background'
            height={canvas.depth}
            width={canvas.width}
            x={-pad}
            y={-pad}
          />
          { renderGrid() }
          { rects.map(renderRect) }
          <path
            className='shape-editor-outline'
            d={outlinePath(rects)}
          />
          {
            selectedRect &&
              <rect
                className='shape-editor-selection'
                height={selectedRect.depth}
                width={selectedRect.width}
                x={selectedRect.x}
                y={selectedRect.y}
              />
          }
          {
            selectedRect && !draft &&
              <SelectionOverlay
                bounds={{ left: 0, top: 0 }}
                onHandlePointerDown={handleResizeStart}
                rect={selectedRect}
                unit={unit}
              />
          }
          { selectedRect && !draft && renderDeleteHandle(selectedRect) }
          {
            draft &&
              <>
                <rect
                  className='shape-editor-selection'
                  height={draft.depth}
                  width={draft.width}
                  x={draft.x}
                  y={draft.y}
                />
                <SelectionOverlay
                  bounds={{ left: 0, top: 0 }}
                  rect={draft}
                  unit={unit}
                />
              </>
          }
          {
            guides.x !== null &&
              <line
                className='snap-guide'
                x1={guides.x}
                x2={guides.x}
                y1={-pad}
                y2={canvas.depth}
              />
          }
          {
            guides.y !== null &&
              <line
                className='snap-guide'
                x1={-pad}
                x2={canvas.width}
                y1={guides.y}
                y2={guides.y}
              />
          }
        </svg>
        {
          detailsTarget
            ? createPortal(
              <ShapeEditorDetailsStyled>{ renderSelectedRect() }</ShapeEditorDetailsStyled>,
              detailsTarget
            )
            : <ShapeEditorDetailsStyled>{ renderSelectedRect() }</ShapeEditorDetailsStyled>
        }
        { error && <div className='shape-editor-error'>{ error }</div> }
        <div className='room-planner-selection-actions'>
          <button
            className='room-planner-submit'
            type='submit'
          >
            { submitLabel }
          </button>
          <button
            className='room-planner-row-action'
            onClick={onCancel}
            type='button'
          >
            Cancel
          </button>
          {
            onDelete &&
              <button
                className='room-planner-row-action shape-editor-delete'
                onClick={onDelete}
                type='button'
              >
                Delete
              </button>
          }
        </div>
      </form>
    </ShapeEditorStyled>
  )
}
