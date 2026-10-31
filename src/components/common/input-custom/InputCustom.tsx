import {
  type ChangeEventHandler,
  type FunctionComponent,
  type HTMLAttributes,
  type ReactElement
} from 'react'
import styled from 'styled-components'
import { InputCustomStyles } from './InputCustomStyles'

const InputCustomStyled = styled.div`${InputCustomStyles}`

interface InputCustomPropsType {
  autoCapitalize?: string
  autoComplete?: string
  autoCorrect?: string
  error?: string
  id: string
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode']
  /** Hides the label visually, for rows under a shared heading. Screen readers still read it. */
  isLabelHidden?: boolean
  label: string
  onChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
  placeholder?: string
  rows?: number
  spellCheck?: boolean
  type?: string
  value: string
}

export const InputCustom: FunctionComponent<InputCustomPropsType> = ({
  autoCapitalize,
  autoComplete,
  autoCorrect,
  error,
  id,
  inputMode,
  isLabelHidden,
  label,
  onChange,
  placeholder,
  rows,
  spellCheck,
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
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        autoCorrect={autoCorrect}
        className='input-field'
        id={id}
        inputMode={inputMode}
        onChange={onChange}
        placeholder={placeholder}
        spellCheck={spellCheck}
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
