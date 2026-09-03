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
  SERIES3,
  SERIES4,
  SERIES5
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
  const dayAgo = daysAgoDate(1)
  const weekAgo = daysAgoDate(7)
  const monthAgo = daysAgoDate(31)
  const yearAgo = daysAgoDate(366)

  const data = useMemo(
    () => {
      const latestByFredId: Record<string, number | null> = {}

      curve?.points?.forEach(({ fredId, value }) => { latestByFredId[fredId] = value })

      /* The API resolves the day and week offsets onto real trading days, so prefer them
         over a local lookup; fall back to the history series when they are absent. */
      const comparisonByKey: Record<string, Record<string, number | null>> = {}

      curve?.comparisons?.forEach(({ key, points }) => {
        const values: Record<string, number | null> = {}

        points.forEach(({ fredId, value }) => { values[fredId] = value })

        comparisonByKey[key] = values
      })

      const rows: ChartRow[] = CURVE_IDS.map(fredId => ({
        fredId,
        months: TENOR_MONTHS[fredId],
        latest: latestByFredId[fredId] ?? curveHistory[fredId]?.latest?.value ?? null,
        dayAgo: comparisonByKey.dayAgo?.[fredId] ?? valueOnOrBefore(
          curveHistory[fredId],
          dayAgo
        ),
        weekAgo: comparisonByKey.weekAgo?.[fredId] ?? valueOnOrBefore(
          curveHistory[fredId],
          weekAgo
        ),
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
      dayAgo,
      weekAgo,
      monthAgo,
      yearAgo
    ]
  )

  const comparisonDate = (key: string): string | undefined =>
    curve?.comparisons?.find(comparison => comparison.key === key)?.date

  const series: ChartSeriesConfig[] = [
    {
      color: SERIES1,
      fredId: 'latest',
      label: curve?.date ? `Latest (${formatShortDate(curve.date)})` : 'Latest',
      shortLabel: 'Now'
    },
    {
      color: SERIES4,
      fredId: 'dayAgo',
      label: comparisonDate('dayAgo')
        ? `1 day ago (${formatShortDate(comparisonDate('dayAgo') as string)})`
        : '1 day ago',
      shortLabel: '1D ago'
    },
    {
      color: SERIES5,
      fredId: 'weekAgo',
      label: comparisonDate('weekAgo')
        ? `1 week ago (${formatShortDate(comparisonDate('weekAgo') as string)})`
        : '1 week ago',
      shortLabel: '1W ago'
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
        description='Treasury yields by maturity today and at four earlier points. A downward sloping segment is an inverted curve.'
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
