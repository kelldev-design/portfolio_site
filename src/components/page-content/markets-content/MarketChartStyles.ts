import { css } from 'styled-components'
import { XSMALL_MAX } from '../../../utils/constants/breakpoints'
import {
  CHART_GRID,
  GREY2,
  GREY3,
  GREY4
} from '../../../utils/constants/colors'

export const MarketChartStyles = css`
  width: 100%;

  .chart-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 18px;
    margin: 0 0 12px 0;
    padding: 0;
    list-style: none;
  }

  .chart-legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    color: ${GREY2};
    font-size: 12px;
  }

  .chart-legend-toggle {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
  }

  .chart-legend-toggle.chart-legend-toggle--off {
    color: ${GREY3};

    .chart-legend-swatch {
      opacity: 0.4;
    }
  }

  .chart-legend-checkbox {
    width: 13px;
    height: 13px;
    margin: 0;
    cursor: pointer;
    flex-shrink: 0;
  }

  .chart-legend-swatch {
    display: inline-block;
    width: 12px;
    height: 3px;
    border-radius: 2px;
    flex-shrink: 0;
  }

  .chart-legend-swatch.chart-legend-swatch--band {
    height: 10px;
    border-radius: 2px;
  }

  .chart-canvas {
    width: 100%;
  }

  .chart-tooltip {
    background-color: #fff;
    border: 1px solid ${CHART_GRID};
    border-radius: 4px;
    box-shadow: 0px 0px 6px ${GREY4};
    padding: 8px 10px;
    min-width: 140px;
  }

  .chart-tooltip-date {
    color: ${GREY3};
    font-size: 11px;
    margin-bottom: 6px;
  }

  .chart-tooltip-row {
    display: flex;
    align-items: center;
    gap: 6px;
    color: ${GREY2};
    font-size: 12px;
    line-height: 1.6;
  }

  .chart-tooltip-swatch {
    display: inline-block;
    width: 10px;
    height: 3px;
    border-radius: 2px;
    flex-shrink: 0;
  }

  .chart-tooltip-value {
    margin-left: auto;
    font-variant-numeric: tabular-nums;
  }

  @media screen and (max-width: ${XSMALL_MAX}) {
    .chart-legend {
      gap: 4px 12px;
    }

    .chart-legend-item {
      font-size: 11px;
    }
  }
`
