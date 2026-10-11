import {
  type FunctionComponent,
  type ReactElement,
  type ReactEventHandler,
  useCallback,
  useContext,
  useRef,
  useState
} from 'react'
import { Flipped, Flipper } from 'react-flip-toolkit'
import styled from 'styled-components'
import { NavMenuMobileStyles } from './NavMenuMobileStyles'
import { type PortfolioContextValueType } from '../../../types/contextTypes'
import { ButtonCustom } from '../../common/button-custom/ButtonCustom'
import { useClickOutsideRefHandler } from '../../hooks/useClickOutsideRefHandler'
import { PortfolioContext } from '../../wrappers/PortfolioContextProvider'
import { NavMenuItem } from '../nav-menu-item/NavMenuItem'
import { Spacer } from '../spacer/Spacer'

const NavMenuMobileStyled = styled.div`${NavMenuMobileStyles}`

export const NavMenuMobile: FunctionComponent = () => {
  const {
    handleLogout,
    isLoggedIn
  } = useContext(PortfolioContext) as PortfolioContextValueType

  const [ isNavOpen, setIsNavOpen ] = useState(false)
  const wrapperRef = useRef(null)

  const closeMenu = useCallback(
    (): void => {
      if (isNavOpen) setIsNavOpen(false)
    },
    [ isNavOpen ]
  )

  const handleLinkClick = (): void => { closeMenu() }

  const handleLogoutClick = (): void => {
    handleLogout()
    closeMenu()
  }

  useClickOutsideRefHandler(
    wrapperRef,
    closeMenu
  )

  const handleClick: ReactEventHandler = e => {
    e.stopPropagation()
    setIsNavOpen(!isNavOpen)
  }

  const renderNavItems = (): ReactElement => {
    const spacerProps = {
      b: 1,
      l: 3,
      r: 3,
      t: 1
    }

    return (
      <>
        <div className='nav-bar-item-wrapper'>
          <Spacer {...spacerProps}>
            <NavMenuItem
              handleClick={handleLinkClick}
              tabIndex={isNavOpen ? 0 : -1}
              text='Development'
              toUrl='/development'
            />
          </Spacer>
        </div>
        <div className='nav-bar-item-wrapper'>
          <Spacer {...spacerProps}>
            <NavMenuItem
              handleClick={handleLinkClick}
              tabIndex={isNavOpen ? 0 : -1}
              text='Design'
              toUrl='/design'
            />
          </Spacer>
        </div>
        <div className='nav-bar-item-wrapper'>
          <Spacer {...spacerProps}>
            <NavMenuItem
              handleClick={handleLinkClick}
              tabIndex={isNavOpen ? 0 : -1}
              text='All'
              toUrl='/'
            />
          </Spacer>
        </div>
        <div className='nav-bar-item-wrapper'>
          <Spacer {...spacerProps}>
            <NavMenuItem
              handleClick={handleLinkClick}
              tabIndex={isNavOpen ? 0 : -1}
              text='Contact'
              toUrl='/contact'
            />
          </Spacer>
        </div>
        {
          isLoggedIn &&
          <>
            <div className='nav-bar-item-wrapper'>
              <Spacer {...spacerProps}>
                <NavMenuItem
                  handleClick={handleLinkClick}
                  tabIndex={isNavOpen ? 0 : -1}
                  text='Admin'
                  toUrl='/admin'
                />
              </Spacer>
            </div>
            <div className='nav-bar-item-wrapper'>
              <Spacer {...spacerProps}>
                <NavMenuItem
                  handleClick={handleLogoutClick}
                  tabIndex={isNavOpen ? 0 : -1}
                  text='Logout'
                  toUrl='/'
                />
              </Spacer>
            </div>
          </>
        }
      </>
    )
  }

  return (
    <NavMenuMobileStyled>
      <div className='hamburger-wrapper'>
        <ButtonCustom
          onClick={handleClick}
          title={isNavOpen ? 'Close nav menu' : 'Open nav menu'}
        >
          <div className='line-wrapper'>
            <div className='hamburger-line' />
            <div className='hamburger-line' />
            <div className='hamburger-line' />
          </div>
        </ButtonCustom>
      </div>
      <Flipper flipKey={isNavOpen}>
        <Flipped flipId='mobile-nav'>
          <nav
            className={`mobile ${isNavOpen ? 'open' : ''}`}
            ref={wrapperRef}
          >
            { renderNavItems() }
          </nav>
        </Flipped>
      </Flipper>
    </NavMenuMobileStyled>
  )
}
