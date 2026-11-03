import { css } from 'styled-components'
import { GREY2, GREY5, TEXT1 } from '../../../utils/constants/colors'

export const NavMenuItemStyles = css`
  display: inline-block;
  padding-bottom: 3px;
  color: ${TEXT1};
  border-bottom: 3px solid transparent;

  &:hover {
    border-bottom: 3px solid ${GREY5};
  }

  .nav-menu-button {
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    cursor: pointer;

    &:focus {
      outline: 1px dashed ${GREY2};
    }
  }

  &.selected {
    border-bottom: 3px solid ${TEXT1};
  }
`
