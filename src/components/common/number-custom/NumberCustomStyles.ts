import { css } from 'styled-components'
import {
  GREY2,
  GREY3,
  LINK1,
  STATUS_BAD
} from '../../../utils/constants/colors'

/* Matches InputCustom, except that it keeps the field's native appearance, which is what
   draws the up and down arrows. */
export const NumberCustomStyles = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0px;

  .number-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: ${GREY3};
  }

  .number-field {
    background-color: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    box-sizing: border-box;
    color: ${GREY2};
    font-family: inherit;
    font-size: 13px;
    padding: 6px 4px 6px 10px;
    width: 100%;

    &:focus {
      outline: 1px dashed ${LINK1};
      border-color: ${LINK1};
    }
  }

  /* Hidden from view but still read as the field's label by screen readers. */
  .number-label-hidden {
    clip: rect(0px, 0px, 0px, 0px);
    height: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }

  .number-error {
    color: ${STATUS_BAD};
    font-size: 11px;
  }
`
