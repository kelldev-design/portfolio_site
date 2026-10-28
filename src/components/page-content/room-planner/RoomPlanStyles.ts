import { css } from 'styled-components'
import {
  CHART_GRID,
  GREY1,
  GREY2,
  GREY3,
  GREY4,
  LINK1,
  STATUS_BAD
} from '../../../utils/constants/colors'

/* Fills the space its parent leaves it; the plan scales to fit, as large as it can. */
export const RoomPlanStyles = css`
  flex: 1;
  min-height: 0px;
  width: 100%;

  .room-plan {
    display: block;
    height: 100%;
    /* Stops touch drags from scrolling the page instead of moving furniture. */
    touch-action: none;
    user-select: none;
    width: 100%;
  }

  .room-plan-floor {
    fill: #fff;
  }

  .room-plan-grid-inch,
  .room-plan-grid-half-foot,
  .room-plan-grid-foot {
    vector-effect: non-scaling-stroke;
  }

  .room-plan-grid-inch {
    stroke: ${GREY1};
    stroke-width: 0.5px;
  }

  .room-plan-grid-half-foot {
    stroke: ${CHART_GRID};
    stroke-width: 1px;
  }

  .room-plan-grid-foot {
    stroke: ${GREY4};
    stroke-width: 1px;
  }

  .room-plan-wall {
    fill: none;
    stroke: ${GREY2};
    stroke-linecap: square;
    stroke-width: 3px;
    vector-effect: non-scaling-stroke;
  }

  .room-plan-door {
    cursor: grab;
    outline: none;

    &:active {
      cursor: grabbing;
    }
  }

  /* Invisible, so the whole swing is easy to click, not just its thin lines. */
  .room-plan-door-hit {
    fill: transparent;
  }

  /* Paints over the wall to open the doorway. */
  .room-plan-door-gap {
    stroke: #fff;
    stroke-width: 5px;
    vector-effect: non-scaling-stroke;
  }

  .room-plan-door-swing {
    fill: none;
    stroke: ${GREY2};
    stroke-width: 1.5px;
    vector-effect: non-scaling-stroke;
  }

  /* A held door is also selected, so this outranks the selected style below. */
  .room-plan-door.is-selected.is-lifted .room-plan-door-hit {
    fill: ${LINK1};
    fill-opacity: 0.2;
  }

  .room-plan-door.is-selected,
  .room-plan-door:focus-visible {
    .room-plan-door-hit {
      fill: ${LINK1};
      fill-opacity: 0.08;
    }

    .room-plan-door-swing {
      stroke: ${LINK1};
      stroke-width: 2.5px;
    }
  }

  .room-plan-dimension {
    dominant-baseline: middle;
    fill: ${GREY3};
    text-anchor: middle;

    /* A door's width, set apart from the wall lengths either side of it. */
    &.is-door {
      fill: ${GREY2};
      font-weight: 600;
    }
  }

  .room-plan-handle {
    cursor: pointer;
    outline: none;

    circle {
      fill: #fff;
      stroke: ${LINK1};
      stroke-width: 1.5px;
      vector-effect: non-scaling-stroke;
    }

    path {
      fill: none;
      stroke: ${LINK1};
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: 2px;
      vector-effect: non-scaling-stroke;
    }

    &.is-remove circle,
    &.is-remove path {
      stroke: ${STATUS_BAD};
    }

    &:hover,
    &:focus-visible {
      circle {
        fill: ${LINK1};
      }

      path {
        stroke: #fff;
      }
    }

    &.is-remove:hover circle,
    &.is-remove:focus-visible circle {
      fill: ${STATUS_BAD};
    }
  }

  .room-plan-piece {
    cursor: grab;
    outline: none;

    .room-plan-piece-fill {
      fill-opacity: 0.75;
    }

    .room-plan-piece-outline {
      fill: none;
      stroke: ${GREY2};
      stroke-linecap: square;
      stroke-width: 1px;
      vector-effect: non-scaling-stroke;
    }

    text {
      dominant-baseline: middle;
      fill: #fff;
      pointer-events: none;
      text-anchor: middle;
    }

    &:active {
      cursor: grabbing;
    }

    &.is-selected .room-plan-piece-fill,
    &:focus-visible .room-plan-piece-fill {
      fill-opacity: 0.95;
    }

    &.is-selected .room-plan-piece-outline,
    &:focus-visible .room-plan-piece-outline {
      stroke: ${LINK1};
      stroke-width: 3px;
    }

    /* Picked up by pressing and holding, ready to drag. */
    &.is-lifted {
      filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.35));
    }

    /* After the selected styles, so an overhanging piece stays flagged while selected. */
    &.is-outside .room-plan-piece-outline {
      stroke: ${STATUS_BAD};
      stroke-dasharray: 4 3;
      stroke-width: 2px;
    }
  }
`
