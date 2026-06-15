import { css } from 'styled-components'
import {
  SPACING_X_L,
  SPACING_Y_L
} from '../../../utils/constants/spacings'

export interface SpacerStrings {
  b?: string
  l?: string
  r?: string
  t?: string
}

export const SpacerStyles = css<SpacerStrings>`
  ${({
    t,
    r,
    b,
    l
  }) => (`
    flex: 1;
    padding-bottom: ${b ?? SPACING_Y_L};
    padding-left: ${l ?? SPACING_X_L};
    padding-right: ${r ?? SPACING_X_L};
    padding-top: ${t ?? SPACING_Y_L};
  `)}

  max-width: 100%;
  box-sizing: border-box;

  &.spacer-flex {
    display: flex;
  }
`
