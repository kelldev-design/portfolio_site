import { type FunctionComponent, useMemo } from 'react'
import styled from 'styled-components'
import { ChartCard } from './ChartCard'
import { CurveSpreadsChartStyles } from './CurveSpreadsChartStyles'
import { MarketChart } from './MarketChart'
import {
  buildChartRows,
  buildSeriesConfigs,
  formatAxisDate,
  formatShortDate,
  type RangeKey,
  SPREAD_IDS
} from './marketsConfig'
import { type MarketSeriesMap } from '../../../types/marketTypes'

const CurveSpreadsChartStyled = styled.div`${CurveSpreadsChartStyles}`

interface CurveSpreadsChartProps {
  range: RangeKey
  seriesMap: MarketSeriesMap
}

export const CurveSpreadsChart: FunctionComponent<CurveSpreadsChartProps> = ({
  range,
  seriesMap
}) => {
  const data = useMemo(
    () => buildChartRows(
      SPREAD_IDS,
      seriesMap
    ),
    [ seriesMap ]
  )

  const series = useMemo(
    () => buildSeriesConfigs(
      SPREAD_IDS,
      seriesMap
    ),
    [ seriesMap ]
  )

  return (
    <CurveSpreadsChartStyled>
      <ChartCard
        description='Spreads in percentage points. The shaded region below zero is inversion, when short rates sit above long rates.'
        title='Curve spreads'
      >
        <MarketChart
          data={data}
          series={series}
          shadeBelowZero
          showZeroLine
          valueSuffix=' pp'
          xAxisKey='date'
          xTickFormatter={value => formatAxisDate(
            String(value),
            range === '1M'
          )}
          xTooltipFormatter={value => formatShortDate(String(value))}
        />
      </ChartCard>
    </CurveSpreadsChartStyled>
  )
}
