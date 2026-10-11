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

  /* As tall as an input, so actions line up with the field beside them. */
  .form-row-action {
    align-items: center;
    color: ${LINK1};
    display: flex;
    flex-shrink: 0;
    font-size: 12px;
    min-height: 31px;
  }

  /* Image rows have no visible labels, so everything centers on the input. */
  .form-row-centered {
    align-items: center;
  }

  .form-row-thumbnail {
    display: flex;
    flex-shrink: 0;
    justify-content: center;
    width: 40px;

    img {
      display: block;
      max-height: 31px;
      object-fit: contain;
    }
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
    margin-top: 6px;
  }

  /* Buttons do not inherit font or color, so without this they render in the browser's
     default black system font instead of as the links they are styled to be. */
  .form-row-action button,
  .form-add-action button {
    color: inherit;
    font-family: inherit;
    font-size: inherit;

    &:hover {
      text-decoration: underline;
    }
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
