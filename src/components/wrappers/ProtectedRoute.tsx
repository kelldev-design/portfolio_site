import { useEffect, type ReactElement, type ReactNode, useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PortfolioContext } from './PortfolioContextProvider'
import { LoadingContent } from '../common/loading-content/LoadingContent'

interface ProtectedRouteProps {
  children: ReactElement
}

const ProtectedRoute = ({ children }: ProtectedRouteProps): ReactNode => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isLoggedIn } = useContext(PortfolioContext)

  useEffect(
    () => {
      if (isLoggedIn === false) {
        navigate(
          '/login',
          { state: { from: location } }
        )
      }
    },
    [
      isLoggedIn,
      location,
      navigate
    ]
  )

  if (isLoggedIn === null) return <LoadingContent />
  if (isLoggedIn) return children
}

export default ProtectedRoute
