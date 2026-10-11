import { css } from 'styled-components'
import {
  GREY2,
  LINK1
} from '../../../utils/constants/colors'

export const CheckboxCustomStyles = css`
  align-items: center;
  display: flex;
  gap: 6px;
  min-width: 0px;

  .checkbox-input {
    accent-color: ${LINK1};
    cursor: pointer;
    margin: 0px;

    &:focus {
      outline: 1px dashed ${LINK1};
    }
  }

  .checkbox-label {
    color: ${GREY2};
    cursor: pointer;
    font-size: 13px;
  }
`
