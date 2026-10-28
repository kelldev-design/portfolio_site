import {
  type FunctionComponent,
  type PointerEvent,
  type ReactElement
} from 'react'
import { type HandleType } from './resizing'
import { type RectType } from '../../../types/roomPlannerTypes'

const HANDLES: HandleType[] = [ 'nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w' ]

/* Sizes on screen, in pixels, whatever the zoom. */
const HANDLE_PIXELS = 10
const LABEL_PIXELS = 12
const LABEL_GAP_PIXELS = 18

const handlePoint = (
  rect: RectType,
  handle: HandleType
): { x: number, y: number } => ({
  x: handle.includes('w') ? rect.x : handle.includes('e') ? rect.x + rect.width : rect.x + rect.width / 2,
  y: handle.startsWith('n') ? rect.y : handle.startsWith('s') ? rect.y + rect.depth : rect.y + rect.depth / 2
})

const formatLength = (inches: number): string => `${Math.round(inches * 10) / 10}″`

interface SelectionOverlayPropsType {
  /** The visible area, so a label that would fall outside it goes inside the rectangle. */
  bounds: { left: number, top: number }
  /** Starts a resize from a handle. Absent while a rectangle is being drawn, which has no handles. */
  onHandlePointerDown?: (event: PointerEvent<SVGRectElement>, handle: HandleType) => void
  rect: RectType
  /** Inches per screen pixel, to keep handles and labels one size however large the drawing. */
  unit: number
  /** Which side the width is shown along: the top, or the bottom when buttons sit above. */
  widthEdge?: 'top' | 'bottom'
}

/* A selected rectangle's width along its top or bottom and depth along its left side, and a handle
   on each corner and side to resize it by. */
export const SelectionOverlay: FunctionComponent<SelectionOverlayPropsType> = ({
  bounds,
  onHandlePointerDown,
  rect,
  unit,
  widthEdge = 'top'
}) => {
  const handleSize = HANDLE_PIXELS * unit
  const fontSize = LABEL_PIXELS * unit
  const gap = LABEL_GAP_PIXELS * unit
  // Outside the rectangle, unless that would leave the drawing.
  const widthY = widthEdge === 'bottom'
    ? rect.y + rect.depth + gap
    : rect.y - gap - fontSize / 2 >= bounds.top ? rect.y - gap : rect.y + gap
  const depthX = rect.x - gap - fontSize / 2 >= bounds.left ? rect.x - gap : rect.x + gap
  const depthY = rect.y + rect.depth / 2

  const renderLabel = (
    text: string,
    x: number,
    y: number,
    isVertical: boolean
  ): ReactElement =>
    <text
      className='selection-dimension'
      fontSize={fontSize}
      strokeWidth={fontSize / 4}
      transform={isVertical ? `rotate(-90 ${x} ${y})` : undefined}
      x={x}
      y={y}
    >
      { text }
    </text>

  return (
    <g className='selection-overlay'>
      { renderLabel(
        formatLength(rect.width),
        rect.x + rect.width / 2,
        widthY,
        false
      ) }
      { renderLabel(
        formatLength(rect.depth),
        depthX,
        depthY,
        true
      ) }
      { onHandlePointerDown && HANDLES.map(handle => {
        const { x, y } = handlePoint(
          rect,
          handle
        )

        return (
          <rect
            className={`selection-handle is-${handle}`}
            height={handleSize}
            key={handle}
            onPointerDown={event => {
              event.stopPropagation()
              onHandlePointerDown(
                event,
                handle
              )
            }}
            width={handleSize}
            x={x - handleSize / 2}
            y={y - handleSize / 2}
          />
        )
      }) }
    </g>
  )
}
