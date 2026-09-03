import { css } from 'styled-components'
import { XSMALL_MAX } from '../../../utils/constants/breakpoints'
import {
  GREY2,
  GREY3,
  TEXT1
} from '../../../utils/constants/colors'

export const StatTilesStyles = css`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  width: 100%;

  .stat-tile {
    border-left: 2px solid #e6e6e6;
    padding-left: 12px;
  }

  .stat-tile-label {
    color: ${GREY3};
    font-size: 11px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .stat-tile-value {
    color: ${TEXT1};
    font-size: 26px;
    font-variant-numeric: tabular-nums;
    line-height: 1.3;
  }

  .stat-tile-change {
    color: ${GREY2};
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }

  .stat-tile-arrow {
    margin-right: 3px;
  }

  .stat-tile-date {
    color: ${GREY3};
    font-size: 11px;
    margin-top: 2px;
  }

  @media screen and (max-width: ${XSMALL_MAX}) {
    grid-template-columns: 1fr;
    gap: 14px;

    .stat-tile-value {
      font-size: 22px;
    }
  }
`
