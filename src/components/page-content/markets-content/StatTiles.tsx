import { type FunctionComponent } from 'react'
import styled from 'styled-components'
import {
  formatShortDate,
  formatSignedValue,
  formatValue,
  seriesLabel
} from './marketsConfig'
import { StatTilesStyles } from './StatTilesStyles'
import { type MarketSeriesMap } from '../../../types/marketTypes'

const StatTilesStyled = styled.div`${StatTilesStyles}`

interface StatTileConfig {
  fredId: string
  label: string
  unit: string
}

const STAT_TILES: StatTileConfig[] = [
  {
    fredId: 'DGS10',
    label: '10Y Treasury',
    unit: '%'
  },
  {
    fredId: 'T10Y2Y',
    label: '2s10s spread',
    unit: ' pp'
  },
  {
    fredId: 'T10YIE',
    label: '10Y breakeven',
    unit: '%'
  },
  {
    fredId: 'EFFR',
    label: 'EFFR',
    unit: '%'
  }
]

interface StatTilesProps {
  seriesMap: MarketSeriesMap
}

export const StatTiles: FunctionComponent<StatTilesProps> = ({ seriesMap }) =>
  <StatTilesStyled>
    { STAT_TILES.map(({ fredId, label, unit }) => {
      const series = seriesMap[fredId]
      const latest = series?.latest
      const previous = series?.previous
      const change = typeof latest?.value === 'number' && typeof previous?.value === 'number'
        ? latest.value - previous.value
        : null
      const arrow = change === null || change === 0
        ? '='
        : change > 0 ? '▲' : '▼'

      return (
        <div
          className='stat-tile'
          key={fredId}
        >
          <div className='stat-tile-label'>
            { label }
          </div>
          <div className='stat-tile-value'>
            { `${formatValue(latest?.value)}${unit}` }
          </div>
          <div className='stat-tile-change'>
            <span
              aria-hidden
              className='stat-tile-arrow'
            >
              { arrow }
            </span>
            { change === null
              ? 'no prior value'
              : `${formatSignedValue(change)}${unit} vs prior` }
          </div>
          <div className='stat-tile-date'>
            { latest?.date
              ? formatShortDate(latest.date)
              : seriesLabel(
                fredId,
                series
              ) }
          </div>
        </div>
      )
    }) }
  </StatTilesStyled>
