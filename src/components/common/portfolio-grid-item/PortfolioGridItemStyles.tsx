import { css } from 'styled-components'
import { MEDIUM_MIN, SMALL_MAX, SMALL_MIN, XSMALL_MAX } from '../../../utils/constants/breakpoints'
import { GREY1, GREY3 } from '../../../utils/constants/colors'
import { SPACING_Y_NUM } from '../../../utils/constants/spacings'
import {
  animationFadeIn,
  animationFadeOut,
  boxShadow
} from '../../../utils/constants/styles'

export const PortfolioGridItemStyles = css`
  box-sizing: border-box;

  &.fade-in {
    ${animationFadeIn}
  }

  &.fade-out {
    ${animationFadeOut}
  }

  .image-wrapper {
    ${boxShadow}
    position: relative;
    cursor: pointer;
  }

  .hover-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 8%;
    box-sizing: border-box;
    background: rgba(0, 0, 0, 0.65);
    color: #fff;
    text-align: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity .2s ease;
  }

  .hover-overlay-name {
    font-size: 16px;
    line-height: 1.2;
  }

  .hover-overlay-year {
    font-size: 13px;
    color: ${GREY1};
  }

  @media screen and (min-width: ${MEDIUM_MIN}) {
    padding: 1%;
    flex: 0 0 20%;
  }

  @media screen and (max-width: ${SMALL_MAX}) and (min-width: ${SMALL_MIN}) {
    padding: 1%;
    flex: 0 0 25%;
  }

  @media screen and (min-width: ${SMALL_MIN}) {
    .image-wrapper {
      &:hover {
        box-shadow: 0px 0px 10px ${GREY3};
        transition: all .2s ease;
        transform: scale(1.05, 1.05);
      }

      &:hover .hover-overlay,
      &:focus-within .hover-overlay {
        opacity: 1;
      }
    }
  }

  @media screen and (max-width: ${XSMALL_MAX}) {
    padding: 0px 0px ${2.5 * SPACING_Y_NUM}px 0px;
    flex: 0 0 100%;
  }
`
