import {
  type ChangeEvent,
  type FunctionComponent,
  useState
} from 'react'
import styled from 'styled-components'
import { InchesInputStyles } from './InchesInputStyles'
import { NumberCustom } from '../../common/number-custom/NumberCustom'

const InchesInputStyled = styled.fieldset`${InchesInputStyles}`

interface InchesInputPropsType {
  id: string
  /** Rejects totals at or below 0, for sizes rather than positions. */
  isPositive?: boolean
  label: string
  onChange: (inches: number) => void
  value: number
}

const splitInches = (inches: number): { feet: string, inches: string } => {
  const feet = Math.floor(inches / 12)

  return { feet: String(feet), inches: String(inches - feet * 12) }
}

/* A blank field counts as 0, so either part can be left empty. */
const parsePart = (text: string): number => text.trim() ? Number(text) : 0

const combine = (
  feet: string,
  inches: string
): number => Math.round(parsePart(feet) * 12 + parsePart(inches))

/* A length typed as feet and inches, reported as a total in whole inches. Each field holds
   what is typed, even blank or more than 12 inches, and follows value when that changes from
   outside, such as a drag. */
export const InchesInput: FunctionComponent<InchesInputPropsType> = ({
  id,
  isPositive,
  label,
  onChange,
  value
}) => {
  const [ parts, setParts ] = useState(() => splitInches(value))
  const [ lastValue, setLastValue ] = useState(value)

  if (value !== lastValue) {
    setLastValue(value)
    if (combine(
      parts.feet,
      parts.inches
    ) !== value) setParts(splitInches(value))
  }

  const handleChange = (part: 'feet' | 'inches') => (event: ChangeEvent<HTMLInputElement>): void => {
    const nextParts = { ...parts, [part]: event.target.value }
    const feet = parsePart(nextParts.feet)
    const inches = parsePart(nextParts.inches)
    const total = combine(
      nextParts.feet,
      nextParts.inches
    )

    setParts(nextParts)

    if (!Number.isFinite(total) || feet < 0 || inches < 0) return
    if (isPositive ? total <= 0 : total < 0) return

    onChange(total)
  }

  return (
    <InchesInputStyled>
      <legend className='inches-input-label'>{ label }</legend>
      <div className='inches-input-parts'>
        <NumberCustom
          id={`${id}-feet`}
          isLabelHidden
          label={`${label}, feet`}
          min={0}
          onChange={handleChange('feet')}
          value={parts.feet}
        />
        <span
          aria-hidden
          className='inches-input-unit'
        >
          ft
        </span>
        <NumberCustom
          id={`${id}-inches`}
          isLabelHidden
          label={`${label}, inches`}
          min={0}
          onChange={handleChange('inches')}
          value={parts.inches}
        />
        <span
          aria-hidden
          className='inches-input-unit'
        >
          in
        </span>
      </div>
    </InchesInputStyled>
  )
}
