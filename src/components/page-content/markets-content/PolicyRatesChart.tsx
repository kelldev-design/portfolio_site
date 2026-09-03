import { type FunctionComponent, useMemo } from 'react'
import styled from 'styled-components'
import { ChartCard } from './ChartCard'
import { MarketChart } from './MarketChart'
import {
  buildChartRows,
  buildSeriesConfigs,
  formatAxisDate,
  formatShortDate,
  POLICY_IDS,
  type RangeKey
} from './marketsConfig'
import { PolicyRatesChartStyles } from './PolicyRatesChartStyles'
import {
  type ChartRow,
  type MarketSeriesMap
} from '../../../types/marketTypes'
import { CHART_BAND } from '../../../utils/constants/colors'

const PolicyRatesChartStyled = styled.div`${PolicyRatesChartStyles}`

const BAND_KEY = 'fedTargetBand'

const OVERNIGHT_IDS = [
  'EFFR',
  'SOFR'
]

interface PolicyRatesChartProps {
  range: RangeKey
  seriesMap: MarketSeriesMap
}

export const PolicyRatesChart: FunctionComponent<PolicyRatesChartProps> = ({
  range,
  seriesMap
}) => {
  const data = useMemo(
    () => {
      const rows = buildChartRows(
        POLICY_IDS,
        seriesMap
      )

      return rows.map((row: ChartRow) => {
        const lower = row.DFEDTARL
        const upper = row.DFEDTARU

        if (typeof lower !== 'number' || typeof upper !== 'number') return row

        return {
          ...row,
          [BAND_KEY]: [ lower, upper ]
        }
      })
    },
    [ seriesMap ]
  )

  const series = useMemo(
    () => buildSeriesConfigs(
      OVERNIGHT_IDS,
      seriesMap
    ),
    [ seriesMap ]
  )

  return (
    <PolicyRatesChartStyled>
      <ChartCard
        description='The Fed funds target band with the two overnight rates that trade inside it.'
        title='Policy & short rates'
      >
        <MarketChart
          band={{
            color: CHART_BAND,
            dataKey: BAND_KEY,
            label: 'Fed funds target band'
          }}
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
    </PolicyRatesChartStyled>
  )
}
