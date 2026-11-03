import { type FunctionComponent } from 'react'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { NavMenuItemStyles } from './NavMenuItemStyles'
import { LinkDelayed } from '../../common/link-delayed/LinkDelayed'

const NavMenuItemStyled = styled.div`${NavMenuItemStyles}`

interface NavMenuItemProps {
  // Omitted for actions like Logout: the item renders as a button and is never shown as the current page.
  toUrl?: string
  text: string
  handleClick?: () => void
  tabIndex?: number
}

export const NavMenuItem: FunctionComponent<NavMenuItemProps> = ({
  toUrl,
  text,
  handleClick,
  tabIndex
}) => {
  const location = useLocation()
  const navMenuItemClassname = toUrl !== undefined && location?.pathname === toUrl ? 'selected' : ''

  if (toUrl === undefined) {
    return (
      <NavMenuItemStyled>
        <button
          className='nav-menu-button'
          onClick={handleClick}
          tabIndex={tabIndex}
          type='button'
        >
          { text }
        </button>
      </NavMenuItemStyled>
    )
  }

  return (
    <NavMenuItemStyled className={navMenuItemClassname}>
      <LinkDelayed
        handleClick={handleClick}
        tabIndex={tabIndex}
        to={toUrl}
      >
        { text }
      </LinkDelayed>
    </NavMenuItemStyled>
  )
}
