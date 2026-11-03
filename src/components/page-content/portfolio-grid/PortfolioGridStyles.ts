import { css } from 'styled-components'
import { XSMALL_MAX } from '../../../utils/constants/breakpoints'
import { animationFadeIn, animationFadeOut } from '../../../utils/constants/styles'

export const PortfolioGridStyles = css`
  display: flex;
  flex-wrap: wrap;
  margin: -1%;

  @media screen and (max-width: ${XSMALL_MAX}) {
    margin: 0px;
  }
`

export const PortfolioIntroStyles = css`
  max-width: 720px;

  &.fade-in {
    ${animationFadeIn}

    &.fade-out {
      ${animationFadeOut}
    }
  }
`
