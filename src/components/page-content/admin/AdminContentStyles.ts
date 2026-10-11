import { css } from 'styled-components'
import { GREY1, GREY3, LINK1 } from '../../../utils/constants/colors'
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
    list-style: none;
    margin: 0px;
    padding: 0px;
  }

  .admin-project {
    align-items: center;
    background-color: transparent;
    border: none;
    border-left: 3px solid transparent;
    border-radius: 0px 4px 4px 0px;
    color: inherit;
    cursor: pointer;
    display: flex;
    font-family: inherit;
    font-size: 14px;
    gap: ${SPACING_X};
    padding: ${SPACING_Y} ${SPACING_X};
    text-align: left;
    width: 100%;

    &:hover {
      background-color: ${GREY1};
    }

    &:focus-visible {
      outline: 1px dashed ${GREY3};
    }

    &.is-selected {
      background-color: ${GREY1};
      border-left-color: ${LINK1};
      font-weight: 600;
    }

    img {
      flex-shrink: 0;
    }
  }

  .admin-project-new {
    color: ${LINK1};
    margin-bottom: ${SPACING_Y};
  }
`
