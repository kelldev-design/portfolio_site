import {
  type FunctionComponent,
  type ReactElement,
  useContext,
  useMemo,
  useState
} from 'react'
import { useQuery } from '@apollo/client'
import styled from 'styled-components'
import { ChartCard } from './ChartCard'
import { CurveSpreadsChart } from './CurveSpreadsChart'
import { InflationRatesChart } from './InflationRatesChart'
import { KeyTenorsChart } from './KeyTenorsChart'
import {
  CURVE_IDS,
  daysAgoDate,
  DEFAULT_RANGE,
  INDICATOR_HISTORY_DAYS,
  INDICATOR_IDS,
  MARKET_IDS,
  type RangeKey,
  rangeFromDate,
  seriesMapById
} from './marketsConfig'
import { MarketsContentStyles } from './MarketsContentStyles'
import { PolicyRatesChart } from './PolicyRatesChart'
import { RangeSelector } from './RangeSelector'
import { StatTiles } from './StatTiles'
import { ThesisIndicators } from './ThesisIndicators'
import { YieldCurveChart } from './YieldCurveChart'
import {
  GET_MARKET_SERIES,
  GET_YIELD_CURVE
} from '../../../queries/graphQL'
import {
  type MarketSeriesMap,
  type MarketSeriesResponse,
  type YieldCurveResponse
} from '../../../types/marketTypes'
import { LoadingContent } from '../../common/loading-content/LoadingContent'
import { TagH } from '../../common/tag-h/TagH'
import { TagP } from '../../common/tag-p/TagP'
import { Container } from '../../layout/container/Container'
import { PageRow } from '../../layout/page-row/PageRow'
import { Spacer } from '../../layout/spacer/Spacer'
import { PortfolioContext } from '../../wrappers/PortfolioContextProvider'

const MarketsContentStyled = styled.div`${MarketsContentStyles}`

/* The yield curve needs a year of history regardless of the selected range. */
const CURVE_HISTORY_DAYS = 400

const MarketsContent: FunctionComponent = () => {
  const { isNavigating } = useContext(PortfolioContext)
  const [ range, setRange ] = useState<RangeKey>(DEFAULT_RANGE)

  const from = useMemo(
    () => rangeFromDate(range),
    [ range ]
  )

  const curveFrom = useMemo(
    () => daysAgoDate(CURVE_HISTORY_DAYS),
    []
  )

  /* Indicators read a fixed window, not the selected range: a 200 day average and a
     one month change must mean the same thing whatever the range selector says. */
  const indicatorFrom = useMemo(
    () => daysAgoDate(INDICATOR_HISTORY_DAYS),
    []
  )

  const {
    data: marketData,
    error: marketError,
    loading: isMarketLoading
  } = useQuery(
    GET_MARKET_SERIES,
    { variables: { ids: MARKET_IDS, from } }
  )

  const { data: curveHistoryData } = useQuery(
    GET_MARKET_SERIES,
    { variables: { ids: CURVE_IDS, from: curveFrom } }
  )

  const { data: indicatorData } = useQuery(
    GET_MARKET_SERIES,
    { variables: { ids: INDICATOR_IDS, from: indicatorFrom } }
  )

  const { data: yieldCurveData } = useQuery(GET_YIELD_CURVE)

  const seriesMap: MarketSeriesMap = useMemo(
    () => seriesMapById((marketData as MarketSeriesResponse | undefined)?.marketSeries ?? []),
    [ marketData ]
  )

  const curveHistoryMap: MarketSeriesMap = useMemo(
    () => seriesMapById((curveHistoryData as MarketSeriesResponse | undefined)?.marketSeries ?? []),
    [ curveHistoryData ]
  )

  const indicatorMap: MarketSeriesMap = useMemo(
    () => seriesMapById((indicatorData as MarketSeriesResponse | undefined)?.marketSeries ?? []),
    [ indicatorData ]
  )

  const yieldCurve = (yieldCurveData as YieldCurveResponse | undefined)?.yieldCurve

  const renderCard = (children: ReactElement): ReactElement =>
    <ChartCard>
      { children }
    </ChartCard>

  const renderIntro = (): ReactElement => renderCard(
    <>
      <Spacer
        b={2}
        l={0}
        r={0}
        t={0}
      >
        <TagH size={2}>
          Markets
        </TagH>
      </Spacer>
      <TagP>
        US Treasury yields, curve spreads, inflation expectations and Fed policy rates, pulled from FRED.
      </TagP>
      <p className='markets-note'>
        Yields are quoted in percent, spreads in percentage points. Series update on business days.
      </p>
    </>
  )

  const renderError = (): ReactElement => renderCard(
    <>
      <Spacer
        b={2}
        l={0}
        r={0}
        t={0}
      >
        <TagH size={2}>
          Market data unavailable
        </TagH>
      </Spacer>
      <TagP>
        The market data service did not respond. Please try again in a moment.
      </TagP>
    </>
  )

  const renderControls = (): ReactElement => renderCard(
    <div className='markets-controls'>
      <RangeSelector
        onChange={setRange}
        range={range}
      />
    </div>
  )

  const renderSection = (section: ReactElement): ReactElement =>
    <Spacer
      b={2.5}
      l={0}
      r={0}
      t={0}
    >
      { section }
    </Spacer>

  const renderCharts = (): ReactElement =>
    <>
      { renderSection(renderCard(<ThesisIndicators seriesMap={indicatorMap} />)) }
      { renderSection(renderCard(<StatTiles seriesMap={seriesMap} />)) }
      { renderSection(
        <YieldCurveChart
          curve={yieldCurve}
          curveHistory={curveHistoryMap}
        />
      ) }
      { renderSection(renderControls()) }
      { renderSection(
        <KeyTenorsChart
          range={range}
          seriesMap={seriesMap}
        />
      ) }
      { renderSection(
        <CurveSpreadsChart
          range={range}
          seriesMap={seriesMap}
        />
      ) }
      { renderSection(
        <InflationRatesChart
          range={range}
          seriesMap={seriesMap}
        />
      ) }
      { renderSection(
        <PolicyRatesChart
          range={range}
          seriesMap={seriesMap}
        />
      ) }
    </>

  const renderBody = (): ReactElement => {
    if (marketError) return renderSection(renderError())

    if (isMarketLoading && !Object.keys(seriesMap).length) {
      return renderSection(renderCard(<LoadingContent backgroundColor='#fff' />))
    }

    return renderCharts()
  }

  const renderContent = (): ReactElement =>
    <Spacer
      l={2.5}
      r={2.5}
      t={0}
    >
      { renderSection(renderIntro()) }
      { renderBody() }
    </Spacer>

  return (
    <PageRow>
      <Container>
        <MarketsContentStyled className={`fade-in ${isNavigating ? 'fade-out' : ''}`}>
          { renderContent() }
        </MarketsContentStyled>
      </Container>
    </PageRow>
  )
}

export default MarketsContent
