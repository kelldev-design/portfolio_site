import {
  type ChangeEventHandler,
  type FunctionComponent,
  type ReactElement
} from 'react'
import styled from 'styled-components'
import { InputCustomStyles } from './InputCustomStyles'

const InputCustomStyled = styled.div`${InputCustomStyles}`

interface InputCustomPropsType {
  autoComplete?: string
  error?: string
  id: string
  /** Hides the label visually, for rows under a shared heading. Screen readers still read it. */
  isLabelHidden?: boolean
  label: string
  onChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
  placeholder?: string
  rows?: number
  type?: string
  value: string
}

export const InputCustom: FunctionComponent<InputCustomPropsType> = ({
  autoComplete,
  error,
  id,
  isLabelHidden,
  label,
  onChange,
  placeholder,
  rows,
  type,
  value
}) => {
  const renderField = (): ReactElement => {
    if (rows) {
      return (
        <textarea
          className='input-field'
          id={id}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          value={value}
        />
      )
    }

    return (
      <input
        autoComplete={autoComplete}
        className='input-field'
        id={id}
        onChange={onChange}
        placeholder={placeholder}
        type={type ?? 'text'}
        value={value}
      />
    )
  }

  return (
    <InputCustomStyled>
      <label
        className={isLabelHidden ? 'input-label-hidden' : 'input-label'}
        htmlFor={id}
      >
        { label }
      </label>
      { renderField() }
      { error && <span className='input-error'>{ error }</span> }
    </InputCustomStyled>
  )
}
