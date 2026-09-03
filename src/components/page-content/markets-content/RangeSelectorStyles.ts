import { css } from 'styled-components'
import { XSMALL_MAX } from '../../../utils/constants/breakpoints'
import {
  GREY2,
  GREY3,
  LINK1
} from '../../../utils/constants/colors'

export const RangeSelectorStyles = css`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;

  .range-label {
    color: ${GREY3};
    font-size: 12px;
    margin-right: 4px;
  }

  .range-button {
    background: none;
    border: 1px solid #e6e6e6;
    border-radius: 4px;
    color: ${GREY2};
    cursor: pointer;
    font-family: inherit;
    font-size: 12px;
    line-height: 1;
    padding: 7px 12px;

    &:hover {
      border-color: ${LINK1};
      color: ${LINK1};
    }

    &.range-button--active {
      background-color: ${LINK1};
      border-color: ${LINK1};
      color: #fff;
      font-weight: bold;

      &:hover {
        color: #fff;
      }
    }
  }

  @media screen and (max-width: ${XSMALL_MAX}) {
    .range-button {
      flex: 1 1 auto;
      padding: 7px 8px;
    }
  }
`
