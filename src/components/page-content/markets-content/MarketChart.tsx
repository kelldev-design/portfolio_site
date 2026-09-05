import {
  type FunctionComponent,
  type ReactElement,
  useMemo,
  useState
} from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import styled from 'styled-components'
import { MarketChartStyles } from './MarketChartStyles'
import {
  formatShortDate,
  formatValue
} from './marketsConfig'
import {
  type ChartRow,
  type ChartSeriesConfig
} from '../../../types/marketTypes'
import {
  CHART_BAND,
  CHART_GRID,
  GREY2,
  GREY3
} from '../../../utils/constants/colors'
import { useIsSmallScreen } from '../../hooks/useIsSmallScreen'

const MarketChartStyled = styled.div`${MarketChartStyles}`

export interface BandConfig {
  color: string
  dataKey: string
  label: string
}

export interface TrailStep {
  color: string
  dataKey: string
  date: string
}

/* A single legend entry standing for many dated lines of the same series, each
   drawn in its own colour along a ramp from the oldest day to the newest. */
export interface TrailConfig {
  label: string
  steps: TrailStep[]
}

interface MarketChartProps {
  band?: BandConfig
  data: ChartRow[]
  height?: number
  series: ChartSeriesConfig[]
  shadeBelowZero?: boolean
  showZeroLine?: boolean
  toggleableSeries?: boolean
  trail?: TrailConfig
  valueDigits?: number
  valueSuffix?: string
  xAxisKey: string
  xIsNumeric?: boolean
  xTickFormatter: (value: string | number) => string
  xTicks?: number[]
  xTooltipFormatter: (value: string | number) => string
}

interface TooltipPayloadItem {
  dataKey?: string | number
  value?: number | number[]
}

interface ChartTooltipProps {
  active?: boolean
  band?: BandConfig
  isTrailShown?: boolean
  label?: string | number
  payload?: TooltipPayloadItem[]
  series?: ChartSeriesConfig[]
  trail?: TrailConfig
  valueDigits?: number
  valueSuffix?: string
  xTooltipFormatter?: (value: string | number) => string
}

interface EndLabelProps {
  color?: string
  index?: number
  lastIndex?: number
  text?: string
  viewBox?: { x?: number, y?: number }
  x?: number
  y?: number
}

const toNumber = (value: number | string | null | undefined): number | null =>
  typeof value === 'number' && !isNaN(value) ? value : null

const ChartTooltip: FunctionComponent<ChartTooltipProps> = ({
  active,
  band,
  isTrailShown,
  label,
  payload,
  series = [],
  trail,
  valueDigits = 2,
  valueSuffix = '%',
  xTooltipFormatter
}) => {
  if (!active || !payload?.length) return null

  const valueByKey: Record<string, number | number[]> = {}

  payload.forEach(item => {
    if (item.dataKey !== undefined && item.value !== undefined) valueByKey[String(item.dataKey)] = item.value
  })

  const bandValue = band ? valueByKey[band.dataKey] : undefined

  /* Thirty rows would swamp the tooltip, so the trail is represented by its two ends. */
  const trailEnds = isTrailShown && trail?.steps.length
    ? [
      trail.steps[trail.steps.length - 1],
      trail.steps[0]
    ].slice(
      0,
      trail.steps.length
    )
    : []

  return (
    <div className='chart-tooltip'>
      <div className='chart-tooltip-date'>
        { xTooltipFormatter && label !== undefined ? xTooltipFormatter(label) : label }
      </div>
      { band && Array.isArray(bandValue) && (
        <div className='chart-tooltip-row'>
          <span
            className='chart-tooltip-swatch'
            style={{ backgroundColor: band.color }}
          />
          <span>{ band.label }</span>
          <span className='chart-tooltip-value'>
            { `${formatValue(
              bandValue[0],
              valueDigits
            )}–${formatValue(
              bandValue[1],
              valueDigits
            )}${valueSuffix}` }
          </span>
        </div>
      ) }
      { trailEnds.map(({ color, dataKey, date }) => {
        const value = valueByKey[dataKey]

        if (Array.isArray(value)) return null

        return (
          <div
            className='chart-tooltip-row'
            key={dataKey}
          >
            <span
              className='chart-tooltip-swatch'
              style={{ backgroundColor: color }}
            />
            <span>{ formatShortDate(date) }</span>
            <span className='chart-tooltip-value'>
              { `${formatValue(
                value,
                valueDigits
              )}${valueSuffix}` }
            </span>
          </div>
        )
      }) }
      { series.map(({ color, fredId, label: seriesLabel }) => {
        const value = valueByKey[fredId]

        if (Array.isArray(value)) return null

        return (
          <div
            className='chart-tooltip-row'
            key={fredId}
          >
            <span
              className='chart-tooltip-swatch'
              style={{ backgroundColor: color }}
            />
            <span>{ seriesLabel }</span>
            <span className='chart-tooltip-value'>
              { `${formatValue(
                value,
                valueDigits
              )}${valueSuffix}` }
            </span>
          </div>
        )
      }) }
    </div>
  )
}

