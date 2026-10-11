import {
  type ChangeEventHandler,
  type FunctionComponent
} from 'react'
import styled from 'styled-components'
import { CheckboxCustomStyles } from './CheckboxCustomStyles'

const CheckboxCustomStyled = styled.div`${CheckboxCustomStyles}`

interface CheckboxCustomPropsType {
  id: string
  isChecked: boolean
  label: string
  onChange: ChangeEventHandler<HTMLInputElement>
}

export const CheckboxCustom: FunctionComponent<CheckboxCustomPropsType> = ({
  id,
  isChecked,
  label,
  onChange
}) =>
  <CheckboxCustomStyled>
    <input
      checked={isChecked}
      className='checkbox-input'
      id={id}
      onChange={onChange}
      type='checkbox'
    />
    <label
      className='checkbox-label'
      htmlFor={id}
    >
      { label }
    </label>
  </CheckboxCustomStyled>
