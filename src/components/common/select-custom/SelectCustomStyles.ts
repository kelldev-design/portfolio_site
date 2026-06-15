import { css } from 'styled-components'
import { GREY2, GREY3, LINK1 } from '../../../utils/constants/colors'

export const SelectCustomStyles = css`
  display: flex;
  flex-direction: column;
  gap: 4px;

  .select-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: ${GREY3};
  }

  .select-input {
    appearance: none;
    background-color: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    color: ${GREY2};
    cursor: pointer;
    font-size: 13px;
    padding: 6px 28px 6px 10px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23888'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;

    &:focus {
      outline: 1px dashed ${LINK1};
      border-color: ${LINK1};
    }
  }
`
