import { type FunctionComponent } from 'react'
import styled from 'styled-components'
import {
  RANGE_OPTIONS,
  type RangeKey
} from './marketsConfig'
import { RangeSelectorStyles } from './RangeSelectorStyles'

const RangeSelectorStyled = styled.div`${RangeSelectorStyles}`

interface RangeSelectorProps {
  onChange: (range: RangeKey) => void
  range: RangeKey
}

export const RangeSelector: FunctionComponent<RangeSelectorProps> = ({
  onChange,
  range
}) =>
  <RangeSelectorStyled>
    <span className='range-label'>Range</span>
    { RANGE_OPTIONS.map(({ key, label }) => (
      <button
        aria-pressed={key === range}
        className={`range-button${key === range ? ' range-button--active' : ''}`}
        key={key}
        onClick={() => { onChange(key) }}
        title={`Show the last ${label}`}
        type='button'
      >
        { label }
      </button>
    )) }
  </RangeSelectorStyled>
