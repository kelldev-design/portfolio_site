import {
  type FunctionComponent,
  type ReactElement
} from 'react'
import styled from 'styled-components'
import { JsonViewerStyles } from './JsonViewerStyles'

const JsonViewerStyled = styled.div`${JsonViewerStyles}`

export type JsonValueType = string | number | boolean | null | JsonValueType[] | { [key: string]: JsonValueType }

interface JsonViewerPropsType {
  /** How many levels start open; deeper objects and arrays start collapsed. */
  openDepth?: number
  value: JsonValueType
}

const renderPrimitive = (value: string | number | boolean | null): ReactElement => {
  if (value === null) return <span className='json-viewer-null'>null</span>
  if (typeof value === 'string') return <span className='json-viewer-string'>{ JSON.stringify(value) }</span>
  if (typeof value === 'number') return <span className='json-viewer-number'>{ value }</span>

  return <span className='json-viewer-boolean'>{ String(value) }</span>
}

/* A read only tree of JSON, each object and array opening and closing on its own. */
export const JsonViewer: FunctionComponent<JsonViewerPropsType> = ({
  openDepth = 1,
  value
}) => {
  const renderValue = (
    current: JsonValueType,
    depth: number,
    label?: ReactElement
  ): ReactElement => {
    if (current === null || typeof current !== 'object') {
      return (
        <div className='json-viewer-line'>
          { label }
          { renderPrimitive(current) }
        </div>
      )
    }

    const isArray = Array.isArray(current)
    const entries = isArray ? current.map((item, index) => [ String(index), item ] as const) : Object.entries(current)
    const [ open, close ] = isArray ? [ '[', ']' ] : [ '{', '}' ]

    if (!entries.length) {
      return (
        <div className='json-viewer-line'>
          { label }
          { `${open}${close}` }
        </div>
      )
    }

    return (
      <details
        className='json-viewer-node'
        open={depth < openDepth}
      >
        <summary className='json-viewer-line'>
          { label }
          { open }
          <span className='json-viewer-count'>
            { ` ${entries.length} ${isArray ? 'items' : 'keys'} ${close}` }
          </span>
        </summary>
        <div className='json-viewer-children'>
          { entries.map(([ key, child ]) =>
            <div key={key}>
              { renderValue(
                child,
                depth + 1,
                isArray
                  ? <span className='json-viewer-index'>{ `${key}: ` }</span>
                  : <span className='json-viewer-key'>{ `${JSON.stringify(key)}: ` }</span>
              ) }
            </div>) }
        </div>
        <div className='json-viewer-line json-viewer-close'>{ close }</div>
      </details>
    )
  }

  return (
    <JsonViewerStyled>
      { renderValue(
        value,
        0
      ) }
    </JsonViewerStyled>
  )
}
