import { css } from 'styled-components'
import { XSMALL_MAX } from '../../../utils/constants/breakpoints'
import { GREY3 } from '../../../utils/constants/colors'

export const ChartCardStyles = css`
  width: 100%;

  .chart-card-heading {
    margin-bottom: 4px;
  }

  .chart-card-description {
    color: ${GREY3};
    font-size: 12px;
    margin: 0 0 14px 0;
  }

  @media screen and (max-width: ${XSMALL_MAX}) {
    .chart-card-description {
      font-size: 11px;
    }
  }
`
