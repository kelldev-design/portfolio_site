import { css } from 'styled-components'
import { SMALL_MAX } from '../../../utils/constants/breakpoints'
import {
  GREY1,
  GREY3,
  LINK1,
  STATUS_BAD
} from '../../../utils/constants/colors'
import {
  SPACING_X,
  SPACING_X_L,
  SPACING_Y,
  SPACING_Y_L
} from '../../../utils/constants/spacings'
import {
  animationFadeIn,
  boxShadow
} from '../../../utils/constants/styles'

/* The planner fills the window: a sidebar of rooms and furniture, and the plan or shape
   editor taking all the space left, so the drawing is as large as the screen allows. */
export const RoomPlannerContentStyles = css`
  ${animationFadeIn}
  box-sizing: border-box;
  display: flex;
  gap: ${SPACING_X_L};
  height: 100vh;
  padding: ${SPACING_Y_L} ${SPACING_X_L};

  .room-planner-sidebar {
    display: flex;
    flex: 0 0 320px;
    flex-direction: column;
    gap: ${SPACING_Y_L};
    min-height: 0px;
    overflow-y: auto;
    /* Room for the cards' shadows inside the scroll area. */
    padding: 6px;
    margin: -6px;
  }

  .room-planner-intro {
    padding: 0 ${SPACING_X};
  }

  .room-planner-card {
    ${boxShadow}
    background-color: #fff;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: ${SPACING_Y};
    padding: ${SPACING_Y_L} ${SPACING_X_L};
  }

  .room-planner-section-heading {
    font-size: 16px;
    line-height: 1em;
    margin: 0;
  }

  .room-planner-section-toggle {
    align-items: center;
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    display: flex;
    font: inherit;
    justify-content: space-between;
    padding: 0;
    text-align: left;
    width: 100%;

    &:focus-visible {
      outline: 1px dashed ${GREY3};
    }
  }

  /* A small caret, pointing down when the section is open and right when it is closed. */
  .room-planner-section-chevron {
    border-bottom: 2px solid ${GREY3};
    border-right: 2px solid ${GREY3};
    height: 6px;
    margin-right: 4px;
    transform: rotate(-45deg);
    transition: transform 0.15s;
    width: 6px;

    &.is-open {
      transform: rotate(45deg);
    }
  }

  .room-planner-section-body {
    display: flex;
    flex-direction: column;
    gap: ${SPACING_Y};

    &[hidden] {
      display: none;
    }
  }

  .room-planner-main {
    flex: 1;
    min-height: 0px;
    min-width: 0px;
  }

  .room-planner-hint {
    color: ${GREY3};
    font-size: 12px;
    margin: 0;
  }

  .room-planner-subheading {
    color: ${GREY3};
    font-size: 11px;
    letter-spacing: 0.05em;
    margin: ${SPACING_Y} 0;
    text-transform: uppercase;
  }

  .room-planner-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .room-planner-row {
    align-items: center;
    border-left: 3px solid transparent;
    border-radius: 0px 4px 4px 0px;
    display: flex;
    gap: ${SPACING_X};
    padding-right: ${SPACING_X};

    &:hover {
      background-color: ${GREY1};
    }

    &.is-selected {
      background-color: ${GREY1};
      border-left-color: ${LINK1};
      font-weight: 600;
    }
  }

  .room-planner-row-main {
    align-items: center;
    background-color: transparent;
    border: none;
    color: inherit;
    display: flex;
    flex-grow: 1;
    font-family: inherit;
    font-size: 14px;
    font-weight: inherit;
    gap: ${SPACING_X};
    min-width: 0px;
    padding: ${SPACING_Y} ${SPACING_X};
    text-align: left;
  }

  button.room-planner-row-main {
    cursor: pointer;

    &:focus-visible {
      outline: 1px dashed ${GREY3};
    }
  }

  /* Takes the row's spare width, so the size beside it keeps its line unless even the
     name's longest word leaves too little room. */
  .room-planner-row-name {
    flex: 1 1 0px;
  }

  .room-planner-row-size {
    color: ${GREY3};
    font-size: 12px;
    font-weight: normal;
    margin-left: auto;
    /* Wraps after the × when a row is too narrow for it, rather than running into the
       row's actions. */
    text-align: right;
  }

  .room-planner-swatch {
    border-radius: 2px;
    flex-shrink: 0;
    height: 12px;
    width: 12px;
  }

  .room-planner-row-action {
    background-color: transparent;
    border: none;
    color: ${LINK1};
    cursor: pointer;
    flex-shrink: 0;
    font-family: inherit;
    font-size: 12px;
    padding: 0;

    &:hover {
      text-decoration: underline;
    }

    &:disabled {
      color: ${GREY3};
      cursor: default;
      text-decoration: none;
    }

    &.is-danger {
      color: ${STATUS_BAD};
    }
  }

  .room-planner-form {
    display: flex;
    flex-direction: column;
    gap: ${SPACING_Y};
  }

  .room-planner-submit {
    background-color: ${LINK1};
    border: none;
    border-radius: 4px;
    color: ${GREY1};
    cursor: pointer;
    font-family: inherit;
    font-size: 13px;
    padding: ${SPACING_Y} ${SPACING_X};

    &:disabled {
      background-color: ${GREY3};
      cursor: default;
    }
  }

  .room-planner-plan-header {
    align-items: baseline;
    display: flex;
    gap: ${SPACING_X_L};
    justify-content: space-between;
  }

  .room-planner-plan-actions {
    display: flex;
    flex-shrink: 0;
    gap: ${SPACING_X_L};
  }

  /* The selected piece's or door's controls, stacked to fit the sidebar. */
  .room-planner-sync {
    color: ${GREY3};
    font-size: 12px;

    &.is-warning {
      color: ${STATUS_BAD};
    }
  }

  .room-planner-json {
    display: flex;
    flex-direction: column;
    gap: ${SPACING_Y};
  }

  .room-planner-selection {
    display: flex;
    flex-direction: column;
    gap: ${SPACING_Y};
  }

  .room-planner-selection-name {
    align-items: baseline;
    display: flex;
    flex-wrap: wrap;
    font-size: 14px;
    font-weight: 600;
    gap: ${SPACING_X};
  }

  .room-planner-selection-actions {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: ${SPACING_Y} ${SPACING_X_L};
    min-height: 31px;
  }

  .room-planner-warning {
    color: ${STATUS_BAD};
    font-size: 12px;
  }

  /* Stacked on small screens: the page scrolls, and the plan keeps most of the height. */
  @media screen and (max-width: ${SMALL_MAX}) {
    flex-direction: column;
    height: auto;
    padding: ${SPACING_Y} ${SPACING_X};

    .room-planner-sidebar {
      flex: none;
      overflow-y: visible;
    }

    .room-planner-main {
      flex: none;
      height: 85vh;
    }
  }
`
