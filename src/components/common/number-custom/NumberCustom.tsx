import {
  type ChangeEventHandler,
  type FunctionComponent
} from 'react'
import styled from 'styled-components'
import { NumberCustomStyles } from './NumberCustomStyles'

const NumberCustomStyled = styled.div`${NumberCustomStyles}`

interface NumberCustomPropsType {
  error?: string
  id: string
  /** Hides the label visually, for fields under a shared heading. Screen readers still read it. */
  isLabelHidden?: boolean
  label: string
  max?: number
  min?: number
  onChange: ChangeEventHandler<HTMLInputElement>
  step?: number
  /** A string, so the field can hold what is being typed, such as a blank or a lone minus. */
  value: string
}

/* A number field with the browser's own up and down arrows, styled to match InputCustom. */
export const NumberCustom: FunctionComponent<NumberCustomPropsType> = ({
  error,
  id,
  isLabelHidden,
  label,
  max,
  min,
  onChange,
  step,
  value
}) =>
  <NumberCustomStyled>
    <label
      className={isLabelHidden ? 'number-label-hidden' : 'number-label'}
      htmlFor={id}
    >
      { label }
    </label>
    <input
      className='number-field'
      id={id}
      inputMode='decimal'
      max={max}
      min={min}
      onChange={onChange}
      step={step}
      type='number'
      value={value}
    />
    { error && <span className='number-error'>{ error }</span> }
  </NumberCustomStyled>
