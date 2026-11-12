import {
  type FunctionComponent,
  type MutableRefObject,
  type ReactElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import { type HandleEnterUpdateDelete } from 'flip-toolkit/lib/types'
import { Flipper, Flipped } from 'react-flip-toolkit'
import styled from 'styled-components'
import { PortfolioGridStyles, PortfolioIntroStyles } from './PortfolioGridStyles'
import { LoadingOverlay } from '../../common/loading-overlay/LoadingOverlay'
import { PortfolioGridItem } from '../../common/portfolio-grid-item/PortfolioGridItem'
import { TagP } from '../../common/tag-p/TagP'
import { Container } from '../../layout/container/Container'
import { PageRow } from '../../layout/page-row/PageRow'
import { Spacer } from '../../layout/spacer/Spacer'
import { PortfolioContext } from '../../wrappers/PortfolioContextProvider'

const PortfolioGridStyled = styled.div`${PortfolioGridStyles}`
const PortfolioIntroStyled = styled.div`${PortfolioIntroStyles}`

const H1_BY_FILTER: Record<string, string> = {
  '': 'Kelldev.Design — design and development portfolio by Coleman Kelleghan',
  design: 'Kelldev.Design — design portfolio by Coleman Kelleghan',
  development: 'Kelldev.Design — development portfolio by Coleman Kelleghan'
}

interface PortfolioGridProps {
  filter?: string
}

const PortfolioGrid: FunctionComponent<PortfolioGridProps> = ({ filter }) => {
  const [ isInitialLoad, setIsInitialLoad ] = useState(true)
  const {
    portfolioMap,
    projectIds,
    isNavigating,
    areHomeImagesLoaded
  } = useContext(PortfolioContext)

  const loadElement: MutableRefObject<null> = useRef(null)

  useEffect(
    () => { setIsInitialLoad(false) },
    [ loadElement ]
  )

  const handleAppear = (
    appearElement: HTMLElement,
    appearIndex: number
  ): void => {
    setTimeout(
      () => {
        setTimeout(
          () => { appearElement.classList.add('fade-in') },
          appearIndex * 16
        )
      },
      120
    )
  }

  const handleExit = (
    exitElement: HTMLElement,
    _exitIndex: number,
    removeElement: () => void
  ): void => {
    exitElement.classList.add('fade-out')

    setTimeout(
      removeElement,
      200
    )
  }

  const handleEnterUpdateDeleteProp: HandleEnterUpdateDelete = useCallback(
    ({
      hideEnteringElements,
      animateEnteringElements,
      animateExitingElements,
      animateFlippedElements
    }) => {
      hideEnteringElements()

      void animateExitingElements()
        .then(animateFlippedElements)

      animateEnteringElements()
    },
    []
  )

  const renderPortfolioGrid = (): ReactElement[] => {
    const portfolioGridItems: ReactElement[] = []

    for (let i = 0; i < projectIds.length; i++) {
      const projectId = projectIds[i]
      const portfolioItem = portfolioMap[projectId]

      if (
        !portfolioItem ||
        (
          filter &&
          !portfolioItem?.categories?.find(category => category.name === filter)
        )
      ) continue

      const {
        homeImage,
        name,
        year
      } = portfolioItem

      portfolioGridItems[portfolioGridItems.length] = (
        <Flipped
          flipId={projectId}
          key={projectId}
          onAppear={handleAppear}
          onExit={handleExit}
        >
          <PortfolioGridItem
            homeImage={homeImage.imageUrl}
            name={name}
            projectId={projectId}
            year={year}
          />
        </Flipped>
      )
    }

    return portfolioGridItems
  }

  // flipKey will will trigger reevaluation of items in the grid, triggering animation if they have changed.
  // Key is changed for prejectId length, filter, isInitialLoad, and isNavigating
  const flipKey = `
    ${loadElement.current === null ? '0' : '1'}
    ${projectIds.length}${areHomeImagesLoaded ? '0' : '1'}
    ${filter ?? '1'}
    ${isNavigating ? '1' : '0'}
  `

  return (
    <>
      <h1 className='visually-hidden'>{ Object.prototype.hasOwnProperty.call(
        H1_BY_FILTER,
        filter ?? ''
      )
        ? H1_BY_FILTER[filter ?? '']
        : H1_BY_FILTER[''] }
      </h1>
      { !areHomeImagesLoaded && <LoadingOverlay fadeIn={false} /> }
      <PageRow>
        <Container>
          <Spacer
            l={3}
            r={3}
            t={0}
          >
            <PortfolioIntroStyled className={`fade-in ${isNavigating ? 'fade-out' : ''}`}>
              <Spacer
                b={2.5}
                l={0}
                r={0}
                t={0}
              >
                <TagP>
                    A collection of work spanning design and engineering, from client collaborations and full-stack applications to independent products and creative experiments.
                </TagP>
              </Spacer>
            </PortfolioIntroStyled>
            <Flipper
              flipKey={flipKey}
              handleEnterUpdateDelete={handleEnterUpdateDeleteProp}
              spring={{
                stiffness: 1190,
                damping: 120
              }}
            >
              <div ref={loadElement}>
                <PortfolioGridStyled>
                  {
                    (
                      isInitialLoad ||
                      isNavigating ||
                      !areHomeImagesLoaded
                    )
                      ? null
                      : renderPortfolioGrid()
                  }
                </PortfolioGridStyled>
              </div>
            </Flipper>
          </Spacer>
        </Container>
      </PageRow>
    </>
  )
}

export default PortfolioGrid
