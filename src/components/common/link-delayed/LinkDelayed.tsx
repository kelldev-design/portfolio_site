import {
  type FunctionComponent,
  type ReactEventHandler,
  type ReactNode,
  useContext
} from 'react'
import {
  useNavigate,
  useLocation
} from 'react-router-dom'
import { PortfolioContext } from '../../wrappers/PortfolioContextProvider'
import { LinkCustom } from '../link-custom/LinkCustom'

interface LinkDelayedPropsType {
  children: ReactNode
  handleClick?: () => void
  hasLinkStyling?: boolean
  isBlock?: boolean
  tabIndex?: number
  to: string
}

export const LinkDelayed: FunctionComponent<LinkDelayedPropsType> = ({
  children,
  to,
  handleClick,
  isBlock,
  tabIndex,
  hasLinkStyling
}) => {
  const {
    handleNavigation,
    handleNavigationComplete
  } = useContext(PortfolioContext)

  const navigate = useNavigate()
  const location = useLocation()

  const handleLinkClick: ReactEventHandler = event => {
    if (handleClick) {
      handleClick()

      return
    }

    const currentPathName = location?.pathname

    const delay = handleNavigation(
      currentPathName,
      event,
      to
    )

    if (event.defaultPrevented) {
      handleNavigationComplete()

      return
    }

    if (delay === 0) {
      navigate(to)
      handleNavigationComplete()

      return
    }

    event.preventDefault()

    setTimeout(
      () => {
        navigate(to)
        handleNavigationComplete()
      },
      delay
    )
  }

  return (
    <LinkCustom
      hasLinkStyling={hasLinkStyling}
      isBlock={isBlock}
      onClick={handleLinkClick}
      tabIndex={tabIndex}
      to={to}
    >
      { children }
    </LinkCustom>
  )
}
