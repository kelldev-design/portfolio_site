import { css } from 'styled-components'
import { SelectionOverlayStyles } from './SelectionOverlayStyles'
import {
  CHART_GRID,
  GREY1,
  GREY2,
  LINK1,
  STATUS_BAD
} from '../../../utils/constants/colors'
import {
  SPACING_X,
  SPACING_Y
} from '../../../utils/constants/spacings'

export const ShapeEditorStyles = css`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0px;
  width: 100%;

  .room-planner-form {
    flex: 1;
    min-height: 0px;
  }

  ${SelectionOverlayStyles}

  .shape-editor-toolbar {
    align-items: flex-end;
    display: flex;
    gap: ${SPACING_X};
  }

  .shape-editor-name {
    flex-grow: 1;
    min-width: 0px;
  }

  .shape-editor-add {
    background-color: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    color: ${GREY2};
    cursor: pointer;
    font-family: inherit;
    font-size: 13px;
    padding: 6px 12px;

    &:focus-visible {
      outline: 1px dashed ${LINK1};
    }
  }

  .shape-editor-canvas {
    cursor: crosshair;
    display: block;
    flex: 1;
    min-height: 0px;
    outline: none;

    /* Focused so Delete and the arrow keys reach the selected rectangle; only shown for
       keyboard focus, not on every click. */
    &:focus-visible {
      outline: 1px dashed ${LINK1};
    }
    /* Stops touch drags from scrolling the page instead of drawing. */
    touch-action: none;
    user-select: none;
    width: 100%;
  }

  .shape-editor-background {
    fill: #fff;
    stroke: ${CHART_GRID};
    stroke-width: 1px;
    vector-effect: non-scaling-stroke;
  }

  .shape-editor-grid {
    stroke: ${CHART_GRID};
    stroke-width: 1px;
    vector-effect: non-scaling-stroke;
  }

  .shape-editor-grid-minor {
    stroke: ${GREY1};
    stroke-width: 1px;
    vector-effect: non-scaling-stroke;
  }

  .shape-editor-rect {
    cursor: move;
    fill-opacity: 0.35;

    &.is-selected {
      fill-opacity: 0.55;
    }

    /* Picked up by pressing and holding, ready to drag. */
    &.is-lifted {
      fill-opacity: 0.75;
    }
  }

  .shape-editor-delete-handle {
    cursor: pointer;

    circle {
      fill: #fff;
      stroke: ${STATUS_BAD};
      stroke-width: 1.5px;
      vector-effect: non-scaling-stroke;
    }

    path {
      stroke: ${STATUS_BAD};
      stroke-linecap: round;
      stroke-width: 2px;
      vector-effect: non-scaling-stroke;
    }

    &:hover circle {
      fill: ${STATUS_BAD};
    }

    &:hover path {
      stroke: #fff;
    }
  }

  .shape-editor-outline {
    fill: none;
    pointer-events: none;
    stroke: ${GREY2};
    stroke-linecap: square;
    stroke-width: 2px;
    vector-effect: non-scaling-stroke;
  }

  .shape-editor-selection {
    fill: none;
    pointer-events: none;
    stroke: ${LINK1};
    stroke-dasharray: 4 3;
    stroke-width: 2px;
    vector-effect: non-scaling-stroke;
  }

  .room-planner-row-action.shape-editor-delete {
    color: ${STATUS_BAD};
    margin-left: auto;
  }

  .shape-editor-error {
    color: ${STATUS_BAD};
    font-size: 12px;
  }
`

/* The selected rectangle's fields, which the editor shows in the sidebar rather than inside
   itself, so they need their own styles. */
export const ShapeEditorDetailsStyles = css`
  .shape-editor-selected {
    display: flex;
    flex-direction: column;
    gap: ${SPACING_Y};
  }

  .shape-editor-fields {
    display: flex;
    flex-direction: column;
    gap: ${SPACING_Y};
  }
`