/* Direct end-of-line label: ink text plus a small colour swatch, drawn on the last point only. */
const EndLabel: FunctionComponent<EndLabelProps> = ({
  color,
  index,
  lastIndex,
  text,
  viewBox,
  x,
  y
}) => {
  if (index !== lastIndex) return null

  const pointX = x ?? viewBox?.x ?? 0
  const pointY = y ?? viewBox?.y ?? 0

  return (
    <g>
      <rect
        fill={color}
        height={3}
        rx={1.5}
        width={10}
        x={pointX + 5}
        y={pointY - 1.5}
      />
      <text
        dy={4}
        fill={GREY2}
        fontSize={11}
        x={pointX + 19}
        y={pointY}
      >
        { text }
      </text>
    </g>
  )
}

export const MarketChart: FunctionComponent<MarketChartProps> = ({
  band,
  data,
  height,
  series,
  shadeBelowZero,
  showZeroLine,
  toggleableSeries,
  trail,
  valueDigits = 2,
  valueSuffix = '%',
  xAxisKey,
  xIsNumeric,
  xTickFormatter,
  xTicks,
  xTooltipFormatter
}) => {
  const isSmallScreen = useIsSmallScreen()
  const chartHeight = height ?? (isSmallScreen ? 240 : 320)
  const [ hiddenKeys, setHiddenKeys ] = useState<Record<string, boolean>>({})
  const [ isTrailShown, setIsTrailShown ] = useState(false)

  /* Only the drawn series feed the lines, labels, tooltip and domain; the legend keeps
     every entry so a hidden one can be switched back on. */
  const drawnSeries = useMemo(
    () => (toggleableSeries ? series.filter(({ fredId }) => !hiddenKeys[fredId]) : series),
    [
      hiddenKeys,
      series,
      toggleableSeries
    ]
  )

  const toggleSeries = (fredId: string): void => {
    setHiddenKeys(hidden => ({
      ...hidden,
      [fredId]: !hidden[fredId]
    }))

    /* The trail is the same curve drawn day by day, so bringing a dated line back
       switches it off rather than stacking the two readings of the same data. */
    if (hiddenKeys[fredId]) setIsTrailShown(false)
  }

  const trailOldestColor = trail?.steps[0]?.color ?? GREY3
  const trailNewestColor = trail?.steps[trail.steps.length - 1]?.color ?? GREY3

  const toggleTrail = (): void => {
    const isShown = !isTrailShown

    setIsTrailShown(isShown)

    if (isShown) {
      setHiddenKeys(Object.fromEntries(series.map(({ fredId }) => [ fredId, true ])))
    }
  }

  /* The gutter has to fit the longest direct end-of-line label, swatch included. */
  const longestLabel = drawnSeries.reduce(
    (
      longest,
      { label, shortLabel }
    ) => Math.max(
      longest,
      (shortLabel ?? label).length
    ),
    0
  )
  const rightMargin = Math.min(
    100,
    Math.max(
      40,
      Math.round(longestLabel * 6.4) + 26
    )
  )

  const lastIndexByKey = useMemo(
    () => {
      const lastIndexes: Record<string, number> = {}

      drawnSeries.forEach(({ fredId }) => {
        lastIndexes[fredId] = -1

        data.forEach((
          row,
          rowIndex
        ) => {
          if (toNumber(row[fredId] as number | string | null) !== null) lastIndexes[fredId] = rowIndex
        })
      })

      return lastIndexes
    },
    [ data, drawnSeries ]
  )

  const minValue = useMemo(
    () => {
      const values: number[] = []

      data.forEach(row => {
        drawnSeries.forEach(({ fredId }) => {
          const value = toNumber(row[fredId] as number | string | null)

          if (value !== null) values.push(value)
        })
      })

      return values.length ? Math.min(...values) : 0
    },
    [ data, drawnSeries ]
  )

  /* Toggleable legends swap the plain swatch for a checkbox that draws or hides the line. */
  const renderLegendEntry = ({
    color,
    fredId,
    label
  }: ChartSeriesConfig): ReactElement => {
    if (!toggleableSeries) {
      return (
        <>
          <span
            className='chart-legend-swatch'
            style={{ backgroundColor: color }}
          />
          { label }
        </>
      )
    }

    return (
      <label className={`chart-legend-toggle${hiddenKeys[fredId] ? ' chart-legend-toggle--off' : ''}`}>
        <input
          checked={!hiddenKeys[fredId]}
          className='chart-legend-checkbox'
          onChange={() => { toggleSeries(fredId) }}
          style={{ accentColor: color }}
          type='checkbox'
        />
        <span
          className='chart-legend-swatch'
          style={{ backgroundColor: color }}
        />
        { label }
      </label>
    )
  }

  const renderLegend = (): ReactElement =>
    <ul className='chart-legend'>
      { band && (
        <li
          className='chart-legend-item'
          key={band.dataKey}
        >
          <span
            className='chart-legend-swatch chart-legend-swatch--band'
            style={{ backgroundColor: band.color }}
          />
          { band.label }
        </li>
      ) }
      { series.map(seriesConfig => (
        <li
          className='chart-legend-item'
          key={seriesConfig.fredId}
        >
          { renderLegendEntry(seriesConfig) }
        </li>
      )) }
      { trail && toggleableSeries && (
        <li
          className='chart-legend-item'
          key='trail'
        >
          <label className={`chart-legend-toggle${isTrailShown ? '' : ' chart-legend-toggle--off'}`}>
            <input
              checked={isTrailShown}
              className='chart-legend-checkbox'
              onChange={toggleTrail}
              style={{ accentColor: trailNewestColor }}
              type='checkbox'
            />
            <span
              className='chart-legend-swatch chart-legend-swatch--trail'
              style={{ backgroundImage: `linear-gradient(to right, ${trailOldestColor}, ${trailNewestColor})` }}
            />
            { trail.label }
          </label>
        </li>
      ) }
    </ul>

  return (
    <MarketChartStyled>
      { renderLegend() }
      <div className='chart-canvas'>
        <ResponsiveContainer
          height={chartHeight}
          width='100%'
        >
          <ComposedChart
            data={data}
            margin={{
              top: 10,
              right: rightMargin,
              bottom: 0,
              left: 0
            }}
          >
            <CartesianGrid
              stroke={CHART_GRID}
              strokeWidth={1}
              vertical={false}
            />
            <XAxis
              axisLine={{ stroke: CHART_GRID }}
              dataKey={xAxisKey}
              domain={xIsNumeric ? [ 1, 360 ] : undefined}
              minTickGap={isSmallScreen ? 44 : 28}
              scale={xIsNumeric ? 'log' : 'auto'}
              tick={{ fill: GREY3, fontSize: 11 }}
              tickFormatter={xTickFormatter}
              tickLine={false}
              ticks={xTicks}
              type={xIsNumeric ? 'number' : 'category'}
            />
            <YAxis
              axisLine={false}
              domain={[
                (dataMin: number) => Number((dataMin - 0.15).toFixed(2)),
                (dataMax: number) => Number((dataMax + 0.15).toFixed(2))
              ]}
              tick={{ fill: GREY3, fontSize: 11 }}
              tickFormatter={value => `${Number(value).toFixed(1)}${valueSuffix}`}
              tickLine={false}
              width={isSmallScreen ? 42 : 52}
            />
            <Tooltip
              content={
                <ChartTooltip
                  band={band}
                  isTrailShown={isTrailShown}
                  series={drawnSeries}
                  trail={trail}
                  valueDigits={valueDigits}
                  valueSuffix={valueSuffix}
                  xTooltipFormatter={xTooltipFormatter}
                />
              }
              cursor={{
                stroke: GREY3,
                strokeDasharray: '3 3',
                strokeWidth: 1
              }}
            />
            { shadeBelowZero && (
              <ReferenceArea
                fill={CHART_BAND}
                fillOpacity={1}
                ifOverflow='extendDomain'
                stroke='none'
                y1={Math.min(
                  minValue - 0.15,
                  0
                )}
                y2={0}
              />
            ) }
            { showZeroLine && (
              <ReferenceLine
                stroke={GREY3}
                strokeWidth={1}
                y={0}
              />
            ) }
            { band && (
              <Area
                connectNulls
                dataKey={band.dataKey}
                fill={band.color}
                fillOpacity={1}
                isAnimationActive={false}
                stroke='none'
              />
            ) }
            { isTrailShown && trail?.steps.map(({ color, dataKey }) => (
              <Line
                activeDot={false}
                connectNulls
                dataKey={dataKey}
                dot={false}
                isAnimationActive={false}
                key={dataKey}
                stroke={color}
                strokeWidth={1.5}
                type='monotone'
              />
            )) }
            { drawnSeries.map(({
              color,
              fredId,
              label,
              shortLabel
            }) => (
              <Line
                activeDot={{
                  fill: color,
                  r: 4,
                  stroke: '#fff',
                  strokeWidth: 2
                }}
                connectNulls
                dataKey={fredId}
                dot={false}
                isAnimationActive={false}
                key={fredId}
                stroke={color}
                strokeWidth={2}
                type='monotone'
              >
                <LabelList
                  content={
                    <EndLabel
                      color={color}
                      lastIndex={lastIndexByKey[fredId]}
                      text={shortLabel ?? label}
                    />
                  }
                  dataKey={fredId}
                />
              </Line>
            )) }
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </MarketChartStyled>
  )
}
