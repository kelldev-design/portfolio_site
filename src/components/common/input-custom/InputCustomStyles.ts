import { css } from 'styled-components'
import {
  GREY2,
  GREY3,
  LINK1,
  STATUS_BAD
} from '../../../utils/constants/colors'

export const InputCustomStyles = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0px;

  .input-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: ${GREY3};
  }

  .input-field {
    appearance: none;
    background-color: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    color: ${GREY2};
    font-family: inherit;
    font-size: 13px;
    padding: 6px 10px;
    resize: vertical;
    width: 100%;

    &:focus {
      outline: 1px dashed ${LINK1};
      border-color: ${LINK1};
    }
  }

  .input-error {
    color: ${STATUS_BAD};
    font-size: 11px;
  }
`
