import React,
{
  type ReactElement,
  useEffect,
  useState,
  type FunctionComponent
} from 'react'
import { useApolloClient, useQuery } from '@apollo/client'
import { useLocation } from 'react-router-dom'
import { GET_PORTFOLIO_ITEMS } from '../../queries/graphQL'
import {
  type PortfolioContextStateType,
  type PortfolioContextValueType,
  type PortfolioMapType
} from '../../types/contextTypes'
import { type PortfolioItem } from '../../types/generatedGQLTypes'
import {
  type HandleNavigationFunctionType,
  type ImageLoadCallbackType,
  type TrueMapType
} from '../../types/sharedTypes'
import {
  clearAuthToken,
  hasValidAuthToken,
  setAuthToken
} from '../../utils/auth'
import { kelldevDesignLogo } from '../../utils/constants/imageLinksCdn'
import {
  preloadImagesSet,
  preloadImagesIndividual,
  scrollToTop
} from '../../utils/helpers'
import { LoadingOverlay } from '../common/loading-overlay/LoadingOverlay'

const intialPortfolioContextState: PortfolioContextStateType = {
  areHomeImagesLoaded: false,
  isLoading: true,
  isLoggedIn: null,
  isMobileNavOpen: false,
  isNavigating: false,
  portfolioMap: {},
  projectIds: [],
  projectImagesPreloaded: {}
}

const PortfolioContext = React.createContext<PortfolioContextStateType>(intialPortfolioContextState)

interface PortfolioContextProviderProps {
  children: ReactElement
}

const PortfolioContextProvider: FunctionComponent<PortfolioContextProviderProps> = ({ children }) => {
  const { data: portfolioDataResponse } = useQuery(GET_PORTFOLIO_ITEMS)
  const apolloClient = useApolloClient()
  const [ areHomeImagesLoaded, setAreHomeImagesLoaded ] = useState(intialPortfolioContextState.areHomeImagesLoaded)
  const [ isLoading, setIsLoading ] = useState(intialPortfolioContextState.isLoading)
  const [ isMobileNavOpen, setIsMobileNavOpen ] = useState(intialPortfolioContextState.isMobileNavOpen)
  const [ isNavigating, setIsNavigating ] = useState(intialPortfolioContextState.isNavigating)
  const [ isLoggedIn, setIsLoggedIn ] = useState<boolean | null>(intialPortfolioContextState.isLoggedIn)
  const [ portfolioMap, setPortfolioMap ] = useState(intialPortfolioContextState.portfolioMap)
  const [ projectIds, setProjectIds ] = useState(intialPortfolioContextState.projectIds)
  const [ projectImagesPreloaded, setProjectImagesPreloaded ] = useState(intialPortfolioContextState.projectImagesPreloaded)
  const location = useLocation()

  const portfolioPaths: TrueMapType = {
    '/': true,
    '/design': true,
    '/development': true
  }

  const getProjectPathId = (path: string): string => {
    const pathSplit = path.split('/')

    return pathSplit[1] === 'project' ? pathSplit[2] || '' : ''
  }

  const imageLoadCallback: ImageLoadCallbackType = imageUrl => {
    setProjectImagesPreloaded(prevState => ({ ...prevState, [imageUrl]: true }))
  }

  useEffect(
    () => { setIsLoggedIn(hasValidAuthToken()) },
    []
  )

  const handleLogin = (token: string): void => {
    setAuthToken(token)
    setIsLoggedIn(true)
  }

  const handleLogout = (): void => {
    clearAuthToken()
    setIsLoggedIn(false)
    void apolloClient.resetStore()
  }

  useEffect(
    () => {
      if (!portfolioDataResponse) return

      const portfolioItems: PortfolioItem[] = portfolioDataResponse?.portfolioItems ?? []
      const projectIds: string[] = []
      const newPortfolioMap: PortfolioMapType = {}
      const currentPathName = location?.pathname
      const homeImagesToPreload = []
      let individualImagesToPreload = [{ imageUrl: kelldevDesignLogo }]

      for (const { projectId, homeImage, ...rest } of portfolioItems) {
        if (projectId && homeImage) {
          projectIds.push(projectId)
          homeImagesToPreload.push(homeImage)
          newPortfolioMap[projectId] = { projectId, homeImage, ...rest }
        }
      }

      const projectId = getProjectPathId(currentPathName)
      const portfolioItem = projectId && newPortfolioMap[projectId]

      if (portfolioItem) {
        individualImagesToPreload = [
          portfolioItem.primaryImage,
          ...individualImagesToPreload,
          ...portfolioItem.projectImages
        ]
      }

      preloadImagesIndividual(
        individualImagesToPreload,
        imageLoadCallback
      )

      void preloadImagesSet(homeImagesToPreload)
        .then(imageUrls => {
          setProjectImagesPreloaded(prevState => ({ ...prevState, ...imageUrls }))
          setAreHomeImagesLoaded(true)
        })

      setPortfolioMap(newPortfolioMap)
      setProjectIds(projectIds)
      setIsLoading(false)
    },
    [ portfolioDataResponse, location ]
  )

  const handleNavigation: HandleNavigationFunctionType = (
    currentPathName,
    event,
    to
  ) => {
    if (
      !portfolioPaths[currentPathName] ||
      !portfolioPaths[to]
    ) {
      setIsNavigating(true)

      const projectId = getProjectPathId(to)
      const portfolioItem = portfolioMap[projectId]

      if (portfolioItem) {
        preloadImagesIndividual(
          [
            portfolioItem.primaryImage,
            ...portfolioItem.projectImages
          ],
          imageLoadCallback
        )
      }

      return 200
    } else if (currentPathName === to) {
      event.preventDefault()
    }

    return 0
  }

  const handleNavigationComplete = (): void => {
    scrollToTop()
    setIsNavigating(false)
  }

  const contextValue: PortfolioContextValueType = {
    areHomeImagesLoaded,
    handleLogin,
    handleLogout,
    handleNavigation,
    handleNavigationComplete,
    isLoading,
    isLoggedIn,
    isMobileNavOpen,
    isNavigating,
    portfolioMap,
    projectIds,
    projectImagesPreloaded,
    setIsMobileNavOpen
  }

  return (
    <PortfolioContext.Provider value={contextValue}>
      { isLoading && <LoadingOverlay /> }
      { children }
    </PortfolioContext.Provider>
  )
}

export { PortfolioContext, PortfolioContextProvider }
