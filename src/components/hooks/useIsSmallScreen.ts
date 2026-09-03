import { useEffect, useState } from 'react'
import { XSMALL_MAX } from '../../utils/constants/breakpoints'

export const useIsSmallScreen = (): boolean => {
  const query = `(max-width: ${XSMALL_MAX})`
  const [ isSmallScreen, setIsSmallScreen ] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  )

  useEffect(
    () => {
      const mediaQueryList = window.matchMedia(query)
      const handleChange = (event: MediaQueryListEvent): void => { setIsSmallScreen(event.matches) }

      setIsSmallScreen(mediaQueryList.matches)
      mediaQueryList.addEventListener(
        'change',
        handleChange
      )

      return () => {
        mediaQueryList.removeEventListener(
          'change',
          handleChange
        )
      }
    },
    [ query ]
  )

  return isSmallScreen
}
