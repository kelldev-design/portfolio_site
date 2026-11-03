import { type FunctionComponent, type ReactElement, useContext } from 'react'
import styled from 'styled-components'
import { HeaderStyles } from './HeaderStyles'
import { kelldevDesignLogo } from '../../../utils/constants/imageLinksCdn'
import { deriveAspectRatioFromImageUrl } from '../../../utils/helpers'
import { Image } from '../../common/image/Image'
import { LinkDelayed } from '../../common/link-delayed/LinkDelayed'
import { PortfolioContext } from '../../wrappers/PortfolioContextProvider'
import { Container } from '../container/Container'
import { NavMenu } from '../nav-menu/NavMenu'
import { NavMenuMobile } from '../nav-menu-mobile/NavMenuMobile'
import { PageRow } from '../page-row/PageRow'
import { Spacer } from '../spacer/Spacer'

const HeaderStyled = styled.div`${HeaderStyles}`

export const Header: FunctionComponent = () => {
  const { projectImagesPreloaded } = useContext(PortfolioContext)
  const aspectRatio = deriveAspectRatioFromImageUrl(kelldevDesignLogo)

  const renderHeaderLogo = (): ReactElement =>
    <div className='logo-wrapper'>
      <div className={`${projectImagesPreloaded[kelldevDesignLogo] ? 'fade-in' : ''} logo-link-wrapper`}>
        <LinkDelayed
          isBlock
          to='/'
        >
          <Image
            altText='Kelleghan Design homepage'
            aspectRatio={aspectRatio ?? undefined}
            isEager
            src={kelldevDesignLogo}
          />
        </LinkDelayed>
      </div>
    </div>

  return (
    <PageRow>
      <Container>
        <HeaderStyled>
          <Spacer
            l={3}
            r={3}
          >
            <div className='header-wrapper desktop-header'>
              { renderHeaderLogo() }
              <div className='fade-in nav-wrapper'>
                <NavMenu />
              </div>
            </div>
          </Spacer>
        </HeaderStyled>
        <HeaderStyled className='mobile-header-content'>
          <Spacer
            l={3}
            r={3}
          >
            <div className='header-wrapper'>
              { renderHeaderLogo() }
              <div className='fade-in nav-wrapper'>
                <NavMenuMobile />
              </div>
            </div>
          </Spacer>
        </HeaderStyled>
      </Container>
    </PageRow>
  )
}
