import { css } from 'styled-components'
import { LINK1 } from '../../../utils/constants/colors'

/* For SelectionOverlay, included in the styles of each drawing that shows it. */
export const SelectionOverlayStyles = css`
  .selection-dimension {
    dominant-baseline: middle;
    fill: ${LINK1};
    font-weight: 600;
    /* A white halo, so the number reads over grid lines and other shapes. */
    paint-order: stroke;
    pointer-events: none;
    stroke: #fff;
    stroke-linejoin: round;
    text-anchor: middle;
  }

  .selection-handle {
    fill: #fff;
    stroke: ${LINK1};
    stroke-width: 1.5px;
    vector-effect: non-scaling-stroke;

    &.is-n,
    &.is-s {
      cursor: ns-resize;
    }

    &.is-e,
    &.is-w {
      cursor: ew-resize;
    }

    &.is-nw,
    &.is-se {
      cursor: nwse-resize;
    }

    &.is-ne,
    &.is-sw {
      cursor: nesw-resize;
    }
  }

  .snap-guide {
    pointer-events: none;
    stroke: ${LINK1};
    stroke-dasharray: 4 3;
    stroke-width: 1px;
    vector-effect: non-scaling-stroke;
  }
`
