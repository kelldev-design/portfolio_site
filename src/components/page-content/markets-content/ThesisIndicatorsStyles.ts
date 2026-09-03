import { css } from 'styled-components'
import {
  CHART_GRID,
  GREY2,
  GREY3
} from '../../../utils/constants/colors'

export const ThesisIndicatorsStyles = css`
  .thesis-indicators {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 12px;
  }

  .thesis-indicator {
    border: 1px solid ${CHART_GRID};
    border-radius: 6px;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .thesis-indicator__head {
    align-items: center;
    display: flex;
    gap: 8px;
  }

  .thesis-indicator__dot {
    border-radius: 50%;
    flex: 0 0 auto;
    height: 10px;
    width: 10px;
  }

  .thesis-indicator__status {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .thesis-indicator__label {
    color: ${GREY2};
    font-size: 13px;
  }

  .thesis-indicator__value {
    font-size: 22px;
    font-weight: 600;
  }

  .thesis-indicator__detail {
    color: ${GREY3};
    font-size: 12px;
    line-height: 1.35;
  }

  .thesis-indicators__note {
    color: ${GREY3};
    font-size: 12px;
    margin: 10px 0 0;
  }
`
