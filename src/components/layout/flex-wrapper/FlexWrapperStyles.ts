import { css } from 'styled-components'
import { boxShadow } from '../../../utils/constants/styles'

interface FlexWrapperStylesPropsType {
  backgroundColor?: string
}

const renderBackgroundColor = ({ backgroundColor }: FlexWrapperStylesPropsType): string =>
  backgroundColor ? `background-color: ${backgroundColor};` : ''

export const FlexWrapperStyles = css<FlexWrapperStylesPropsType>`
  display: flex;
  flex: 1;
  overflow: hidden;

  &.flex-column {
    flex-direction: column;
  }

  &.shadow {
    ${boxShadow}
  }

  ${renderBackgroundColor}
`
