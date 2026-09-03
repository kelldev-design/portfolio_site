export interface MarketObservation {
  date: string
  value: number
}

export interface MarketSeries {
  fredId: string
  label: string
  category: string
  unit: string
  observations: MarketObservation[]
  latest: MarketObservation | null
  previous: MarketObservation | null
}

export interface YieldCurvePoint {
  fredId: string
  label: string
  months: number | null
  value: number | null
}

export interface YieldCurveComparison {
  key: string
  label: string
  date: string
  points: YieldCurvePoint[]
}

export interface YieldCurve {
  date: string
  points: YieldCurvePoint[]
  comparisons: YieldCurveComparison[]
}

export interface MarketSeriesResponse {
  marketSeries: MarketSeries[]
}

export interface YieldCurveResponse {
  yieldCurve: YieldCurve
}

export type MarketSeriesMap = Record<string, MarketSeries>

export interface ChartSeriesConfig {
  color: string
  fredId: string
  label: string
  shortLabel?: string
}

export type ChartRow = Record<string, number | number[] | string | null>
