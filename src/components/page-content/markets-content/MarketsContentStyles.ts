import { css } from 'styled-components'
import { XSMALL_MAX } from '../../../utils/constants/breakpoints'
import { GREY3 } from '../../../utils/constants/colors'
import {
  animationFadeIn,
  animationFadeOut
} from '../../../utils/constants/styles'

export const MarketsContentStyles = css`
  ${animationFadeIn}

  &.fade-out {
    ${animationFadeOut}
  }

  .markets-note {
    color: ${GREY3};
    font-size: 12px;
    margin: 12px 0 0 0;
  }

  .markets-controls {
    width: 100%;
  }

  @media screen and (max-width: ${XSMALL_MAX}) {
    .markets-note {
      font-size: 11px;
    }
  }
`
