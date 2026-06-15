import { type FunctionComponent, type ChangeEventHandler } from 'react'
import styled from 'styled-components'
import { SelectCustomStyles } from './SelectCustomStyles'

const SelectCustomStyled = styled.div`${SelectCustomStyles}`

interface SelectOption {
  label: string
  value: string
}

interface SelectCustomPropsType {
  id: string
  label: string
  onChange: ChangeEventHandler<HTMLSelectElement>
  options: SelectOption[]
  value: string
}

export const SelectCustom: FunctionComponent<SelectCustomPropsType> = ({
  id,
  label,
  onChange,
  options,
  value
}) =>
  <SelectCustomStyled>
    <label
      className='select-label'
      htmlFor={id}
    >
      { label }
    </label>
    <select
      className='select-input'
      id={id}
      onChange={onChange}
      value={value}
    >
      { options.map(opt => (
        <option
          key={opt.value}
          value={opt.value}
        >
          { opt.label }
        </option>
      )) }
    </select>
  </SelectCustomStyled>
