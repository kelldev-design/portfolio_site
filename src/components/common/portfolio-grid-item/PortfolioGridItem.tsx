import { type FunctionComponent, useMemo } from 'react'
import styled from 'styled-components'
import { PortfolioGridItemStyles } from './PortfolioGridItemStyles'
import { Image } from '../image/Image'
import { LinkDelayed } from '../link-delayed/LinkDelayed'

const PortfolioGridItemStyled = styled.div`
  ${PortfolioGridItemStyles}
`

interface PortfolioGridItemPropsType {
  homeImage: string
  projectId: string
  name: string
  year?: number | null
}

export const PortfolioGridItem: FunctionComponent<PortfolioGridItemPropsType> = ({
  homeImage,
  projectId,
  name,
  year,
  ...rest
}) => useMemo(
  () => (
    <PortfolioGridItemStyled {...rest}>
      <div className='image-wrapper'>
        <LinkDelayed
          isBlock
          to={`/project/${projectId}`}
        >
          <Image
            altText={name}
            aspectRatio='1 / 1'
            src={homeImage}
          />
          <div
            aria-hidden='true'
            className='hover-overlay'
          >
            <span className='hover-overlay-name'>{ name }</span>
            { year != null && <span className='hover-overlay-year'>{ year }</span> }
          </div>
        </LinkDelayed>
      </div>
    </PortfolioGridItemStyled>
  ),
  // `rest` is a fresh object on every render, so including it would defeat the
  // memo entirely. Deliberately omitted.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [
    homeImage,
    projectId,
    name,
    year
  ]
)
