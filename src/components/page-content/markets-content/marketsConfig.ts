import {
  type ChartRow,
  type ChartSeriesConfig,
  type MarketSeries,
  type MarketSeriesMap
} from '../../../types/marketTypes'
import {
  SERIES1,
  SERIES2,
  SERIES3,
  SERIES4
} from '../../../utils/constants/colors'

export type RangeKey = '1M' | '6M' | '1Y' | '5Y' | 'MAX'

export interface RangeOption {
  days: number | null
  key: RangeKey
  label: string
}

export const RANGE_OPTIONS: RangeOption[] = [
  {
    days: 31,
    key: '1M',
    label: '1M'
  },
  {
    days: 183,
    key: '6M',
    label: '6M'
  },
  {
    days: 366,
    key: '1Y',
    label: '1Y'
  },
  {
    days: 1827,
    key: '5Y',
    label: '5Y'
  },
  {
    days: null,
    key: 'MAX',
    label: 'Max'
  }
]

export const DEFAULT_RANGE: RangeKey = '1Y'

export const CURVE_IDS = [
  'DGS1MO',
  'DGS3MO',
  'DGS6MO',
  'DGS1',
  'DGS2',
  'DGS3',
  'DGS5',
  'DGS7',
  'DGS10',
  'DGS20',
  'DGS30'
]

export const SPREAD_IDS = [
  'T10Y2Y',
  'T10Y3M',
  'SPREAD_5S30S'
]

export const INFLATION_IDS = [
  'T5YIE',
  'T10YIE',
  'T5YIFR',
  'DFII5',
  'DFII10',
  'DFII30'
]

export const POLICY_IDS = [
  'DFEDTARU',
  'DFEDTARL',
  'EFFR',
  'SOFR'
]

export const MARKET_IDS = [
  ...CURVE_IDS,
  ...SPREAD_IDS,
  ...INFLATION_IDS,
  ...POLICY_IDS
]

/* Maturity in months, used to place a tenor on the yield curve x axis. */
export const TENOR_MONTHS: Record<string, number> = {
  DGS1MO: 1,
  DGS3MO: 3,
  DGS6MO: 6,
  DGS1: 12,
  DGS2: 24,
  DGS3: 36,
  DGS5: 60,
  DGS7: 84,
  DGS10: 120,
  DGS20: 240,
  DGS30: 360
}

export const TENOR_TICKS = CURVE_IDS.map(fredId => TENOR_MONTHS[fredId])

export const FALLBACK_LABELS: Record<string, string> = {
  DGS1MO: '1M',
  DGS3MO: '3M',
  DGS6MO: '6M',
  DGS1: '1Y',
  DGS2: '2Y',
  DGS3: '3Y',
  DGS5: '5Y',
  DGS7: '7Y',
  DGS10: '10Y',
  DGS20: '20Y',
  DGS30: '30Y',
  T10Y2Y: '2s10s',
  T10Y3M: '3m10y',
  SPREAD_5S30S: '5s30s',
  T5YIE: '5Y breakeven',
  T10YIE: '10Y breakeven',
  T5YIFR: '5y5y forward',
  DFII5: '5Y real',
  DFII10: '10Y real',
  DFII30: '30Y real',
  DFEDTARL: 'Fed funds target (lower)',
  DFEDTARU: 'Fed funds target (upper)',
  EFFR: 'EFFR',
  SOFR: 'SOFR'
}

/* Compact variants used for the direct end-of-line labels. */
export const SHORT_LABELS: Record<string, string> = {
  T5YIE: '5Y BE',
  T10YIE: '10Y BE',
  T5YIFR: '5y5y',
  DFII5: '5Y real',
  DFII10: '10Y real',
  DFII30: '30Y real'
}

/* Colour follows the entity: a given series keeps its slot in every range. */
export const SERIES_COLORS: Record<string, string> = {
  DGS3MO: SERIES1,
  DGS2: SERIES2,
  DGS10: SERIES3,
  DGS30: SERIES4,
  T10Y2Y: SERIES1,
  T10Y3M: SERIES2,
  SPREAD_5S30S: SERIES3,
  T10YIE: SERIES1,
  T5YIE: SERIES2,
  T5YIFR: SERIES3,
  DFII10: SERIES4,
  EFFR: SERIES1,
  SOFR: SERIES2
}

export const tenorLabel = (months: number): string => {
  if (months < 12) return `${months}M`

  return `${months / 12}Y`
}

export const toIsoDate = (date: Date): string => date.toISOString().slice(
  0,
  10
)

export const rangeFromDate = (range: RangeKey): string | undefined => {
  const option = RANGE_OPTIONS.find(({ key }) => key === range)

  if (!option?.days) return undefined

  const from = new Date()

  from.setDate(from.getDate() - option.days)

  return toIsoDate(from)
}

export const daysAgoDate = (days: number): string => {
  const from = new Date()

  from.setDate(from.getDate() - days)

  return toIsoDate(from)
}

export const seriesMapById = (seriesList: MarketSeries[]): MarketSeriesMap => {
  const map: MarketSeriesMap = {}

  seriesList.forEach(series => { map[series.fredId] = series })

  return map
}

export const seriesLabel = (
  fredId: string,
  series?: MarketSeries
): string => series?.label ?? FALLBACK_LABELS[fredId] ?? fredId

export const buildSeriesConfigs = (
  fredIds: string[],
  seriesMap: MarketSeriesMap
): ChartSeriesConfig[] => fredIds.map(fredId => ({
  color: SERIES_COLORS[fredId],
  fredId,
  label: seriesLabel(
    fredId,
    seriesMap[fredId]
  ),
  shortLabel: SHORT_LABELS[fredId] ?? FALLBACK_LABELS[fredId] ?? fredId
}))

/* Merges several series into one row per date so a shared tooltip can read them all. */
export const buildChartRows = (
  fredIds: string[],
  seriesMap: MarketSeriesMap
): ChartRow[] => {
  const rowsByDate: Record<string, ChartRow> = {}

  fredIds.forEach(fredId => {
    seriesMap[fredId]?.observations?.forEach(({ date, value }) => {
      const row = rowsByDate[date] ?? { date }

      row[fredId] = value
      rowsByDate[date] = row
    })
  })

  return Object.values(rowsByDate).sort((a, b) => String(a.date).localeCompare(String(b.date)))
}

export const formatValue = (
  value: number | null | undefined,
  digits = 2
): string => {
  if (typeof value !== 'number' || isNaN(value)) return '--'

  return value.toFixed(digits)
}

export const formatSignedValue = (value: number): string => `${value > 0 ? '+' : ''}${value.toFixed(2)}`

export const formatShortDate = (isoDate: string): string => {
  const [ year, month, day ] = isoDate.split('-')
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ]

  return `${months[Number(month) - 1]} ${Number(day)} ${year}`
}

export const formatAxisDate = (
  isoDate: string,
  showDay: boolean
): string => {
  const short = formatShortDate(isoDate)
  const [ month, day, year ] = short.split(' ')

  return showDay ? `${month} ${day}` : `${month} ${year.slice(2)}`
}

/* Indicators read fixed history windows -- a 200 day average and a one month
   change must not change meaning when the range selector moves. */
export const INDICATOR_HISTORY_DAYS = 400

export const INDICATOR_IDS = [
  'DGS10',
  'DGS30',
  'BAMLH0A0HYM2',
  'SP500'
]
