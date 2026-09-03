import { type FunctionComponent, useMemo } from 'react'
import styled from 'styled-components'
import { ChartCard } from './ChartCard'
import { KeyTenorsChartStyles } from './KeyTenorsChartStyles'
import { MarketChart } from './MarketChart'
import {
  buildChartRows,
  buildSeriesConfigs,
  formatAxisDate,
  formatShortDate,
  type RangeKey
} from './marketsConfig'
import { type MarketSeriesMap } from '../../../types/marketTypes'

const KeyTenorsChartStyled = styled.div`${KeyTenorsChartStyles}`

const TENOR_IDS = [
  'DGS3MO',
  'DGS2',
  'DGS10',
  'DGS30'
]

interface KeyTenorsChartProps {
  range: RangeKey
  seriesMap: MarketSeriesMap
}

export const KeyTenorsChart: FunctionComponent<KeyTenorsChartProps> = ({
  range,
  seriesMap
}) => {
  const data = useMemo(
    () => buildChartRows(
      TENOR_IDS,
      seriesMap
    ),
    [ seriesMap ]
  )

  const series = useMemo(
    () => buildSeriesConfigs(
      TENOR_IDS,
      seriesMap
    ),
    [ seriesMap ]
  )

  return (
    <KeyTenorsChartStyled>
      <ChartCard
        description='Constant maturity Treasury yields for the tenors that anchor the curve.'
        title='Key tenors over time'
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
    </KeyTenorsChartStyled>
  )
}
