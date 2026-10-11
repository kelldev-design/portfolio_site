import { css } from 'styled-components'
import {
  GREY1,
  GREY3,
  LINK1,
  STATUS_BAD,
  STATUS_GOOD
} from '../../../utils/constants/colors'
import {
  SPACING_X,
  SPACING_Y
} from '../../../utils/constants/spacings'

export const PortfolioItemFormStyles = css`
  .form-field-label {
    color: ${GREY3};
    font-size: 11px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .form-row {
    align-items: flex-end;
    display: flex;
    gap: ${SPACING_X};
  }

  .form-row-field {
    flex-grow: 1;
    min-width: 0px;
  }

  .form-row-action {
    color: ${LINK1};
    font-size: 12px;
    padding-bottom: ${SPACING_Y};
  }

  .form-row-thumbnail {
    flex-shrink: 0;
    padding-bottom: ${SPACING_Y};
    width: 40px;
  }

  .form-hint {
    color: ${GREY3};
    font-size: 12px;
    margin-top: 4px;
  }

  .form-checkbox-group {
    display: flex;
    gap: ${SPACING_X};
  }

  .form-add-action {
    color: ${LINK1};
    font-size: 12px;
  }

  .form-error {
    color: ${STATUS_BAD};
    font-size: 12px;
  }

  .form-success {
    color: ${STATUS_GOOD};
    font-size: 13px;
  }

  .form-submit {
    background-color: ${LINK1};
    border: none;
    border-radius: 4px;
    color: ${GREY1};
    cursor: pointer;
    font-family: inherit;
    font-size: 13px;
    padding: ${SPACING_Y} ${SPACING_X};

    &:disabled {
      background-color: ${GREY3};
      cursor: default;
    }
  }
`
