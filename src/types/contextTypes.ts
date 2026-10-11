import {
  type Dispatch,
  type SetStateAction
} from 'react'
import { type PortfolioItem } from './generatedGQLTypes'
import {
  type HandleNavigationFunctionType,
  type TrueMapType
} from './sharedTypes'

export type PortfolioMapType = Record<string, PortfolioItem>

export interface PortfolioContextStateType {
  areHomeImagesLoaded: boolean
  isLoading: boolean
  isLoggedIn: boolean | null
  isMobileNavOpen: boolean
  isNavigating: boolean
  portfolioMap: PortfolioMapType
  projectIds: string[]
  projectImagesPreloaded: TrueMapType
}

export type PortfolioContextValueType = PortfolioContextStateType & {
  handleLogin: (token: string) => void
  handleLogout: () => void
  handleNavigation: HandleNavigationFunctionType
  setIsMobileNavOpen: Dispatch<SetStateAction<boolean>>
  handleNavigationComplete: () => void
}
