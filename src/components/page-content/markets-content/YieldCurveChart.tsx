import { type FunctionComponent, useMemo } from 'react'
import styled from 'styled-components'
import { ChartCard } from './ChartCard'
import {
  MarketChart,
  type TrailConfig
} from './MarketChart'
import {
  CURVE_IDS,
  daysAgoDate,
  formatShortDate,
  mixHexColors,
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

const TRAIL_DAYS = 30
const TRAIL_WEEKS = 6

/* The oldest day is drawn warm and the most recent cool, so the curve's drift over the
   window reads as a direction rather than a tangle. */
const TRAIL_OLDEST_COLOR = SERIES2
const TRAIL_NEWEST_COLOR = SERIES1

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
  const trailFrom = daysAgoDate(TRAIL_DAYS)

  /* One line per day the Treasury actually published in the window, oldest first. */
  const trailDates = useMemo(
    () => {
      const dates = new Set<string>()

      CURVE_IDS.forEach(fredId => {
        curveHistory[fredId]?.observations?.forEach(({ date }) => {
          if (date >= trailFrom) dates.add(date)
        })
      })

      return Array.from(dates).sort()
    },
    [ curveHistory, trailFrom ]
  )

  /* Weekly readings are taken at seven day strides and resolved backwards onto the
     last trading day on or before each stride, so a holiday never drops a line. */
  const weekTrailDates = useMemo(
    () => Array.from(
      { length: TRAIL_WEEKS },
      (
        _,
        index
      ) => daysAgoDate((TRAIL_WEEKS - 1 - index) * 7)
    ),
    []
  )

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

      const rows: ChartRow[] = CURVE_IDS.map(fredId => {
        const row: ChartRow = {
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
        }

        trailDates.forEach((
          date,
          index
        ) => {
          row[`trail${index}`] = valueOnOrBefore(
            curveHistory[fredId],
            date
          )
        })

        weekTrailDates.forEach((
          date,
          index
        ) => {
          row[`weekTrail${index}`] = valueOnOrBefore(
            curveHistory[fredId],
            date
          )
        })

        return row
      })

      return rows
    },
    [
      curve,
      curveHistory,
      dayAgo,
      weekAgo,
      monthAgo,
      trailDates,
      weekTrailDates,
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

  const buildTrail = (
    key: string,
    label: string,
    dates: string[]
  ): TrailConfig => ({
    key,
    label,
    steps: dates.map((
      date,
      index
    ) => ({
      color: mixHexColors(
        TRAIL_OLDEST_COLOR,
        TRAIL_NEWEST_COLOR,
        dates.length > 1 ? index / (dates.length - 1) : 1
      ),
      dataKey: `${key}${index}`,
      date
    }))
  })

  const trails: TrailConfig[] = [
    buildTrail(
      'trail',
      `Last ${TRAIL_DAYS} days`,
      trailDates
    ),
    buildTrail(
      'weekTrail',
      `Last ${TRAIL_WEEKS} weeks`,
      weekTrailDates
    )
  ]

  return (
    <YieldCurveChartStyled>
      <ChartCard
        description='Treasury yields by maturity today and at four earlier points, or as a trail of the last 30 days or 6 weeks. A downward sloping segment is an inverted curve.'
        title='Yield curve'
      >
        <MarketChart
          data={data}
          series={series}
          toggleableSeries
          trails={trails}
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
