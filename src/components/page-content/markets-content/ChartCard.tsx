import { type FunctionComponent, type ReactNode } from 'react'
import styled from 'styled-components'
import { ChartCardStyles } from './ChartCardStyles'
import { TagH } from '../../common/tag-h/TagH'
import { FlexWrapper } from '../../layout/flex-wrapper/FlexWrapper'
import { Spacer } from '../../layout/spacer/Spacer'

const ChartCardStyled = styled.div`${ChartCardStyles}`

interface ChartCardProps {
  description: string
  title: string
  children: ReactNode
}

export const ChartCard: FunctionComponent<ChartCardProps> = ({
  children,
  description,
  title
}) =>
  <FlexWrapper
    backgroundColor='#fff'
    hasShadow
  >
    <Spacer
      b={2.5}
      isFlex
      l={2.5}
      r={2.5}
      t={2.5}
    >
      <FlexWrapper flexColumn>
        <ChartCardStyled>
          <div className='chart-card-heading'>
            <TagH size={2}>
              { title }
            </TagH>
          </div>
          <p className='chart-card-description'>
            { description }
          </p>
          { children }
        </ChartCardStyled>
      </FlexWrapper>
    </Spacer>
  </FlexWrapper>
