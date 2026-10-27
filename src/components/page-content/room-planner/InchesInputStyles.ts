import { css } from 'styled-components'
import { GREY3 } from '../../../utils/constants/colors'

export const InchesInputStyles = css`
  border: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
  min-width: 0px;
  padding: 0;

  .inches-input-label {
    color: ${GREY3};
    font-size: 11px;
    letter-spacing: 0.05em;
    padding: 0;
    text-transform: uppercase;
  }

  .inches-input-parts {
    align-items: center;
    display: flex;
    gap: 4px;

    /* Wide enough for two digits beside the number arrows. */
    .number-field {
      width: 64px;
    }
  }

  .inches-input-unit {
    color: ${GREY3};
    font-size: 12px;
  }
`
