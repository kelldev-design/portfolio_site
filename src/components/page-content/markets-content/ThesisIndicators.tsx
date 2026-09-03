import { type FunctionComponent } from 'react'
import styled from 'styled-components'
import { ThesisIndicatorsStyles } from './ThesisIndicatorsStyles'
import {
  type MarketSeries,
  type MarketSeriesMap
} from '../../../types/marketTypes'
import {
  STATUS_BAD,
  STATUS_GOOD,
  STATUS_WARN
} from '../../../utils/constants/colors'

const ThesisIndicatorsStyled = styled.div`${ThesisIndicatorsStyles}`

/* Red = the condition is met, which supports the bearish case. Green = it is
   contradicted. Amber = neither. Each tile carries the status as a word as well as a
   colour, so the reading never depends on colour alone. */
type Status = 'bad' | 'warn' | 'good'

const STATUS_META: Record<Status, { color: string; label: string }> = {
  bad: {
    color: STATUS_BAD,
    label: 'Confirming'
  },
  warn: {
    color: STATUS_WARN,
    label: 'Mixed'
  },
  good: {
    color: STATUS_GOOD,
    label: 'Contradicting'
  }
}

interface Indicator {
  key: string
  label: string
  value: string
  detail: string
  status: Status
}

const latestValue = (series?: MarketSeries): number | null =>
  typeof series?.latest?.value === 'number' ? series.latest.value : null

/* Most recent observation on or before a cutoff, so weekends and holidays fall back to
   the previous session rather than returning nothing. */
const valueOnOrBefore = (series: MarketSeries | undefined, isoDate: string): number | null => {
  if (!series?.observations?.length) return null

  let match: number | null = null

  series.observations.forEach(({ date, value }) => {
    if (date <= isoDate && typeof value === 'number') match = value
  })

  return match
}

const movingAverage = (series: MarketSeries | undefined, days: number): number | null => {
  const values = (series?.observations ?? [])
    .filter(({ value }) => typeof value === 'number')
    .slice(-days)

  if (values.length < days / 2) return null

  return values.reduce((total, { value }) => total + value, 0) / values.length
}

const daysAgoIso = (days: number): string => {
  const date = new Date()

  date.setDate(date.getDate() - days)

  return date.toISOString().slice(0, 10)
}

/* Threshold bands. Each level is the user's own trigger, kept in one place so they are
   easy to retune as the thesis changes. */
const TEN_YEAR_CONFIRM = 5
const TEN_YEAR_REJECT = 4.6
const THIRTY_YEAR_CONFIRM = 5.5
const THIRTY_YEAR_REJECT = 5.1
/* Credit is a change, not a level: high yield OAS versus one month ago, in percentage
   points. Widening is the signal; a calm or tightening spread argues against. */
const CREDIT_CONFIRM = 0.5
const CREDIT_REJECT = 0.1
const CREDIT_LOOKBACK_DAYS = 31
/* An index more than this far above its 200 day average is a healthy trend. */
const EQUITY_REJECT_MARGIN = 0.02

const buildIndicators = (seriesMap: MarketSeriesMap): Indicator[] => {
  const indicators: Indicator[] = []

  const tenYear = latestValue(seriesMap.DGS10)

  if (tenYear !== null) {
    indicators.push({
      key: 'DGS10',
      label: '10Y Treasury',
      value: `${tenYear.toFixed(2)}%`,
      detail: `Confirms above ${TEN_YEAR_CONFIRM.toFixed(2)}%, rejects below ${TEN_YEAR_REJECT.toFixed(2)}%`,
      status: tenYear > TEN_YEAR_CONFIRM ? 'bad' : tenYear < TEN_YEAR_REJECT ? 'good' : 'warn'
    })
  }

  const thirtyYear = latestValue(seriesMap.DGS30)

  if (thirtyYear !== null) {
    indicators.push({
      key: 'DGS30',
      label: '30Y Treasury',
      value: `${thirtyYear.toFixed(2)}%`,
      detail: `Confirms above ${THIRTY_YEAR_CONFIRM.toFixed(2)}%, rejects below ${THIRTY_YEAR_REJECT.toFixed(2)}%`,
      status: thirtyYear > THIRTY_YEAR_CONFIRM ? 'bad' : thirtyYear < THIRTY_YEAR_REJECT ? 'good' : 'warn'
    })
  }

  const credit = seriesMap.BAMLH0A0HYM2
  const creditNow = latestValue(credit)
  const creditThen = valueOnOrBefore(
    credit,
    daysAgoIso(CREDIT_LOOKBACK_DAYS)
  )

  if (creditNow !== null && creditThen !== null) {
    const change = creditNow - creditThen
    const basisPoints = Math.round(change * 100)

    indicators.push({
      key: 'BAMLH0A0HYM2',
      label: 'Credit spreads (HY OAS)',
      value: `${creditNow.toFixed(2)}%`,
      detail: `${basisPoints >= 0 ? '+' : ''}${basisPoints}bp over 1 month — confirms at +${Math.round(CREDIT_CONFIRM * 100)}bp`,
      status: change >= CREDIT_CONFIRM ? 'bad' : change <= CREDIT_REJECT ? 'good' : 'warn'
    })
  }

  const equity = seriesMap.SP500
  const equityNow = latestValue(equity)
  const equityAverage = movingAverage(
    equity,
    200
  )

  if (equityNow !== null && equityAverage !== null) {
    const margin = equityNow / equityAverage - 1

    indicators.push({
      key: 'SP500',
      label: 'S&P 500 trend',
      value: equityNow.toLocaleString(
        'en-US',
        { maximumFractionDigits: 0 }
      ),
      detail: `${(margin * 100).toFixed(1)}% vs 200 day average — confirms below it`,
      status: margin < 0 ? 'bad' : margin > EQUITY_REJECT_MARGIN ? 'good' : 'warn'
    })
  }

  return indicators
}

interface ThesisIndicatorsProps {
  seriesMap: MarketSeriesMap
}

export const ThesisIndicators: FunctionComponent<ThesisIndicatorsProps> = ({ seriesMap }) => {
  const indicators = buildIndicators(seriesMap)

  if (!indicators.length) return null

  return (
    <ThesisIndicatorsStyled>
      <div className='thesis-indicators'>
        { indicators.map(({ key, label, value, detail, status }) => {
          const meta = STATUS_META[status]

          return (
            <div
              className='thesis-indicator'
              key={key}
            >
              <div className='thesis-indicator__head'>
                <span
                  className='thesis-indicator__dot'
                  style={{ backgroundColor: meta.color }}
                />
                <span
                  className='thesis-indicator__status'
                  style={{ color: meta.color }}
                >
                  { meta.label }
                </span>
              </div>
              <span className='thesis-indicator__label'>{ label }</span>
              <span className='thesis-indicator__value'>{ value }</span>
              <span className='thesis-indicator__detail'>{ detail }</span>
            </div>
          )
        }) }
      </div>
      <p className='thesis-indicators__note'>
        Equity breadth is not shown — FRED publishes no advance/decline or
        percent-above-average series.
      </p>
    </ThesisIndicatorsStyled>
  )
}
