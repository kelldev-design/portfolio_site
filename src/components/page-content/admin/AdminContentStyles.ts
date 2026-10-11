import { css } from 'styled-components'
import {
  GREY1,
  GREY3,
  LINK1,
  STATUS_BAD
} from '../../../utils/constants/colors'
import { SPACING_X, SPACING_Y } from '../../../utils/constants/spacings'
import {
  animationFadeIn,
  animationFadeOut
} from '../../../utils/constants/styles'

export const AdminContentStyles = css`
  ${animationFadeIn}

  &.fade-out {
    ${animationFadeOut}
  }

  .flex-grow {
    flex-grow: 1;
  }

  .admin-project-list {
    position: relative;
  }

  .admin-project-row {
    align-items: center;
    background-color: #fff;
    border-left: 3px solid transparent;
    border-radius: 0px 4px 4px 0px;
    display: flex;

    &:hover {
      background-color: ${GREY1};
    }

    &.is-selected {
      background-color: ${GREY1};
      border-left-color: ${LINK1};
      font-weight: 600;
    }
  }

  .admin-project {
    align-items: center;
    background-color: transparent;
    border: none;
    color: inherit;
    cursor: pointer;
    display: flex;
    flex-grow: 1;
    font-family: inherit;
    font-size: 14px;
    font-weight: inherit;
    gap: ${SPACING_X};
    min-width: 0px;
    padding: ${SPACING_Y} ${SPACING_X};
    text-align: left;

    &:focus-visible {
      outline: 1px dashed ${GREY3};
    }

    img {
      flex-shrink: 0;
    }
  }

  .admin-project-new {
    color: ${LINK1};
  }

  .admin-project-hint {
    color: ${GREY3};
    font-size: 12px;
    margin: ${SPACING_Y} 0px;
  }

  .admin-order-error {
    color: ${STATUS_BAD};
    font-size: 12px;
    margin-bottom: ${SPACING_Y};
  }

  /* Shared by the project list and the form's image rows. */
  .drag-handle {
    background-color: transparent;
    border: none;
    border-radius: 4px;
    color: ${GREY3};
    cursor: grab;
    flex-shrink: 0;
    font-size: 16px;
    line-height: 1;
    padding: ${SPACING_Y} 6px;
    touch-action: none;

    &:hover {
      color: ${LINK1};
    }

    &:focus-visible {
      outline: 1px dashed ${GREY3};
    }
  }

  .sortable-item {
    background-color: #fff;
    position: relative;

    &.is-dragging {
      box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1;

      .drag-handle {
        cursor: grabbing;
      }
    }
  }
`
