import { type FunctionComponent, useMemo } from 'react'
import styled from 'styled-components'
import { ChartCard } from './ChartCard'
import { InflationRatesChartStyles } from './InflationRatesChartStyles'
import { MarketChart } from './MarketChart'
import {
  buildChartRows,
  buildSeriesConfigs,
  formatAxisDate,
  formatShortDate,
  type RangeKey
} from './marketsConfig'
import { type MarketSeriesMap } from '../../../types/marketTypes'

const InflationRatesChartStyled = styled.div`${InflationRatesChartStyles}`

const INFLATION_CHART_IDS = [
  'T10YIE',
  'T5YIE',
  'T5YIFR',
  'DFII10'
]

interface InflationRatesChartProps {
  range: RangeKey
  seriesMap: MarketSeriesMap
}

export const InflationRatesChart: FunctionComponent<InflationRatesChartProps> = ({
  range,
  seriesMap
}) => {
  const data = useMemo(
    () => buildChartRows(
      INFLATION_CHART_IDS,
      seriesMap
    ),
    [ seriesMap ]
  )

  const series = useMemo(
    () => buildSeriesConfigs(
      INFLATION_CHART_IDS,
      seriesMap
    ),
    [ seriesMap ]
  )

  return (
    <InflationRatesChartStyled>
      <ChartCard
        description='Breakeven inflation rates, the 5y5y forward breakeven and the 10 year TIPS real yield.'
        title='Inflation & real rates'
      >
        <MarketChart
          data={data}
          series={series}
          xAxisKey='date'
          xTickFormatter={value => formatAxisDate(
            String(value),
            range === '1M'
          )}
          xTooltipFormatter={value => formatShortDate(String(value))}
        />
      </ChartCard>
    </InflationRatesChartStyled>
  )
}
