import { type FunctionComponent, useMemo } from 'react'
import styled from 'styled-components'
import { ChartCard } from './ChartCard'
import { MarketChart } from './MarketChart'
import {
  CURVE_IDS,
  daysAgoDate,
  formatShortDate,
  TENOR_MONTHS,
  TENOR_TICKS,
  tenorLabel
} from './marketsConfig'
import { YieldCurveChartStyles } from './YieldCurveChartStyles'
import {
  type ChartRow,
  type ChartSeriesConfig,
  type MarketSeries,
  type MarketSeriesMap,
  type YieldCurve
} from '../../../types/marketTypes'
import {
  SERIES1,
  SERIES2,
  SERIES3
} from '../../../utils/constants/colors'
import { useIsSmallScreen } from '../../hooks/useIsSmallScreen'

const YieldCurveChartStyled = styled.div`${YieldCurveChartStyles}`

const SMALL_SCREEN_TICKS = [
  1,
  12,
  60,
  120,
  360
]

interface YieldCurveChartProps {
  curve?: YieldCurve
  curveHistory: MarketSeriesMap
}

const valueOnOrBefore = (
  series: MarketSeries | undefined,
  isoDate: string
): number | null => {
  if (!series?.observations?.length) return null

  let match: number | null = null

  series.observations.forEach(({ date, value }) => {
    if (date <= isoDate && typeof value === 'number') match = value
  })

  return match
}

export const YieldCurveChart: FunctionComponent<YieldCurveChartProps> = ({
  curve,
  curveHistory
}) => {
  const isSmallScreen = useIsSmallScreen()
  const monthAgo = daysAgoDate(31)
  const yearAgo = daysAgoDate(366)

  const data = useMemo(
    () => {
      const latestByFredId: Record<string, number | null> = {}

      curve?.points?.forEach(({ fredId, value }) => { latestByFredId[fredId] = value })

      const rows: ChartRow[] = CURVE_IDS.map(fredId => ({
        fredId,
        months: TENOR_MONTHS[fredId],
        latest: latestByFredId[fredId] ?? curveHistory[fredId]?.latest?.value ?? null,
        monthAgo: valueOnOrBefore(
          curveHistory[fredId],
          monthAgo
        ),
        yearAgo: valueOnOrBefore(
          curveHistory[fredId],
          yearAgo
        )
      }))

      return rows
    },
    [
      curve,
      curveHistory,
      monthAgo,
      yearAgo
    ]
  )

  const series: ChartSeriesConfig[] = [
    {
      color: SERIES1,
      fredId: 'latest',
      label: curve?.date ? `Latest (${formatShortDate(curve.date)})` : 'Latest',
      shortLabel: 'Now'
    },
    {
      color: SERIES2,
      fredId: 'monthAgo',
      label: '1 month ago',
      shortLabel: '1M ago'
    },
    {
      color: SERIES3,
      fredId: 'yearAgo',
      label: '1 year ago',
      shortLabel: '1Y ago'
    }
  ]

  return (
    <YieldCurveChartStyled>
      <ChartCard
        description='Treasury yields by maturity today, a month ago and a year ago. A downward sloping segment is an inverted curve.'
        title='Yield curve'
      >
        <MarketChart
          data={data}
          series={series}
          xAxisKey='months'
          xIsNumeric
          xTickFormatter={value => tenorLabel(Number(value))}
          xTicks={isSmallScreen ? SMALL_SCREEN_TICKS : TENOR_TICKS}
          xTooltipFormatter={value => `${tenorLabel(Number(value))} maturity`}
        />
      </ChartCard>
    </YieldCurveChartStyled>
  )
}
